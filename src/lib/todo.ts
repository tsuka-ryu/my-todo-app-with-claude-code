import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Todo, TodoMeta, CreateTodoRequest, UpdateTodoRequest } from './types';

const TODOS_DIR = path.join(process.cwd(), 'todos');

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
  const titleLine = lines.find(line => line.startsWith('# '));
  return titleLine ? titleLine.replace('# ', '').trim() : 'Untitled';
}

// マークダウンコンテンツからタイトル行を除去するヘルパー関数
function removeTitleFromMarkdown(content: string): string {
  const lines = content.split('\n');
  const titleIndex = lines.findIndex(line => line.startsWith('# '));
  if (titleIndex === 0) {
    // 最初の行がタイトルの場合、タイトル行と次の空行も削除
    return lines.slice(titleIndex + 1).join('\n').replace(/^\n+/, '');
  }
  return content;
}

export async function getAllTodos(): Promise<Todo[]> {
  await ensureTodosDir();
  
  const files = await fs.readdir(TODOS_DIR);
  const metaFiles = files.filter(file => file.endsWith('.meta.json'));
  
  const todos: Todo[] = [];
  
  for (const metaFile of metaFiles) {
    const id = metaFile.replace('.meta.json', '');
    const mdFile = `${id}.md`;
    
    try {
      const metaPath = path.join(TODOS_DIR, metaFile);
      const mdPath = path.join(TODOS_DIR, mdFile);
      
      const [metaContent, mdContent] = await Promise.all([
        fs.readFile(metaPath, 'utf-8'),
        fs.readFile(mdPath, 'utf-8')
      ]);
      
      // eslint-disable-next-line prefer-const
      let meta: TodoMeta = JSON.parse(metaContent);
      
      // titleフィールドがない場合は、マークダウンから抽出して追加
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
    const metaPath = path.join(TODOS_DIR, `${id}.meta.json`);
    const mdPath = path.join(TODOS_DIR, `${id}.md`);
    
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
    section: request.section || 'today'
  };
  
  const metaPath = path.join(TODOS_DIR, `${id}.meta.json`);
  const mdPath = path.join(TODOS_DIR, `${id}.md`);
  
  await Promise.all([
    fs.writeFile(metaPath, JSON.stringify(meta, null, 2)),
    fs.writeFile(mdPath, request.content)
  ]);
  
  return { meta, content: request.content };
}

export async function updateTodo(id: string, request: UpdateTodoRequest): Promise<Todo | null> {
  const existingTodo = await getTodoById(id);
  if (!existingTodo) return null;
  
  const updatedMeta: TodoMeta = {
    ...existingTodo.meta,
    ...request,
    updatedAt: new Date().toISOString()
  };
  
  const updatedContent = request.content !== undefined ? request.content : existingTodo.content;
  
  const metaPath = path.join(TODOS_DIR, `${id}.meta.json`);
  const mdPath = path.join(TODOS_DIR, `${id}.md`);
  
  await Promise.all([
    fs.writeFile(metaPath, JSON.stringify(updatedMeta, null, 2)),
    fs.writeFile(mdPath, updatedContent)
  ]);
  
  return { meta: updatedMeta, content: updatedContent };
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    const metaPath = path.join(TODOS_DIR, `${id}.meta.json`);
    const mdPath = path.join(TODOS_DIR, `${id}.md`);
    
    await Promise.all([
      fs.unlink(metaPath),
      fs.unlink(mdPath)
    ]);
    
    return true;
  } catch {
    return false;
  }
}

export async function reorderTodos(
  sourceIndex: number,
  destinationIndex: number,
  sourceSection: string,
  destinationSection: string
): Promise<Todo[]> {
  const todos = await getAllTodos();
  
  if (sourceSection === destinationSection) {
    // 同じセクション内での並び替え
    const sectionTodos = todos.filter(todo => todo.meta.section === sourceSection);
    const [movedTodo] = sectionTodos.splice(sourceIndex, 1);
    sectionTodos.splice(destinationIndex, 0, movedTodo);
    
    // order値を更新
    for (let i = 0; i < sectionTodos.length; i++) {
      sectionTodos[i].meta.order = i + 1;
      sectionTodos[i].meta.updatedAt = new Date().toISOString();
      
      const metaPath = path.join(TODOS_DIR, `${sectionTodos[i].meta.id}.meta.json`);
      await fs.writeFile(metaPath, JSON.stringify(sectionTodos[i].meta, null, 2));
    }
  } else {
    // 異なるセクション間での移動
    const sourceTodos = todos.filter(todo => todo.meta.section === sourceSection);
    const destTodos = todos.filter(todo => todo.meta.section === destinationSection);
    
    const [movedTodo] = sourceTodos.splice(sourceIndex, 1);
    movedTodo.meta.section = destinationSection as 'today' | 'week' | 'longterm';
    destTodos.splice(destinationIndex, 0, movedTodo);
    
    // 両方のセクションのorder値を更新
    for (let i = 0; i < sourceTodos.length; i++) {
      sourceTodos[i].meta.order = i + 1;
      sourceTodos[i].meta.updatedAt = new Date().toISOString();
      
      const metaPath = path.join(TODOS_DIR, `${sourceTodos[i].meta.id}.meta.json`);
      await fs.writeFile(metaPath, JSON.stringify(sourceTodos[i].meta, null, 2));
    }
    
    for (let i = 0; i < destTodos.length; i++) {
      destTodos[i].meta.order = i + 1;
      destTodos[i].meta.updatedAt = new Date().toISOString();
      
      const metaPath = path.join(TODOS_DIR, `${destTodos[i].meta.id}.meta.json`);
      await fs.writeFile(metaPath, JSON.stringify(destTodos[i].meta, null, 2));
    }
  }
  
  return getAllTodos();
}