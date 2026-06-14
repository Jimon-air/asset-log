import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SnapshotPieChart from './SnapshotPieChart'

type Props = {
  params: Promise<{ id: string }>
}

function formatAmount(value: number) {
  return `¥${value.toLocaleString('ja-JP')}`
}

function formatMonth(dateStr: string) {
  const [y, m] = dateStr.split('-')
  return `${y}年${parseInt(m, 10)}月`
}

export default async function SnapshotDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    notFound()
  }

  const { data: snapshot, error } = await supabase
    .from('asset_snapshots')
    .select(
      'id, snapshot_month, cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount, total_amount, memo, ai_comment'
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !snapshot) {
    notFound()
  }

  const categories = [
    { label: '現金', value: snapshot.cash_amount, color: '#6366f1' },
    { label: '投資信託', value: snapshot.investment_trust_amount, color: '#22d3ee' },
    { label: '株式', value: snapshot.stock_amount, color: '#34d399' },
    { label: '買付余力', value: snapshot.buying_power_amount, color: '#fbbf24' },
    { label: 'その他', value: snapshot.other_amount, color: '#f87171' },
  ].filter((c) => c.value > 0)

  return (
    <div className="min-h-full bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-zinc-400 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            ← ホーム
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
          {formatMonth(snapshot.snapshot_month)} の資産
        </h1>

        {/* 合計 */}
        <div className="mb-6 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
          <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">総資産</p>
          <p className="text-3xl font-bold text-foreground">{formatAmount(snapshot.total_amount)}</p>
        </div>

        {/* 円グラフ + 内訳 */}
        <div className="mb-6 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
          <p className="mb-4 text-sm font-medium text-foreground">カテゴリ構成</p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="mx-auto w-48 shrink-0 sm:mx-0">
              <SnapshotPieChart data={categories} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {categories.map((c) => {
                const pct = snapshot.total_amount > 0
                  ? ((c.value / snapshot.total_amount) * 100).toFixed(1)
                  : '0.0'
                return (
                  <div key={c.label} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="flex-1 text-sm text-zinc-600 dark:text-zinc-300">{c.label}</span>
                    <span className="text-sm font-medium text-foreground">{formatAmount(c.value)}</span>
                    <span className="w-12 text-right text-xs text-zinc-400 dark:text-zinc-500">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* AIコメント */}
        {snapshot.ai_comment && (
          <div className="mb-6 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
            <p className="mb-2 text-sm font-medium text-foreground">AI コメント ✨</p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {snapshot.ai_comment}
            </p>
          </div>
        )}

        {/* メモ */}
        {snapshot.memo && (
          <div className="mb-6 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
            <p className="mb-2 text-sm font-medium text-foreground">メモ</p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{snapshot.memo}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Link
            href={`/snapshots/${snapshot.id}/edit`}
            className="flex h-9 items-center rounded-full border border-black/[.08] px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-white/[.1] dark:hover:bg-zinc-800"
          >
            編集
          </Link>
        </div>
      </div>
    </div>
  )
}
