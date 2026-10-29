import { NextResponse } from 'next/server';
import { hasSupabase, createAdminClient } from '@/lib/supabase/server';

// Шаблон вебхука платёжного провайдера.
// TODO: заменить проверку секрета на проверку подписи провайдера и разбор его формата.
export async function POST(req: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || req.headers.get('x-webhook-secret') !== secret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasSupabase) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (typeof body?.orderId !== 'string' || !['paid', 'failed', 'refunded'].includes(status)) {
    return NextResponse.json({ error: 'bad payload' }, { status: 400 });
  }
  const { error } = await createAdminClient().from('orders').update({ payment_status: status }).eq('id', body.orderId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
