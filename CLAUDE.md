# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) 向けのガイダンスを提供します。

## 開発コマンド

- `npm run dev` - Turbopackを使った開発サーバー起動（ポート3000）
- `npm run build` - 本番ビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - ESLint実行

## アーキテクチャ概要

このプロジェクトは、ファイルベースのストレージシステムを使用したNext.js 15のTODOアプリケーションです。各TODOは`/todos`ディレクトリ内の2つのファイルで構成されています：
- `{id}.md` - マークダウンコンテンツ
- `{id}.meta.json` - メタデータ（優先度、タグ、完了状態など）

### 主要なアーキテクチャパターン

**データフロー:**
1. Reactコンポーネントはカスタムフック（`useTodos`, `useSearch`）を使ってステート管理
2. フックはNext.js APIルート（`/api/todos/*`）とやり取り
3. APIルートは`/src/lib/todo.ts`のユーティリティを使ってファイルシステム操作
4. データベースなし - シンプルさのための純粋なファイルベースストレージ

**ステート管理:**
- `useTodos`フックが楽観的更新を含むすべてのCRUD操作を処理
- `useSearch`フックがFuse.jsを使った曖昧検索・フィルタリングを管理
- ドラッグ&ドロップ並び替えは@dnd-kitを使って即座のUI更新を実現

**コンポーネント構造:**
- `TodoList` - ドラッグ&ドロップ機能付きメインリスト
- `TodoModal` - スライドアウト式詳細表示・編集インターフェース
- `TodoItem` - リスト内の個別TODO表示
- `SearchBar` / `FilterBar` - 検索・フィルタリングコントロール
- `NewTodoForm` - TODO作成フォーム

### 重要な実装詳細

**TODO組織化:**
- TODOはセクション別に整理: "today", "week", "longterm"
- 各TODOに優先度レベル: "high", "medium", "low"
- タグは文字列配列としてサポート
- orderフィールドがセクション内の表示順序を管理

**TypeScript型定義:**
- コア型は`/src/lib/types.ts`で定義
- `Todo`インターフェースは`TodoMeta`と`content`文字列を結合
- すべてのAPI相互作用は完全に型付け

**UI言語:**
- インターフェースは主に日本語
- 優先度ラベル: 高 (high), 中 (medium), 低 (low)

## ファイルストレージ形式

TODOはペアファイルとして保存されます:
```
/todos/
├── {uuid}.md           # マークダウンコンテンツ
└── {uuid}.meta.json    # JSONメタデータ
```

メタデータ構造にはid、タイムスタンプ、完了状態、優先度、タグ、順序、セクション、オプションの期限日が含まれます。

## 開発ノート

- Tailwind CSS v4とPostCSSを使用
- 厳密モードのTypeScriptとパスエイリアス（`@/*` → `./src/*`）
- React 19とNext.js App Router
- 認証やユーザー管理なし
- ドラッグ&ドロップ機能は楽観的更新とサーバーステート間の競合を避けるため慎重なステート管理が必要