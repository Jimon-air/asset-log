type AssetCommentInput = {
  totalAmount: number
  cashAmount: number
  investmentTrustAmount: number
  stockAmount: number
  buyingPowerAmount: number
  otherAmount: number
  diffFromPrev: number | null
  goalAmount: number | null
  achievementRate: number | null
}

export async function generateAssetComment(
  input: AssetCommentInput
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

  if (!apiKey) return null

  const {
    totalAmount,
    cashAmount,
    investmentTrustAmount,
    stockAmount,
    buyingPowerAmount,
    otherAmount,
    diffFromPrev,
    goalAmount,
    achievementRate,
  } = input

  const prevTotal = diffFromPrev !== null ? totalAmount - diffFromPrev : null
  const diffSign = diffFromPrev !== null && diffFromPrev >= 0 ? '+' : ''
  const diffAmountText =
    diffFromPrev !== null
      ? `${diffSign}${diffFromPrev.toLocaleString('ja-JP')}`
      : 'データなし'
  const diffRateText =
    diffFromPrev !== null && prevTotal !== null && prevTotal !== 0
      ? `${diffSign}${((diffFromPrev / prevTotal) * 100).toFixed(1)}`
      : 'データなし'

  const goalAmountText =
    goalAmount !== null
      ? `${goalAmount.toLocaleString('ja-JP')}`
      : '未設定'
  const achievementRateText =
    achievementRate !== null ? `${achievementRate.toFixed(1)}` : '未設定'

  const categories = [
    `現金 ${cashAmount.toLocaleString('ja-JP')}円`,
    `投資信託 ${investmentTrustAmount.toLocaleString('ja-JP')}円`,
    `株式 ${stockAmount.toLocaleString('ja-JP')}円`,
    `買付余力 ${buyingPowerAmount.toLocaleString('ja-JP')}円`,
    `その他 ${otherAmount.toLocaleString('ja-JP')}円`,
  ].join(' / ')

  const prompt = `あなたは資産管理のプロフェッショナルアドバイザーです。
以下のデータをもとに、150〜200文字の日本語コメントを生成してください。

【ルール】
- 必ず具体的な数字（金額・増減率・達成率）を1つ以上含める
- カテゴリ別の動きに触れる（増えたカテゴリ・減ったカテゴリ）
- 次にやるべき具体的なアクションを1つ提案する
- 褒めるだけでなく、改善点や注意点も率直に述べる
- 文末は「〜しましょう」「〜ですね」など自然な日本語で締める
- 前置きや説明は不要。コメント本文のみ出力する

【データ】
総資産：${totalAmount.toLocaleString('ja-JP')}円
前月比：${diffAmountText}円（${diffRateText}%）
目標額：${goalAmountText}円
達成率：${achievementRateText}%
カテゴリ別内訳：${categories}`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      }
    )

    if (!res.ok) return null

    const json = await res.json()
    const text: string | undefined =
      json?.candidates?.[0]?.content?.parts?.[0]?.text
    return text?.trim() ?? null
  } catch {
    return null
  }
}
