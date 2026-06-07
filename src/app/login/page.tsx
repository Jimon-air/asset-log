'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setPending(false)
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
          Asset Log
        </h1>

        {sent ? (
          <div className="rounded-lg border border-black/[.08] bg-white px-6 py-8 text-center dark:border-white/[.1] dark:bg-zinc-900">
            <p className="text-base font-medium text-foreground">
              メールを確認してください
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {email} にログインリンクを送信しました。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-10 rounded-lg border border-black/[.08] bg-white px-3 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.1] dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-white/20"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:hover:bg-zinc-200"
            >
              {pending ? '送信中...' : 'Magic Link を送信'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
