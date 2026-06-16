import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function formatAmount(value: number) {
  return `¥${value.toLocaleString('ja-JP')}`
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: snapshots, error } = await supabase
    .from('asset_snapshots')
    .select('total_amount, snapshot_month, user_id')
    .order('snapshot_month', { ascending: false })
    .limit(4)

  if (error || !snapshots || snapshots.length === 0) {
    return NextResponse.json({ error: 'スナップショットが見つかりませんでした' }, { status: 404 })
  }

  const latest = snapshots[0]

  const { data: settings } = await supabase
    .from('user_settings')
    .select('goal_amount')
    .eq('user_id', latest.user_id)
    .maybeSingle()

  const goal = settings?.goal_amount ?? null

  const diffs: number[] = []
  for (let i = 0; i < Math.min(3, snapshots.length - 1); i++) {
    diffs.push(snapshots[i].total_amount - snapshots[i + 1].total_amount)
  }
  const avgDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null
  const diffFromPrev = snapshots.length > 1 ? latest.total_amount - snapshots[1].total_amount : null

  const lines: string[] = []
  lines.push('📊 資産ログ 月次サマリー')
  lines.push('')
  lines.push(`総資産：${formatAmount(latest.total_amount)}`)
  if (diffFromPrev !== null) {
    const sign = diffFromPrev >= 0 ? '+' : ''
    lines.push(`前月比：${sign}${formatAmount(diffFromPrev)}`)
  }

  if (goal !== null) {
    const remaining = goal - latest.total_amount
    const rate = (latest.total_amount / goal) * 100
    lines.push(`目標達成率：${rate.toFixed(1)}%`)
    if (remaining > 0 && avgDiff !== null) {
      if (avgDiff <= 0) {
        lines.push('現在のペースでは目標達成が難しい状況です。')
      } else {
        const monthsNeeded = Math.ceil(remaining / avgDiff)
        lines.push(`このペースなら約${monthsNeeded}ヶ月後に達成見込みです。`)
      }
    } else if (remaining <= 0) {
      lines.push('🎉 目標を達成しています！')
    }
  }

  lines.push('')
  lines.push('今月の資産を記録しましょう👇')
  lines.push(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://asset-log.vercel.app'}/snapshots/new`)

  const message = lines.join('\n')

  const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const lineUserId = process.env.LINE_USER_ID

  if (!lineToken || !lineUserId) {
    return NextResponse.json({ error: 'LINE通知の設定が不足しています' }, { status: 500 })
  }

  const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lineToken}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (!lineRes.ok) {
    const errText = await lineRes.text()
    return NextResponse.json({ error: 'LINE送信に失敗しました', detail: errText }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
