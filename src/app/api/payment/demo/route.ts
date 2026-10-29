import { NextResponse } from 'next/server';
import { hasSupabase, createAdminClient } from '@/lib/supabase/server';
import { isDemoPayments } from '@/lib/payments';

// Только для PAYMENT_PROVIDER=demo: помечает заказ оплаченным.
export async function POST(req: Request) {
  if (!isDemoPayments() || !hasSupabase) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { orderId } = await req.json().catch(() => ({}));
  if (typeof orderId !== 'string') return NextResponse.json({ error: 'bad' }, { status: 400 });
  await createAdminClient().from('orders').update({ payment_status: 'paid' }).eq('id', orderId).eq('payment_status', 'pending');
  return NextResponse.json({ ok: true });
}
