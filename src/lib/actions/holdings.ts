'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type HoldingFormState = {
  error?: string
}

export async function createHolding(
  _prev: HoldingFormState,
  formData: FormData
): Promise<HoldingFormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'ログインが必要です。' }
  }

  const name = (formData.get('name') as string).trim()
  if (!name) {
    return { error: '銘柄名を入力してください。' }
  }

  const ticker = (formData.get('ticker') as string).trim() || null
  const shares = parseAmount(formData.get('shares') as string)
  const purchasePrice = parseAmount(formData.get('purchase_price') as string)
  const currentPriceRaw = (formData.get('current_price') as string).trim()
  const currentPrice = currentPriceRaw ? parseAmount(currentPriceRaw) : null

  const { error: insertError } = await supabase.from('stock_holdings').insert({
    user_id: user.id,
    name,
    ticker,
    shares,
    purchase_price: purchasePrice,
    current_price: currentPrice,
  })

  if (insertError) {
    return { error: '登録に失敗しました。もう一度お試しください。' }
  }

  redirect('/')
}

export async function updateHolding(
  _prev: HoldingFormState,
  formData: FormData
): Promise<HoldingFormState> {
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

  const name = (formData.get('name') as string).trim()
  if (!name) {
    return { error: '銘柄名を入力してください。' }
  }

  const ticker = (formData.get('ticker') as string).trim() || null
  const shares = parseAmount(formData.get('shares') as string)
  const purchasePrice = parseAmount(formData.get('purchase_price') as string)
  const currentPriceRaw = (formData.get('current_price') as string).trim()
  const currentPrice = currentPriceRaw ? parseAmount(currentPriceRaw) : null

  const { error: updateError } = await supabase
    .from('stock_holdings')
    .update({ name, ticker, shares, purchase_price: purchasePrice, current_price: currentPrice })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: '更新に失敗しました。もう一度お試しください。' }
  }

  redirect('/')
}

export async function deleteHolding(
  _prev: HoldingFormState,
  formData: FormData
): Promise<HoldingFormState> {
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
    .from('stock_holdings')
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
  const parsed = parseInt(value.replace(/,/g, ''), 10)
  return isNaN(parsed) ? 0 : parsed
}
