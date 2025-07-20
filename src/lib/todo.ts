import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Todo, TodoMeta, CreateTodoRequest, UpdateTodoRequest } from './types';
import { 
  generateFilenameFromTitle, 
  generateUniqueFilenameCandidates, 
  generateFallbackFilename 
} from './filename';

const TODOS_DIR = path.join(process.cwd(), 'todos');

/**
 * ファイル名が既存のファイルと重複しないかチェック
 */
async function isFilenameAvailable(filename: string, excludeId?: string): Promise<boolean> {
  try {
    await ensureTodosDir();
    const files = await fs.readdir(TODOS_DIR);
    
    // 同じファイル名のファイルが存在するかチェック
    const metaFilename = `${filename}.meta.json`;
    const mdFilename = `${filename}.md`;
    
    if (files.includes(metaFilename) || files.includes(mdFilename)) {
      // 除外IDが指定されている場合は、そのIDのファイルかチェック
      if (excludeId) {
        try {
          const metaPath = path.join(TODOS_DIR, metaFilename);
          const content = await fs.readFile(metaPath, 'utf-8');
          const meta = JSON.parse(content) as TodoMeta;
          if (meta.id === excludeId) {
            return true; // 同じTODOの更新なのでOK
          }
        } catch {
          // ファイル読み込みエラーは無視
        }
      }
      return false;
    }
    
    return true;
  } catch {
    return true; // エラーの場合は利用可能とみなす
  }
}

/**
 * 利用可能なユニークなファイル名を生成
 */
async function generateUniqueFilename(title: string, excludeId?: string): Promise<string> {
  const baseFilename = generateFilenameFromTitle(title);
  
  // 空の場合はフォールバック
  if (!baseFilename) {
    return generateFallbackFilename();
  }
  
  // 重複チェックとユニーク化
  const candidates = generateUniqueFilenameCandidates(baseFilename);
  
  for (const candidate of candidates) {
    if (await isFilenameAvailable(candidate, excludeId)) {
      return candidate;
    }
  }
  
  // 全ての候補が使用済みの場合はタイムスタンプベースのフォールバック
  return generateFallbackFilename();
}

export async function ensureTodosDir() {
  try {
    await fs.access(TODOS_DIR);
  } catch {
    await fs.mkdir(TODOS_DIR, { recursive: true });
  }
}

// マークダウンコンテンツからタイトルを抽出するヘルパー関数
function extractTitleFromMarkdown(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  return 'Untitled';
}

// マークダウンコンテンツからタイトル行を削除するヘルパー関数
function removeTitleFromMarkdown(content: string): string {
  const lines = content.split('\n');
  const filteredLines = lines.filter((line, index) => {
    // 最初の # タイトルを削除
    if (index === 0 && line.startsWith('# ')) {
      return false;
    }
    return true;
  });
  return filteredLines.join('\n').trim();
}

export async function getAllTodos(): Promise<Todo[]> {
  await ensureTodosDir();
  
  const files = await fs.readdir(TODOS_DIR);
  const metaFiles = files.filter(f => f.endsWith('.meta.json'));
  
  const todos: Todo[] = [];
  
  for (const metaFile of metaFiles) {
    const id = metaFile.replace('.meta.json', '');
    const metaPath = path.join(TODOS_DIR, metaFile);
    const mdPath = path.join(TODOS_DIR, `${id}.md`);
    
    try {
      const [metaContent, mdContent] = await Promise.all([
        fs.readFile(metaPath, 'utf-8'),
        fs.readFile(mdPath, 'utf-8').catch(() => '') // mdファイルがない場合は空文字列
      ]);
      
      const meta: TodoMeta = JSON.parse(metaContent);
      
      // レガシー対応：titleフィールドがない場合は、マークダウンから抽出
      if (!meta.title) {
        meta.title = extractTitleFromMarkdown(mdContent);
        meta.updatedAt = new Date().toISOString();
        
        // メタデータファイルを更新
        await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
        
        // マークダウンファイルからタイトル行を削除
        const cleanContent = removeTitleFromMarkdown(mdContent);
        await fs.writeFile(mdPath, cleanContent);
        
        todos.push({ meta, content: cleanContent });
      } else {
        todos.push({ meta, content: mdContent });
      }
    } catch (error) {
      console.error(`Error reading todo ${id}:`, error);
    }
  }
  
  return todos.sort((a, b) => a.meta.order - b.meta.order);
}

