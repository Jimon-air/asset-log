'use client'

import { useActionState, useState } from 'react'
import { deleteSnapshot, type SnapshotFormState } from '@/lib/actions/snapshots'

const initialState: SnapshotFormState = {}

export default function DeleteSnapshotButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState(deleteSnapshot, initialState)
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">削除しますか？</span>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-zinc-400 underline-offset-2 hover:text-foreground hover:underline dark:text-zinc-500 dark:hover:text-zinc-200"
        >
          キャンセル
        </button>
        <form action={formAction} className="inline">
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={pending}
            className="text-red-500 underline-offset-2 hover:text-red-700 hover:underline disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            {pending ? '削除中...' : '削除'}
          </button>
        </form>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 underline-offset-2 hover:text-red-600 hover:underline dark:text-red-500 dark:hover:text-red-400"
    >
      削除
    </button>
  )
}
