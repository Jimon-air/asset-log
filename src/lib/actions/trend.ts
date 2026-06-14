'use server'

import { createClient } from '@/lib/supabase/server'

type TrendResult = {
  comment: string | null
  error?: string
}

export async function generateTrendComment(): Promise<TrendResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { comment: null, error: 'ログインが必要です。' }
  }

  const { data: snapshots } = await supabase
    .from('asset_snapshots')
    .select('snapshot_month, total_amount, cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount')
    .eq('user_id', user.id)
    .order('snapshot_month', { ascending: false })
    .limit(6)

  if (!snapshots || snapshots.length < 2) {
    return { comment: null, error: '2ヶ月以上のデータが必要です。' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'
  if (!apiKey) return { comment: null, error: 'AI機能が利用できません。' }

  const rows = [...snapshots].reverse()
  const dataText = rows
    .map((s) => {
      const m = s.snapshot_month.slice(0, 7)
      return `${m}：総資産 ${s.total_amount.toLocaleString('ja-JP')}円（現金 ${s.cash_amount.toLocaleString('ja-JP')} / 投信 ${s.investment_trust_amount.toLocaleString('ja-JP')} / 株式 ${s.stock_amount.toLocaleString('ja-JP')} / 買付余力 ${s.buying_power_amount.toLocaleString('ja-JP')} / その他 ${s.other_amount.toLocaleString('ja-JP')}）`
    })
    .join('\n')

  const prompt = `あなたは資産管理のプロフェッショナルアドバイザーです。
以下の複数月の資産推移データをもとに、200〜300文字のトレンド総括コメントを生成してください。

【ルール】
- 全体の増減トレンドを数字で示す
- 最も変化が大きかったカテゴリに触れる
- 今後1〜2ヶ月で意識すべきアクションを1つ提案する
- 前置きや説明は不要。コメント本文のみ出力する

【データ（古い順）】
${dataText}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400 },
        }),
      }
    )
    if (!res.ok) return { comment: null, error: 'AIサービスでエラーが発生しました。' }
    const json = await res.json()
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text
    return { comment: text?.trim() ?? null }
  } catch {
    return { comment: null, error: 'AIサービスでエラーが発生しました。' }
  }
}
