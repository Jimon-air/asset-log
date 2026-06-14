# 開発スタイルガイド

## 基本ルール
- 大きめの実装は必ず実装方針を提示し、合意後にコード変更する
- 1PR1機能（ただし関連する複数改善はフェーズごとにコミットを分けて1PRにまとめてよい）
- 既存実装・命名・UIトーンに合わせる
- 大きなリファクタ・設計変更は勝手にしない
- DB / Auth / RLS / API / 外部連携は先に影響範囲を説明する
- 実装後は動作確認手順を出す
- secret・APIキー・userId等はログ・レスポンス・READMEに絶対出さない

## 役割分担
- Claude Code：コード・ファイル作成・git操作・PR作成・DBマイグレーション（Supabase MCP）
- じもん：`.env.local`記述・PRマージ・Vercelコンソール操作

## MCP活用ルール
- DBスキーマ変更（ALTER TABLE等）は Supabase MCP の `apply_migration` で実行する（コンソール不要）
- PR作成は GitHub MCP の `create_pull_request` で実行する（`gh` CLIは使えない環境のため）
- Vercel MCP が接続されている場合、環境変数の確認・デプロイログの確認もMCP経由で行う

## 技術スタック
- Next.js / TypeScript / Tailwind CSS / Supabase / Recharts / Vercel
- App Router・`src/`ディレクトリ構成

## ブランチ作成ルール
必ず main を pull してからブランチを切ること。
git checkout main && git pull origin main && git checkout -b feature/xxx

## 画面共通ルール
- 各画面には必ずホーム（/）へ戻る導線を設置すること
- フォーム送信後のリダイレクト先は基本的にホーム（/）とする

## ブラケットを含むディレクトリの作成
mkdir でブラケット（[]）を含むパスを作る場合はシングルクォートで囲む。
例：mkdir -p '/path/to/[id]/edit'

## DB構造（asset_snapshots）
- id, user_id, snapshot_month, cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount, total_amount, memo, ai_comment, created_at, updated_at
- unique(user_id, snapshot_month)

## DB構造（stock_holdings）
- id, user_id, name, ticker, shares, purchase_price, current_price, created_at, updated_at

## 動作確認について
- このアプリはSupabase Auth（メール認証）が必須のためブラウザ自動操作での動作確認不可
- 代替手段：APIを直接 node -e で叩く / .env.local の値を参照してローカルテスト
