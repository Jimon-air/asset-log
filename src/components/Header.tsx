import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/[.06] bg-background/80 backdrop-blur-sm dark:border-white/[.08]">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
          Asset Log
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex h-9 items-center rounded-full border border-black/[.08] px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-white/[.1] dark:hover:bg-zinc-800"
          >
            設定
          </Link>
          <Link
            href="/snapshots/new"
            className="flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-200"
          >
            新規入力
          </Link>
        </div>
      </div>
    </header>
  )
}
