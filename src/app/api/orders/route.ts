import { NextResponse } from 'next/server';
import { getProducts, getZones } from '@/lib/data';
import { hasSupabase, createClient, createAdminClient } from '@/lib/supabase/server';
import { calcDelivery, calcPoints, normalizePhone } from '@/lib/utils';
import { createPayment } from '@/lib/payments';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return bad('server');

  const name = str(b.name, 80);
  const phone = normalizePhone(str(b.phone, 30));
  const address = str(b.address);
  const payment = b.payment === 'qr' ? 'qr' : b.payment === 'card' ? 'card' : null;
  if (name.length < 2) return bad('name');
  if (!phone) return bad('phone');
  if (address.length < 3) return bad('address');
  if (!payment) return bad('server');

  const items: { id: string; qty: number }[] = Array.isArray(b.items)
    ? b.items.filter((i: any) => typeof i?.id === 'string' && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 99).slice(0, 100)
    : [];
  if (!items.length) return bad('empty');

  // Цены и доставка считаются только на сервере
  const [products, zones] = await Promise.all([getProducts({ ids: items.map((i) => i.id) }), getZones()]);
  const zone = zones.find((z) => z.id === b.zoneId);
  if (!zone) return bad('zone');
  const map = new Map(products.filter((p) => p.in_stock).map((p) => [p.id, p]));
  const lines = items.filter((i) => map.has(i.id)).map((i) => ({ p: map.get(i.id)!, qty: i.qty }));
  if (!lines.length) return bad('empty');
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  if (subtotal < zone.min_order) return bad('min');
  const delivery_fee = calcDelivery(subtotal, zone);
  const total = subtotal + delivery_fee;

  if (!hasSupabase) return NextResponse.json({ id: 'demo', redirectUrl: '/order/demo' });

  const user = (await (await createClient()).auth.getUser()).data.user;
  const admin = createAdminClient();
  const number = 'D-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10);
  const lat = typeof b.lat === 'number' ? b.lat : null;
  const lon = typeof b.lon === 'number' ? b.lon : null;

  const { data: order, error } = await admin.from('orders').insert({
    number, user_id: user?.id ?? null, payment_method: payment, customer_name: name, phone, zone_id: zone.id,
    address, apartment: str(b.apartment, 120) || null, comment: str(b.comment, 500) || null, lat, lon,
    subtotal, delivery_fee, total, points_earned: user ? calcPoints(total) : 0,
  }).select('id, number').single();
  if (error || !order) { console.error('order insert', error?.message); return bad('server', 500); }

  const { error: e2 } = await admin.from('order_items').insert(
    lines.map((l) => ({ order_id: order.id, product_id: l.p.id, name: l.p.name_ru, price: l.p.price, qty: l.qty })),
  );
  if (e2) { console.error('order items', e2.message); await admin.from('orders').delete().eq('id', order.id); return bad('server', 500); }

  try {
    const pay = await createPayment({ orderId: order.id, number: order.number, amount: total, method: payment });
    return NextResponse.json({ id: order.id, redirectUrl: pay.redirectUrl });
  } catch (e: any) {
    console.error('payment', e?.message);
    return NextResponse.json({ id: order.id, redirectUrl: `/order/${order.id}` });
  }
}
