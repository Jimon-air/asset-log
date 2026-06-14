'use client'

import { useActionState, useState } from 'react'
import { updateHolding, type HoldingFormState } from '@/lib/actions/holdings'

const initialState: HoldingFormState = {}

function formatWithComma(value: string): string {
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('ja-JP')
}

type Props = {
  id: string
  initialName: string
  initialTicker: string | null
  initialShares: number
  initialPurchasePrice: number
  initialCurrentPrice: number | null
}

export default function HoldingEditForm({
  id,
  initialName,
  initialTicker,
  initialShares,
  initialPurchasePrice,
  initialCurrentPrice,
}: Props) {
  const [state, formAction, pending] = useActionState(updateHolding, initialState)

  const [sharesDisplay, setSharesDisplay] = useState(
    initialShares > 0 ? initialShares.toLocaleString('ja-JP') : ''
  )
  const [priceDisplay, setPriceDisplay] = useState(
    initialPurchasePrice > 0 ? initialPurchasePrice.toLocaleString('ja-JP') : ''
  )
  const [currentPriceDisplay, setCurrentPriceDisplay] = useState(
    initialCurrentPrice != null ? initialCurrentPrice.toLocaleString('ja-JP') : ''
  )

  return (
    <div className="min-h-full bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">保有銘柄を編集</h1>

        <div className="rounded-xl border border-black/[.08] bg-white p-6 dark:border-white/[.1] dark:bg-zinc-900">
          <form action={formAction} className="flex flex-col gap-5">
            <input type="hidden" name="id" value={id} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                銘柄名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={initialName}
                className="h-10 rounded-lg border border-black/[.08] bg-white px-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticker" className="text-sm font-medium text-foreground">
                ティッカー／コード
                <span className="ml-1 text-xs font-normal text-zinc-400">（任意）</span>
              </label>
              <input
                id="ticker"
                name="ticker"
                type="text"
                defaultValue={initialTicker ?? ''}
                className="h-10 rounded-lg border border-black/[.08] bg-white px-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="shares" className="text-sm font-medium text-foreground">
                株数
              </label>
              <input type="hidden" name="shares" value={sharesDisplay} />
              <input
                id="shares"
                type="text"
                inputMode="numeric"
                value={sharesDisplay}
                onChange={(e) => setSharesDisplay(formatWithComma(e.target.value))}
                placeholder="0"
                className="h-10 rounded-lg border border-black/[.08] bg-white px-3 text-right text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="purchase_price" className="text-sm font-medium text-foreground">
                取得単価
                <span className="ml-1 text-xs font-normal text-zinc-400">（円）</span>
              </label>
              <input type="hidden" name="purchase_price" value={priceDisplay} />
              <input
                id="purchase_price"
                type="text"
                inputMode="numeric"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(formatWithComma(e.target.value))}
                placeholder="0"
                className="h-10 rounded-lg border border-black/[.08] bg-white px-3 text-right text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="current_price" className="text-sm font-medium text-foreground">
                現在価格
                <span className="ml-1 text-xs font-normal text-zinc-400">（円・任意）</span>
              </label>
              <input type="hidden" name="current_price" value={currentPriceDisplay} />
              <input
                id="current_price"
                type="text"
                inputMode="numeric"
                value={currentPriceDisplay}
                onChange={(e) => setCurrentPriceDisplay(formatWithComma(e.target.value))}
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
    </div>
  )
}
