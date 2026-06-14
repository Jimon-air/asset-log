---
description: asset-log アプリの起動・動作確認方法
---

# asset-log の起動・動作確認

## 起動コマンド

```bash
npm run dev
# → http://localhost:3000 で起動
```

## 重要な制約

**ブラウザ自動操作（Claude in Chrome等）での動作確認は不可。**

理由：Supabase Auth（メール/パスワード認証）が必須のため、
ログインページ（/login）にリダイレクトされてしまい、
認証が通らないと全ページにアクセスできない。

## 代替テスト方法

### 1. API を直接 node で叩く（外部API・Gemini等のテストに有効）

```bash
GEMINI_API_KEY=$(grep GEMINI_API_KEY .env.local | cut -d= -f2-)
GEMINI_MODEL=$(grep GEMINI_MODEL .env.local | cut -d= -f2-)

node -e "
fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${process.env.MODEL}:generateContent?key=\${process.env.KEY}\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'テスト' }] }] }),
}).then(r => r.json()).then(console.log)
" KEY=$GEMINI_API_KEY MODEL=$GEMINI_MODEL
```

### 2. Supabase MCP でDBの状態を直接確認

project_id: `tgjegridktogyophnuvl`

```sql
SELECT * FROM asset_snapshots ORDER BY created_at DESC LIMIT 5;
SELECT * FROM stock_holdings ORDER BY created_at DESC LIMIT 5;
```

### 3. ビルド確認（型エラー・コンパイルエラーの検出）

```bash
npm run build
```

## 環境変数（.env.local に設定が必要）

| 変数名 | 用途 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase プロジェクト URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名キー |
| GEMINI_API_KEY | Gemini API キー |
| GEMINI_MODEL | モデル名（例: gemini-2.5-flash-lite） |
