'use client'

type Row = {
  snapshot_month: string
  cash_amount: number
  investment_trust_amount: number
  stock_amount: number
  buying_power_amount: number
  other_amount: number
  total_amount: number
  memo: string | null
}

export default function ExportCsvButton({ rows }: { rows: Row[] }) {
  function handleExport() {
    const header = ['月', '現金', '投資信託', '株式', '買付余力', 'その他', '合計', 'メモ']
    const lines = rows.map((r) => {
      const month = r.snapshot_month.slice(0, 7)
      return [
        month,
        r.cash_amount,
        r.investment_trust_amount,
        r.stock_amount,
        r.buying_power_amount,
        r.other_amount,
        r.total_amount,
        r.memo ?? '',
      ].join(',')
    })
    const csv = '﻿' + [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asset-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex h-8 items-center rounded-full border border-black/[.08] px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-white/[.1] dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      CSVエクスポート
    </button>
  )
}
