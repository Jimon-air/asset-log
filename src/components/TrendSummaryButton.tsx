'use client'

import { useState } from 'react'
import { generateTrendComment } from '@/lib/actions/trend'

export default function TrendSummaryButton() {
  const [loading, setLoading] = useState(false)
  const [comment, setComment] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setComment(null)
    setError(null)
    const result = await generateTrendComment()
    if (result.error) {
      setError(result.error)
    } else {
      setComment(result.comment)
    }
    setLoading(false)
  }

  return (
    <div className="mb-8 rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.1] dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">トレンド分析 📈</p>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="flex h-8 items-center rounded-full bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-200"
        >
          {loading ? '生成中...' : comment ? '再生成' : 'AIに分析させる'}
        </button>
      </div>
      {comment && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{comment}</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {!comment && !error && (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          直近最大6ヶ月のデータをもとにトレンドを総括します
        </p>
      )}
    </div>
  )
}
