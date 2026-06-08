import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GoalAmountForm from './GoalAmountForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select('goal_amount')
    .eq('user_id', user.id)
    .maybeSingle()

  return <GoalAmountForm initialGoalAmount={settings?.goal_amount ?? null} />
}
