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

  if (!apiKey) {
    console.error('[Gemini] GEMINI_API_KEY is not set')
    return null
  }

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

  const diffText =
    diffFromPrev !== null
      ? `前月比：${diffFromPrev >= 0 ? '+' : ''}${diffFromPrev.toLocaleString('ja-JP')}円`
      : '前月データなし'

  const goalText =
    goalAmount !== null && achievementRate !== null
      ? `目標額：${goalAmount.toLocaleString('ja-JP')}円（達成率 ${achievementRate.toFixed(1)}%）`
      : '目標未設定'

  const prompt = `あなたは家計管理のアドバイザーです。以下の資産データをもとに、ユーザーへのやさしい日本語コメントを200文字以内で1つ生成してください。励ましや具体的なアドバイスを含めてください。余計な前置きや説明は不要です。コメント本文のみ出力してください。

総資産：${totalAmount.toLocaleString('ja-JP')}円
内訳：現金 ${cashAmount.toLocaleString('ja-JP')}円 / 投資信託 ${investmentTrustAmount.toLocaleString('ja-JP')}円 / 株式 ${stockAmount.toLocaleString('ja-JP')}円 / 買付余力 ${buyingPowerAmount.toLocaleString('ja-JP')}円 / その他 ${otherAmount.toLocaleString('ja-JP')}円
${diffText}
${goalText}`

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

    if (!res.ok) {
      console.error('[Gemini] API error:', res.status, await res.text())
      return null
    }

    const json = await res.json()
    const text: string | undefined =
      json?.candidates?.[0]?.content?.parts?.[0]?.text
    return text?.trim() ?? null
  } catch (e) {
    console.error('[Gemini] fetch error:', e)
    return null
  }
}
