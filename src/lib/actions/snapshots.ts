'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateAssetComment } from '@/lib/gemini'

export type SnapshotFormState = {
  error?: string
}

export async function createSnapshot(
  _prev: SnapshotFormState,
  formData: FormData
): Promise<SnapshotFormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'ログインが必要です。' }
  }

  const snapshotMonth = formData.get('snapshot_month') as string
  const cashAmount = parseAmount(formData.get('cash_amount') as string)
  const investmentTrustAmount = parseAmount(
    formData.get('investment_trust_amount') as string
  )
  const stockAmount = parseAmount(formData.get('stock_amount') as string)
  const buyingPowerAmount = parseAmount(
    formData.get('buying_power_amount') as string
  )
  const otherAmount = parseAmount(formData.get('other_amount') as string)
  const memo = (formData.get('memo') as string).trim() || null

  if (!snapshotMonth) {
    return { error: '対象月を選択してください。' }
  }

  // YYYY-MM 形式バリデーション（Safari など type="month" 非対応ブラウザ対策）
  if (!/^\d{4}-\d{2}$/.test(snapshotMonth)) {
    return { error: '対象月の形式が正しくありません。（例: 2026-06）' }
  }

  const [yearStr, monthStr] = snapshotMonth.split('-')
  const month = parseInt(monthStr, 10)
  if (month < 1 || month > 12) {
    return { error: '対象月に正しい月（01〜12）を入力してください。' }
  }

  // snapshot_month を月初日の date 型にする (YYYY-MM-01)
  const snapshotDate = `${yearStr}-${monthStr}-01`

  const totalAmount =
    cashAmount +
    investmentTrustAmount +
    stockAmount +
    buyingPowerAmount +
    otherAmount

  // 同月データの重複チェック
  const { data: existing, error: checkError } = await supabase
    .from('asset_snapshots')
    .select('id')
    .eq('user_id', user.id)
    .eq('snapshot_month', snapshotDate)
    .maybeSingle()

  if (checkError) {
    return { error: 'データ確認中にエラーが発生しました。' }
  }

  if (existing) {
    return { error: 'この月のデータはすでに登録されています。' }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('asset_snapshots')
    .insert({
      user_id: user.id,
      snapshot_month: snapshotDate,
      cash_amount: cashAmount,
      investment_trust_amount: investmentTrustAmount,
      stock_amount: stockAmount,
      buying_power_amount: buyingPowerAmount,
      other_amount: otherAmount,
      total_amount: totalAmount,
      memo,
    })
    .select('id')
    .single()

  if (insertError) {
    return { error: '登録に失敗しました。もう一度お試しください。' }
  }

  // 前月データ取得（前月比計算用）
  const { data: prevSnapshot } = await supabase
    .from('asset_snapshots')
    .select('total_amount')
    .eq('user_id', user.id)
    .lt('snapshot_month', snapshotDate)
    .order('snapshot_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('goal_amount')
    .eq('user_id', user.id)
    .maybeSingle()

  const goalAmount = userSettings?.goal_amount ?? null
  const diffFromPrev = prevSnapshot ? totalAmount - prevSnapshot.total_amount : null
  const achievementRate = goalAmount ? (totalAmount / goalAmount) * 100 : null

  const aiComment = await generateAssetComment({
    totalAmount,
    cashAmount,
    investmentTrustAmount,
    stockAmount,
    buyingPowerAmount,
    otherAmount,
    diffFromPrev,
    goalAmount,
    achievementRate,
  })

  if (aiComment && inserted?.id) {
    await supabase
      .from('asset_snapshots')
      .update({ ai_comment: aiComment })
      .eq('id', inserted.id)
      .eq('user_id', user.id)
  }

  redirect('/')
}

export async function updateSnapshot(
  _prev: SnapshotFormState,
  formData: FormData
): Promise<SnapshotFormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'ログインが必要です。' }
  }

  const id = formData.get('id') as string
  if (!id) {
    return { error: '不正なリクエストです。' }
  }

  const cashAmount = parseAmount(formData.get('cash_amount') as string)
  const investmentTrustAmount = parseAmount(
    formData.get('investment_trust_amount') as string
  )
  const stockAmount = parseAmount(formData.get('stock_amount') as string)
  const buyingPowerAmount = parseAmount(
    formData.get('buying_power_amount') as string
  )
  const otherAmount = parseAmount(formData.get('other_amount') as string)
  const memo = (formData.get('memo') as string).trim() || null

  const totalAmount =
    cashAmount +
    investmentTrustAmount +
    stockAmount +
    buyingPowerAmount +
    otherAmount

  const { data: existing, error: fetchError } = await supabase
    .from('asset_snapshots')
    .select('total_amount, snapshot_month')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) {
    return { error: '更新対象が見つかりませんでした。' }
  }

  const amountChanged = existing.total_amount !== totalAmount

  const { data: updated, error: updateError } = await supabase
    .from('asset_snapshots')
    .update({
      cash_amount: cashAmount,
      investment_trust_amount: investmentTrustAmount,
      stock_amount: stockAmount,
      buying_power_amount: buyingPowerAmount,
      other_amount: otherAmount,
      total_amount: totalAmount,
      memo,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('snapshot_month')
    .single()

  if (updateError) {
    return { error: '更新に失敗しました。もう一度お試しください。' }
  }

  // 前月データ取得（前月比計算用）
  const snapshotDate = updated?.snapshot_month ?? null
  const { data: prevSnapshot } = snapshotDate
    ? await supabase
        .from('asset_snapshots')
        .select('total_amount')
        .eq('user_id', user.id)
        .lt('snapshot_month', snapshotDate)
        .order('snapshot_month', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('goal_amount')
    .eq('user_id', user.id)
    .maybeSingle()

  const goalAmount = userSettings?.goal_amount ?? null
  const diffFromPrev = prevSnapshot ? totalAmount - prevSnapshot.total_amount : null
  const achievementRate = goalAmount ? (totalAmount / goalAmount) * 100 : null

  if (amountChanged) {
    const aiComment = await generateAssetComment({
      totalAmount,
      cashAmount,
      investmentTrustAmount,
      stockAmount,
      buyingPowerAmount,
      otherAmount,
      diffFromPrev,
      goalAmount,
      achievementRate,
    })

      if (aiComment) {
        await supabase
          .from('asset_snapshots')
          .update({ ai_comment: aiComment })
          .eq('id', id)
          .eq('user_id', user.id)
      }
  }

  redirect('/')
}

export async function deleteSnapshot(
  _prev: SnapshotFormState,
  formData: FormData
): Promise<SnapshotFormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'ログインが必要です。' }
  }

  const id = formData.get('id') as string
  if (!id) {
    return { error: '不正なリクエストです。' }
  }

  const { error: deleteError } = await supabase
    .from('asset_snapshots')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return { error: '削除に失敗しました。もう一度お試しください。' }
  }

  redirect('/')
}

function parseAmount(value: string): number {
  if (!value) return 0
  // カンマを除去して整数にパース
  const parsed = parseInt(value.replace(/,/g, ''), 10)
  return isNaN(parsed) ? 0 : parsed
}
