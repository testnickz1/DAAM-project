import { createClient } from '@/lib/supabase/server';
import { fmt } from '@/lib/utils';
import { dict } from '@/lib/i18n/dict';
import { updateOrder } from '../actions';

const t = dict.ru.order;
const date = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bishkek' });
const sel = 'rounded-lg bg-brand-soft px-2 py-1.5 text-sm';

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const sb = await createClient();
  let q = sb.from('orders').select('*, order_items(name, qty, price), zones(name_ru)').order('created_at', { ascending: false }).limit(100);
  if (status) q = q.eq('status', status);
  const { data: orders, error } = await q;
  if (error) return <p className="text-sale">{error.message}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <h1 className="mr-4 text-2xl font-bold">Заказы</h1>
        <a href="/admin/orders" className={!status ? 'font-semibold' : 'text-stone-500'}>Все</a>
        {Object.entries(t.statuses).map(([k, v]) => <a key={k} href={`/admin/orders?status=${k}`} className={status === k ? 'font-semibold' : 'text-stone-500'}>{v}</a>)}
      </div>
      {!orders?.length && <p className="text-stone-500">Заказов нет</p>}
      {orders?.map((o: any) => (
        <div key={o.id} className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 lg:grid-cols-[1fr_1fr_auto]">
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-semibold">{o.number} · {fmt(o.total)}</span>
            <span className="text-stone-500">{date.format(new Date(o.created_at))} · {o.payment_method === 'qr' ? 'QR' : 'Карта'}</span>
            <span>{o.customer_name}, +{o.phone}</span>
            <span>{o.zones?.name_ru} — {o.address}{o.apartment ? `, ${o.apartment}` : ''}</span>
            {o.lat && <a className="text-stone-500 underline" target="_blank" rel="noreferrer" href={`https://2gis.kg/bishkek/geo/${o.lon},${o.lat}`}>Точка на карте</a>}
            {o.comment && <span className="text-stone-500">«{o.comment}»</span>}
          </div>
          <ul className="flex flex-col gap-0.5 text-sm">
            {o.order_items?.map((i: any, idx: number) => <li key={idx}>{i.name} × {i.qty} — {fmt(i.price * i.qty)}</li>)}
            <li className="text-stone-500">Доставка: {fmt(o.delivery_fee)}</li>
          </ul>
          <form action={updateOrder} className="flex flex-wrap items-start gap-2">
            <input type="hidden" name="id" value={o.id} />
            <select name="status" defaultValue={o.status} className={sel}>
              {Object.entries(t.statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select name="payment_status" defaultValue={o.payment_status} className={sel}>
              {Object.entries(t.pay).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white">Сохранить</button>
          </form>
        </div>
      ))}
    </div>
  );
}
