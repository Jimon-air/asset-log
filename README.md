# asset-log

資産の推移を月次で記録・可視化する個人向け資産管理アプリです。

🔗 **本番URL**: https://asset-log-jet.vercel.app

---

## スクリーンショット

| ホーム | 新規入力 | 設定 |
|---|---|---|
| ![ホーム画面](public/screenshots/home.png) | ![新規入力画面](public/screenshots/new.png) | ![設定画面](public/screenshots/settings.png) |

---

## 機能一覧

### 資産スナップショット
- **月次スナップショット記録** — 現金・投資信託・株・買付余力・その他の5カテゴリで資産を入力
- **先月の値をコピー** — 新規入力時に前月の値を引用して入力の手間を削減
- **スナップショット詳細ページ** — カテゴリ構成を円グラフで表示
- **編集・削除** — 過去データの修正・削除に対応（削除はインライン確認UI）
- **CSVエクスポート** — 履歴をBOM付きUTF-8 CSVでダウンロード（Excel対応）

### グラフ・分析
- **積み上げ棒グラフ** — Rechartsによるカテゴリ別・月別の資産推移可視化
- **目標資産額の設定** — 目標ラインをグラフ上に表示し、達成率・到達予測月数を表示
- **前月比表示** — 履歴テーブルで月ごとの増減率を確認

### AI機能（Gemini API）
- **AIコメント** — スナップショット登録・更新時に、資産状況に応じたコメントを自動生成
- **トレンドAIサマリー** — 直近最大6ヶ月のデータをもとにしたトレンド総括をボタン押下で生成

### 保有銘柄管理
- **保有銘柄の記録** — 銘柄名・コード・株数・取得単価・現在価格を管理
- **含み損益表示** — 現在価格を入力すると評価額・含み損益・損益率を自動計算

### 通知
- **月次LINE通知** — Vercel Cronで毎月1日に総資産・前月比・目標達成予測をLINEへプッシュ送信

### 基盤
- **認証** — Supabase Auth によるメール/パスワードログイン
- **モバイル対応** — スマホでは履歴をカード表示に切り替え
- **エラー・ローディングUI** — 各ルートに `error.tsx` / `loading.tsx` を設置

---

## 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| データベース / 認証 | Supabase (PostgreSQL + Auth) |
| グラフ | Recharts |
| AI | Google Gemini API |
| 通知 | LINE Messaging API + Vercel Cron |
| ホスティング | Vercel |

---

## アーキテクチャのポイント

### Row Level Security (RLS)
全テーブルにRLSを有効化し、`auth.uid() = user_id` のポリシーでデータの完全分離を実現。ユーザーは自分のデータにしかアクセスできません。

### Server Actions
フォーム送信・削除処理はすべてNext.jsのServer Actionsで実装。APIルートを設けず、サーバーサイドで直接Supabaseを操作することでコードをシンプルに保っています。

### Vercel Cron + Service Role
月次LINE通知のみAPIルート（`/api/cron/monthly-summary`）として実装。Cron実行時はユーザーセッションが存在しないため、Supabase Service Roleクライアントを使ってRLSをバイパスし、`CRON_SECRET` でエンドポイントを保護しています。

### Rechartsによるグラフ
`<BarChart>` のstackedレイアウトで5カテゴリの内訳を積み上げ表示。目標資産額は `<ReferenceLine>` で描画し、達成率を視覚的に把握できます。スナップショット詳細ページでは `<PieChart>` でカテゴリ構成比を表示します。

---

## ローカル起動手順

### 前提
- Node.js 20+
- Supabaseプロジェクト（テーブル・RLS設定済み）

### セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/Jimon-air/asset-log.git
cd asset-log

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定
# .env.local を作成し以下を記入
# NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
# SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>  # 月次LINE通知（Cron）用
# GEMINI_API_KEY=<your_gemini_api_key>                # AIコメント・トレンド分析用
# GEMINI_MODEL=gemini-2.5-flash-lite                  # 任意（未設定時はgemini-1.5-flash）
# LINE_CHANNEL_ACCESS_TOKEN=<your_line_channel_token> # 月次LINE通知用
# LINE_USER_ID=<your_line_user_id>                    # 月次LINE通知の送信先
# CRON_SECRET=<random_string>                         # Cronエンドポイント保護用

# 4. 開発サーバー起動
npm run dev
```

### デモデータの投入
`scripts/demo-seed.sql` を Supabase の SQL Editor で実行すると、サンプルデータを投入できます。

### 動作確認について
このアプリはSupabase Auth（メール認証）が必須のため、ブラウザの自動操作による動作確認はできません。APIを直接叩く・Supabase上でデータを確認するなどの方法で代替してください。
