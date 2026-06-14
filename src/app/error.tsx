'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-base font-medium text-foreground">エラーが発生しました</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        データの取得中に問題が起きました。再試行するか、ホームに戻ってください。
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex h-9 items-center rounded-full border border-black/[.08] px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-white/[.1] dark:hover:bg-zinc-800"
        >
          再試行
        </button>
        <Link
          href="/"
          className="flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  )
}
