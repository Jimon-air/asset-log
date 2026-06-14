import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewSnapshotForm from './NewSnapshotForm'

export default async function NewSnapshotPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: prevSnapshot } = await supabase
    .from('asset_snapshots')
    .select('cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount')
    .eq('user_id', user.id)
    .order('snapshot_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  return <NewSnapshotForm prevSnapshot={prevSnapshot ?? null} />
}
