'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { upsertGoalAmount, type SettingsFormState } from '@/lib/actions/settings'

const initialState: SettingsFormState = {}

function formatWithComma(value: string): string {
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('ja-JP')
}

export default function GoalAmountForm({ initialGoalAmount }: { initialGoalAmount: number | null }) {
  const [state, formAction, pending] = useActionState(upsertGoalAmount, initialState)

  const [displayValue, setDisplayValue] = useState(
    initialGoalAmount != null ? initialGoalAmount.toLocaleString('ja-JP') : ''
  )

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">設定</h1>
          <Link
            href="/"
            className="text-sm text-zinc-400 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            ← トップへ
          </Link>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="goal_amount" className="text-sm font-medium text-foreground">
              目標資産額
              <span className="ml-1 text-xs font-normal text-zinc-400">（円）</span>
            </label>
            <input type="hidden" name="goal_amount" value={displayValue} />
            <input
              id="goal_amount"
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={(e) => setDisplayValue(formatWithComma(e.target.value))}
              placeholder="0"
              className="h-10 rounded-lg border border-black/[.08] bg-white px-3 text-right text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-200"
          >
            {pending ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}
