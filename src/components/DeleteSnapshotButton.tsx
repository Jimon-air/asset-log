'use client'

import { useActionState } from 'react'
import { deleteSnapshot, type SnapshotFormState } from '@/lib/actions/snapshots'

const initialState: SnapshotFormState = {}

export default function DeleteSnapshotButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState(deleteSnapshot, initialState)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm('このスナップショットを削除しますか？')) {
      e.preventDefault()
    }
  }

  return (
    <form onSubmit={handleSubmit} action={formAction} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-400 underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-50 dark:text-red-500 dark:hover:text-red-400"
      >
        削除
      </button>
    </form>
  )
}
