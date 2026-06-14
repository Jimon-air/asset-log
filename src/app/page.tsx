import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AssetsBarChart, { type ChartData } from '@/components/AssetsBarChart'
import DeleteSnapshotButton from '@/components/DeleteSnapshotButton'

type Snapshot = {
  id: string
  snapshot_month: string
  cash_amount: number
  investment_trust_amount: number
  stock_amount: number
  buying_power_amount: number
  other_amount: number
  total_amount: number
  memo: string | null
  ai_comment: string | null
}

function toMan(yen: number) {
  return Math.round(yen / 10000)
}

function formatMonth(dateStr: string) {
  // dateStr: "YYYY-MM-DD"
  const [y, m] = dateStr.split('-')
  return `${y}/${m}`
}

function formatAmount(value: number) {
  return `¥${value.toLocaleString('ja-JP')}`
}

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ data: snapshots, error }, { data: settings }] = await Promise.all([
    supabase
      .from('asset_snapshots')
      .select(
        'id, snapshot_month, cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount, total_amount, memo, ai_comment'
      )
      .eq('user_id', user.id)
      .order('snapshot_month', { ascending: false }),
    supabase
      .from('user_settings')
      .select('goal_amount')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (error) {
    throw new Error('データの取得に失敗しました。')
  }

  const rows: Snapshot[] = snapshots ?? []

  // グラフ用：昇順にして万円換算
  const chartData: ChartData[] = [...rows]
    .reverse()
    .map((s) => ({
      month: formatMonth(s.snapshot_month),
      現金: toMan(s.cash_amount),
      投資信託: toMan(s.investment_trust_amount),
      株式: toMan(s.stock_amount),
      買付余力: toMan(s.buying_power_amount),
      その他: toMan(s.other_amount),
    }))

  return (
    <div className="min-h-full bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-base font-medium text-foreground">
              まだデータがありません
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              「新規入力」から最初のスナップショットを記録してください。
            </p>
          </div>
        ) : (
          <>
            {/* 目標達成サマリーカード */}
            {(() => {
              const latest = rows[0]
              const goal = settings?.goal_amount ?? null
              if (!latest || !goal) return null
              const remaining = goal - latest.total_amount
              const rate = (latest.total_amount / goal) * 100
              const achieved = remaining <= 0
              return (
                <div className="mb-6 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
                  <p className="mb-3 text-sm font-medium text-foreground">目標達成状況</p>
                  <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">現在の総資産</p>
                      <p className="text-xl font-semibold text-foreground">
                        {formatAmount(latest.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">目標額</p>
                      <p className="text-xl font-semibold text-foreground">{formatAmount(goal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {achieved ? '達成！' : '残り'}
                      </p>
                      <p className={`text-xl font-semibold ${achieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {achieved ? '🎉' : formatAmount(remaining)}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">達成率</p>
                      <p className={`text-2xl font-bold ${achieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${achieved ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(rate, 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              )
            })()}

            {/* グラフ */}
            <div className="mb-8 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
              <p className="mb-4 text-sm font-medium text-foreground">資産推移（万円）</p>
              <AssetsBarChart data={chartData} goalAmount={settings?.goal_amount ?? undefined} />
            </div>

            {/* 最新月AIコメント */}
            {rows[0]?.ai_comment && (
              <div className="mb-8 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
                <p className="mb-2 text-sm font-medium text-foreground">AI コメント ✨</p>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {rows[0].ai_comment}
                </p>
              </div>
            )}

            {/* テーブル */}
            <div className="overflow-x-auto rounded-xl border border-black/[.08] bg-white dark:border-white/[.1] dark:bg-zinc-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[.06] dark:border-white/[.08]">
                    {['月', '現金', '投資信託', '株式', '買付余力', 'その他', '合計', '前月比', ''].map(
                      (col, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-right text-xs font-medium text-zinc-500 first:text-left dark:text-zinc-400"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    // rows は降順なので次要素が前月
                    const prev = rows[i + 1]
                    let momText = '—'
                    let momColor = ''
                    if (prev) {
                      const diff = row.total_amount - prev.total_amount
                      const pct = (diff / prev.total_amount) * 100
                      const sign = pct >= 0 ? '+' : ''
                      momText = `${sign}${pct.toFixed(1)}%`
                      momColor =
                        pct > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : pct < 0
                          ? 'text-red-600 dark:text-red-400'
                          : ''
                    }

                    return (
                      <React.Fragment key={row.id}>
                      <tr
                        className={`${row.ai_comment ? '' : 'border-b border-black/[.04] last:border-0 dark:border-white/[.05]'}`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {formatMonth(row.snapshot_month)}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                          {formatAmount(row.cash_amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                          {formatAmount(row.investment_trust_amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                          {formatAmount(row.stock_amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                          {formatAmount(row.buying_power_amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                          {formatAmount(row.other_amount)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatAmount(row.total_amount)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${momColor}`}>
                          {momText}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/snapshots/${row.id}/edit`}
                              className="text-xs text-zinc-400 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-500 dark:hover:text-zinc-200"
                            >
                              編集
                            </Link>
                            <DeleteSnapshotButton id={row.id} />
                          </div>
                        </td>
                      </tr>
                      {row.ai_comment && (
                        <tr className="border-b border-black/[.04] last:border-0 dark:border-white/[.05]">
                          <td
                            colSpan={9}
                            className="px-4 pb-3 pt-0 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500"
                          >
                            ✨ {row.ai_comment}
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
