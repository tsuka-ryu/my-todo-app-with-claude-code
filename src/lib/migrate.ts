import fs from 'fs/promises';
import path from 'path';
import type { TodoMeta } from './types';
import { generateSlugFromTitle } from './slug';

const TODOS_DIR = path.join(process.cwd(), 'todos');

/**
 * 既存のTODOファイルにslugフィールドを追加するマイグレーション
 */
export async function migrateExistingTodos(): Promise<void> {
  try {
    const files = await fs.readdir(TODOS_DIR);
    const metaFiles = files.filter(f => f.endsWith('.meta.json'));
    
    console.log(`Found ${metaFiles.length} meta files for migration`);
    
    const slugs = new Set<string>();
    const migratedFiles: string[] = [];
    
    for (const file of metaFiles) {
      try {
        const metaPath = path.join(TODOS_DIR, file);
        const content = await fs.readFile(metaPath, 'utf-8');
        const meta = JSON.parse(content) as TodoMeta;
        
        // 既にslugが存在する場合はスキップ
        if (meta.slug) {
          slugs.add(meta.slug);
          continue;
        }
        
        // タイトルからslugを生成
        const baseSlug = generateSlugFromTitle(meta.title);
        
        // 重複チェック
        let slug = baseSlug;
        let counter = 2;
        while (slugs.has(slug)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // slugが空の場合はタイムスタンプベースにフォールバック
        if (!slug) {
          slug = `todo-${meta.id.substring(0, 8)}`;
        }
        
        slugs.add(slug);
        
        // meta.jsonにslugフィールドを追加
        const updatedMeta = {
          ...meta,
          slug
        };
        
        await fs.writeFile(metaPath, JSON.stringify(updatedMeta, null, 2));
        migratedFiles.push(file);
        
        console.log(`✓ Migrated ${file}: "${meta.title}" -> slug: "${slug}"`);
        
      } catch (error) {
        console.error(`Error migrating ${file}:`, error);
      }
    }
    
    console.log(`Migration completed. ${migratedFiles.length} files migrated.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

/**
 * 重複したslugをチェックして修正
 */
export async function fixDuplicateSlugs(): Promise<void> {
  try {
    const files = await fs.readdir(TODOS_DIR);
    const metaFiles = files.filter(f => f.endsWith('.meta.json'));
    
    const slugMap = new Map<string, string[]>(); // slug -> file paths
    
    // 重複チェック
    for (const file of metaFiles) {
      try {
        const metaPath = path.join(TODOS_DIR, file);
        const content = await fs.readFile(metaPath, 'utf-8');
        const meta = JSON.parse(content) as TodoMeta;
        
        if (meta.slug) {
          if (!slugMap.has(meta.slug)) {
            slugMap.set(meta.slug, []);
          }
          slugMap.get(meta.slug)!.push(file);
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
    
    // 重複を修正
    for (const [slug, files] of slugMap.entries()) {
      if (files.length > 1) {
        console.log(`Found duplicate slug "${slug}" in ${files.length} files`);
        
        // 最初のファイルはそのまま、2番目以降に番号を付ける
        for (let i = 1; i < files.length; i++) {
          const file = files[i];
          const newSlug = `${slug}-${i + 1}`;
          
          try {
            const metaPath = path.join(TODOS_DIR, file);
            const content = await fs.readFile(metaPath, 'utf-8');
            const meta = JSON.parse(content) as TodoMeta;
            
            meta.slug = newSlug;
            await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
            
            console.log(`✓ Fixed duplicate: ${file} -> slug: "${newSlug}"`);
          } catch (error) {
            console.error(`Error fixing ${file}:`, error);
          }
        }
      }
    }
    
    console.log('Duplicate slug fixing completed.');
    
  } catch (error) {
    console.error('Duplicate slug fixing failed:', error);
  }
}

/**
 * マイグレーションの実行
 */
export async function runMigration(): Promise<void> {
  console.log('Starting TODO migration...');
  await migrateExistingTodos();
  await fixDuplicateSlugs();
  console.log('Migration completed!');
}