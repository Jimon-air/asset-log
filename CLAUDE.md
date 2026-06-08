# 開発スタイルガイド

## 基本ルール
- 大きめの実装は必ず実装方針を提示し、合意後にコード変更する
- 1PR1機能
- 既存実装・命名・UIトーンに合わせる
- 大きなリファクタ・設計変更は勝手にしない
- DB / Auth / RLS / API / 外部連携は先に影響範囲を説明する
- 実装後は動作確認手順を出す
- secret・APIキー・userId等はログ・レスポンス・READMEに絶対出さない

## 役割分担
- Claude Code：コード・ファイル作成・git操作・PR作成
- じもん：Supabase/Vercelコンソール操作・`.env.local`記述・PRマージ

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
- id, user_id, snapshot_month, cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount, total_amount, memo, created_at, updated_at
- unique(user_id, snapshot_month)
