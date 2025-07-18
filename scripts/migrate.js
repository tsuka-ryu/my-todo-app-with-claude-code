const { runMigration } = require('../src/lib/migrate.ts');

// Node.jsでTypeScriptを直接実行するためのラッパー
async function main() {
  try {
    await runMigration();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();