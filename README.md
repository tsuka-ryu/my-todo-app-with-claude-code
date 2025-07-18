# TODO管理

シンプルなマークダウンベースのTODO管理アプリケーション

## 使い方

1. リポジトリをクローン

```bash
npx degit git@github.com:tsuka-ryu/my-todo-app-with-claude-code.git my-todo-app
cd my-todo-app
```

2. Gitリポジトリを初期化

```bash
git init
git add .
git commit -m "Initial commit"
```

3. 依存関係をインストール

```bash
npm install
```

4. 開発サーバーを起動

```bash
npm run dev
```

5. ブラウザで [http://localhost:3333](http://localhost:3333) を開く

## ポート設定

デフォルトでポート3333を使用しています。変更したい場合は：

- `.env.local`ファイルの`PORT`を変更
- または環境変数で指定: `PORT=8080 npm run dev`

## サンプルTODOの削除

アプリケーションには初期状態でサンプルTODOが含まれています。これらを削除するには：

```bash
npm run clean:todos
```

## AI開発について

このリポジトリではClaude CodeやCursorなどのAI開発ツールを活用して開発を進めることができます。`CLAUDE.md`にプロジェクトの構造と開発指針が記載されているので、AIツールがコードベースを理解しやすくなっています。
