#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const todosDir = path.join(__dirname, '..', 'todos');

try {
  if (!fs.existsSync(todosDir)) {
    console.log('✅ todosディレクトリが存在しません');
    process.exit(0);
  }

  const files = fs.readdirSync(todosDir);
  const todoFiles = files.filter(file => file.endsWith('.md') || file.endsWith('.meta.json'));

  if (todoFiles.length === 0) {
    console.log('✅ 削除するサンプルTODOはありません');
    process.exit(0);
  }

  console.log(`🗑️  ${todoFiles.length}個のサンプルTODOファイルを削除します...`);

  todoFiles.forEach(file => {
    const filePath = path.join(todosDir, file);
    fs.unlinkSync(filePath);
    console.log(`   削除: ${file}`);
  });

  console.log('✅ すべてのサンプルTODOを削除しました');
  console.log('💡 アプリケーションを再起動してください');

} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
}