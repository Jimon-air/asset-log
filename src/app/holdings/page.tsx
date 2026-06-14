import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DeleteHoldingButton from '@/components/DeleteHoldingButton'

type Holding = {
  id: string
  name: string
  ticker: string | null
  shares: number
  purchase_price: number
  current_price: number | null
}

function formatAmount(value: number) {
  return `¥${value.toLocaleString('ja-JP')}`
}

export default async function HoldingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('stock_holdings')
    .select('id, name, ticker, shares, purchase_price, current_price')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('データの取得に失敗しました。')
  }

  const rows: Holding[] = data ?? []

  return (
    <div className="min-h-full bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">保有銘柄</h1>
          <Link
            href="/holdings/new"
            className="flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200"
          >
            保有銘柄を追加
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-base font-medium text-foreground">保有銘柄がありません</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              「保有銘柄を追加」から記録してください。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-black/[.08] bg-white dark:border-white/[.1] dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[.06] dark:border-white/[.08]">
                  {['銘柄名', 'コード', '株数', '取得単価', '現在価格', '評価額', '含み損益', '損益率', ''].map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-right text-xs font-medium text-zinc-500 first:text-left dark:text-zinc-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const costBasis = row.shares * row.purchase_price
                  const currentValue = row.current_price != null ? row.shares * row.current_price : null
                  const unrealized = currentValue != null ? currentValue - costBasis : null
                  const unrealizedPct = unrealized != null && costBasis > 0
                    ? (unrealized / costBasis) * 100
                    : null
                  const gainColor =
                    unrealized == null ? ''
                    : unrealized > 0 ? 'text-emerald-600 dark:text-emerald-400'
                    : unrealized < 0 ? 'text-red-600 dark:text-red-400'
                    : ''
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-black/[.04] last:border-0 dark:border-white/[.05]"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                        {row.ticker ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                        {row.shares.toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                        {formatAmount(row.purchase_price)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-300">
                        {row.current_price != null ? formatAmount(row.current_price) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {currentValue != null ? formatAmount(currentValue) : formatAmount(costBasis)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${gainColor}`}>
                        {unrealized != null
                          ? `${unrealized >= 0 ? '+' : ''}${formatAmount(unrealized)}`
                          : '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${gainColor}`}>
                        {unrealizedPct != null
                          ? `${unrealizedPct >= 0 ? '+' : ''}${unrealizedPct.toFixed(1)}%`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/holdings/${row.id}/edit`}
                            className="text-xs text-zinc-400 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-500 dark:hover:text-zinc-200"
                          >
                            編集
                          </Link>
                          <DeleteHoldingButton id={row.id} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
