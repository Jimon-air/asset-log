'use client'

import { useActionState, useState } from 'react'
import { updateSnapshot, type SnapshotFormState } from '@/lib/actions/snapshots'

const FIELDS = [
  { name: 'cash_amount', label: '現金' },
  { name: 'investment_trust_amount', label: '投資信託' },
  { name: 'stock_amount', label: '株式' },
  { name: 'buying_power_amount', label: '買付余力' },
  { name: 'other_amount', label: 'その他' },
] as const

type FieldName = (typeof FIELDS)[number]['name']

type Props = {
  id: string
  snapshotMonth: string
  initialValues: Record<FieldName, number>
  memo: string | null
}

function formatWithComma(value: string): string {
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('ja-JP')
}

function parseRaw(value: string): number {
  const digits = value.replace(/,/g, '')
  const n = parseInt(digits, 10)
  return isNaN(n) ? 0 : n
}

const initialState: SnapshotFormState = {}

export default function EditSnapshotForm({ id, snapshotMonth, initialValues, memo }: Props) {
  const [state, formAction, pending] = useActionState(updateSnapshot, initialState)

  const [displayValues, setDisplayValues] = useState<Record<FieldName, string>>({
    cash_amount: initialValues.cash_amount.toLocaleString('ja-JP'),
    investment_trust_amount: initialValues.investment_trust_amount.toLocaleString('ja-JP'),
    stock_amount: initialValues.stock_amount.toLocaleString('ja-JP'),
    buying_power_amount: initialValues.buying_power_amount.toLocaleString('ja-JP'),
    other_amount: initialValues.other_amount.toLocaleString('ja-JP'),
  })

  const totalAmount = FIELDS.reduce(
    (sum, f) => sum + parseRaw(displayValues[f.name]),
    0
  )

  function handleAmountChange(name: FieldName, raw: string) {
    setDisplayValues((prev) => ({
      ...prev,
      [name]: formatWithComma(raw),
    }))
  }

  const [year, month] = snapshotMonth.split('-')
  const displayMonth = `${year}年${parseInt(month, 10)}月`

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
          資産を編集する
        </h1>

        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="id" value={id} />

          {/* 対象月（変更不可） */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">対象月</span>
            <div className="flex h-10 items-center rounded-lg border border-black/[.08] bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-white/[.1] dark:bg-zinc-800 dark:text-zinc-400">
              {displayMonth}
            </div>
          </div>

          {/* 金額フィールド */}
          {FIELDS.map(({ name, label }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label
                htmlFor={name}
                className="text-sm font-medium text-foreground"
              >
                {label}
                <span className="ml-1 text-xs font-normal text-zinc-400">（円）</span>
              </label>
              <input
                type="hidden"
                name={name}
                value={displayValues[name]}
              />
              <input
                id={name}
                type="text"
                inputMode="numeric"
                value={displayValues[name]}
                onChange={(e) => handleAmountChange(name, e.target.value)}
                placeholder="0"
                className="h-10 rounded-lg border border-black/[.08] bg-white px-3 text-right text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              />
            </div>
          ))}

          {/* 合計（表示のみ） */}
          <div className="flex items-center justify-between rounded-lg border border-black/[.08] bg-zinc-50 px-4 py-3 dark:border-white/[.1] dark:bg-zinc-900">
            <span className="text-sm font-medium text-foreground">合計</span>
            <span className="text-base font-semibold text-foreground">
              ¥{totalAmount.toLocaleString('ja-JP')}
            </span>
          </div>

          {/* メモ */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="memo"
              className="text-sm font-medium text-foreground"
            >
              メモ
              <span className="ml-1 text-xs font-normal text-zinc-400">（任意）</span>
            </label>
            <textarea
              id="memo"
              name="memo"
              rows={3}
              defaultValue={memo ?? ''}
              placeholder="気づきやコメントなど"
              className="rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20 resize-none"
            />
          </div>

          {/* エラー */}
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          {/* 送信 */}
          <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-200"
          >
            {pending ? '更新中...' : '更新する'}
          </button>
        </form>
      </div>
    </div>
  )
}
