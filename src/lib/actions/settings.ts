'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type SettingsFormState = {
  error?: string
  success?: boolean
}

export async function upsertGoalAmount(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'ログインが必要です。' }
  }

  const raw = (formData.get('goal_amount') as string).replace(/,/g, '')
  const goalAmount = parseInt(raw, 10)

  if (isNaN(goalAmount) || goalAmount < 0) {
    return { error: '目標資産額に正しい金額を入力してください。' }
  }

  const { error: upsertError } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: user.id, goal_amount: goalAmount },
      { onConflict: 'user_id' }
    )

  if (upsertError) {
    console.error('[upsertGoalAmount] Supabase error:', upsertError.code, upsertError.message, upsertError.details)
    return { error: '保存に失敗しました。もう一度お試しください。' }
  }

  redirect('/settings')
}