export async function getTodoById(id: string): Promise<Todo | null> {
  try {
    // IDベースでファイルを探す（旧形式）
    const metaPath = path.join(TODOS_DIR, `${id}.meta.json`);
    const mdPath = path.join(TODOS_DIR, `${id}.md`);
    
    const [metaContent, mdContent] = await Promise.all([
      fs.readFile(metaPath, 'utf-8'),
      fs.readFile(mdPath, 'utf-8')
    ]);
    
    const meta: TodoMeta = JSON.parse(metaContent);
    return { meta, content: mdContent };
  } catch {
    // IDで見つからない場合は、全ファイルをスキャンして探す
    const todos = await getAllTodos();
    return todos.find(todo => todo.meta.id === id) || null;
  }
}

export async function getTodoByTitle(title: string): Promise<Todo | null> {
  try {
    await ensureTodosDir();
    const filename = generateFilenameFromTitle(title);
    
    const metaPath = path.join(TODOS_DIR, `${filename}.meta.json`);
    const mdPath = path.join(TODOS_DIR, `${filename}.md`);
    
    const [metaContent, mdContent] = await Promise.all([
      fs.readFile(metaPath, 'utf-8'),
      fs.readFile(mdPath, 'utf-8')
    ]);
    
    const meta: TodoMeta = JSON.parse(metaContent);
    return { meta, content: mdContent };
  } catch {
    return null;
  }
}

export async function createTodo(request: CreateTodoRequest): Promise<Todo> {
  await ensureTodosDir();
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  // ファイル名を生成
  const filename = await generateUniqueFilename(request.title);
  
  // 現在のセクションの最大order値を取得
  const todos = await getAllTodos();
  const sectionTodos = todos.filter(todo => todo.meta.section === (request.section || 'today'));
  const maxOrder = sectionTodos.length > 0 ? Math.max(...sectionTodos.map(t => t.meta.order)) : 0;
  
  const meta: TodoMeta = {
    id,
    title: request.title,
    createdAt: now,
    updatedAt: now,
    completed: false,
    priority: request.priority || 'medium',
    tags: request.tags || [],
    order: maxOrder + 1,
    section: request.section || 'today',
    dueDate: request.dueDate
  };
  
  const metaPath = path.join(TODOS_DIR, `${filename}.meta.json`);
  const mdPath = path.join(TODOS_DIR, `${filename}.md`);
  
  // コンテンツをそのまま保存（BlockNoteが既にマークダウン形式で提供）
  const markdownContent = request.content;
  
  await Promise.all([
    fs.writeFile(metaPath, JSON.stringify(meta, null, 2)),
    fs.writeFile(mdPath, markdownContent)
  ]);
  
  return { meta, content: markdownContent };
}

