import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditSnapshotForm from './EditSnapshotForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditSnapshotPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    notFound()
  }

  const { data: snapshot, error } = await supabase
    .from('asset_snapshots')
    .select(
      'id, snapshot_month, cash_amount, investment_trust_amount, stock_amount, buying_power_amount, other_amount, memo'
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !snapshot) {
    notFound()
  }

  return (
    <EditSnapshotForm
      id={snapshot.id}
      snapshotMonth={snapshot.snapshot_month}
      initialValues={{
        cash_amount: snapshot.cash_amount,
        investment_trust_amount: snapshot.investment_trust_amount,
        stock_amount: snapshot.stock_amount,
        buying_power_amount: snapshot.buying_power_amount,
        other_amount: snapshot.other_amount,
      }}
      memo={snapshot.memo}
    />
  )
}
