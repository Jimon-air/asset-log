import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HoldingEditForm from './HoldingEditForm'

export default async function EditHoldingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: holding } = await supabase
    .from('stock_holdings')
    .select('id, name, ticker, shares, purchase_price')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!holding) {
    notFound()
  }

  return (
    <HoldingEditForm
      id={holding.id}
      initialName={holding.name}
      initialTicker={holding.ticker}
      initialShares={holding.shares}
      initialPurchasePrice={holding.purchase_price}
    />
  )
}