export async function updateTodo(id: string, request: UpdateTodoRequest): Promise<Todo | null> {
  const existingTodo = await getTodoById(id);
  if (!existingTodo) return null;
  
  // タイトルが変更された場合、ファイル名も変更する必要がある
  const titleChanged = request.title && request.title !== existingTodo.meta.title;
  let newFilename: string | null = null;
  
  if (titleChanged) {
    newFilename = await generateUniqueFilename(request.title!, id);
  }
  
  const updatedMeta: TodoMeta = {
    ...existingTodo.meta,
    ...request,
    updatedAt: new Date().toISOString()
  };
  
  const updatedContent = request.content !== undefined ? request.content : existingTodo.content;
  
  // コンテンツをそのまま保存（BlockNoteが既にマークダウン形式で提供）
  const markdownContent = updatedContent;
  
  if (titleChanged && newFilename) {
    // 古いファイルを探す
    const files = await fs.readdir(TODOS_DIR);
    let oldMetaFile = `${id}.meta.json`;
    let oldMdFile = `${id}.md`;
    
    // IDベースのファイルが存在しない場合、タイトルベースで探す
    if (!files.includes(oldMetaFile)) {
      // 全ファイルをスキャンして該当するIDを持つファイルを探す
      for (const file of files.filter(f => f.endsWith('.meta.json'))) {
        try {
          const metaPath = path.join(TODOS_DIR, file);
          const content = await fs.readFile(metaPath, 'utf-8');
          const meta = JSON.parse(content) as TodoMeta;
          if (meta.id === id) {
            oldMetaFile = file;
            oldMdFile = file.replace('.meta.json', '.md');
            break;
          }
        } catch {
          continue;
        }
      }
    }
    
    // 新しいファイルパス
    const newMetaPath = path.join(TODOS_DIR, `${newFilename}.meta.json`);
    const newMdPath = path.join(TODOS_DIR, `${newFilename}.md`);
    
    // 古いファイルパス
    const oldMetaPath = path.join(TODOS_DIR, oldMetaFile);
    const oldMdPath = path.join(TODOS_DIR, oldMdFile);
    
    // 新しいファイルを作成
    await Promise.all([
      fs.writeFile(newMetaPath, JSON.stringify(updatedMeta, null, 2)),
      fs.writeFile(newMdPath, markdownContent)
    ]);
    
    // 古いファイルを削除
    await Promise.all([
      fs.unlink(oldMetaPath).catch(() => {}),
      fs.unlink(oldMdPath).catch(() => {})
    ]);
  } else {
    // タイトルが変更されていない場合は、既存のファイルを更新
    const files = await fs.readdir(TODOS_DIR);
    let metaFile = `${id}.meta.json`;
    let mdFile = `${id}.md`;
    
    // IDベースのファイルが存在しない場合、該当ファイルを探す
    if (!files.includes(metaFile)) {
      for (const file of files.filter(f => f.endsWith('.meta.json'))) {
        try {
          const metaPath = path.join(TODOS_DIR, file);
          const content = await fs.readFile(metaPath, 'utf-8');
          const meta = JSON.parse(content) as TodoMeta;
          if (meta.id === id) {
            metaFile = file;
            mdFile = file.replace('.meta.json', '.md');
            break;
          }
        } catch {
          continue;
        }
      }
    }
    
    const metaPath = path.join(TODOS_DIR, metaFile);
    const mdPath = path.join(TODOS_DIR, mdFile);
    
    await Promise.all([
      fs.writeFile(metaPath, JSON.stringify(updatedMeta, null, 2)),
      fs.writeFile(mdPath, markdownContent)
    ]);
  }
  
  return { meta: updatedMeta, content: markdownContent };
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    // まずIDベースで削除を試みる
    const metaPath = path.join(TODOS_DIR, `${id}.meta.json`);
    const mdPath = path.join(TODOS_DIR, `${id}.md`);
    
    await Promise.all([
      fs.unlink(metaPath),
      fs.unlink(mdPath)
    ]);
    
    return true;
  } catch {
    // IDベースで見つからない場合、全ファイルをスキャン
    const files = await fs.readdir(TODOS_DIR);
    
    for (const file of files.filter(f => f.endsWith('.meta.json'))) {
      try {
        const metaPath = path.join(TODOS_DIR, file);
        const content = await fs.readFile(metaPath, 'utf-8');
        const meta = JSON.parse(content) as TodoMeta;
        
        if (meta.id === id) {
          const mdFile = file.replace('.meta.json', '.md');
          const mdPath = path.join(TODOS_DIR, mdFile);
          
          await Promise.all([
            fs.unlink(metaPath),
            fs.unlink(mdPath)
          ]);
          
          return true;
        }
      } catch {
        continue;
      }
    }
    
    return false;
  }
}

export async function reorderTodos(sourceId: string, destinationId: string | null, section: string): Promise<void> {
  const todos = await getAllTodos();
  const sectionTodos = todos.filter(todo => todo.meta.section === section);
  
  const sourceIndex = sectionTodos.findIndex(todo => todo.meta.id === sourceId);
  if (sourceIndex === -1) return;
  
  const sourceTodo = sectionTodos[sourceIndex];
  sectionTodos.splice(sourceIndex, 1);
  
  let destinationIndex = sectionTodos.length;
  if (destinationId) {
    destinationIndex = sectionTodos.findIndex(todo => todo.meta.id === destinationId);
    if (destinationIndex === -1) destinationIndex = sectionTodos.length;
  }
  
  sectionTodos.splice(destinationIndex, 0, sourceTodo);
  
  // 順序を更新
  for (let i = 0; i < sectionTodos.length; i++) {
    const todo = sectionTodos[i];
    await updateTodo(todo.meta.id, { order: i + 1 });
  }
}