import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getI18n } from '@/lib/i18n/server';
import { hasSupabase, createAdminClient } from '@/lib/supabase/server';
import { fmt } from '@/lib/utils';
import { isDemoPayments } from '@/lib/payments';
import DemoPayButton from '@/components/DemoPayButton';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getI18n();

  if (id === 'demo' || !hasSupabase) {
    return (
      <div className="flex max-w-xl flex-col items-start gap-4 rounded-3xl bg-white p-8 ring-1 ring-stone-200">
        <h1 className="text-3xl font-bold">{t.order.thanks}</h1>
        <p className="text-stone-500">{t.order.demoNote}</p>
        <Link href="/" className="rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white">{t.order.toHome}</Link>
      </div>
    );
  }
  if (!UUID.test(id)) notFound();
  const { data: o } = await createAdminClient().from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
  if (!o) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-8 ring-1 ring-stone-200">
        <h1 className="text-3xl font-bold">{t.order.thanks}</h1>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-stone-500">{t.order.number}</dt><dd className="font-medium">{o.number}</dd>
          <dt className="text-stone-500">{t.order.status}</dt><dd>{t.order.statuses[o.status] ?? o.status}</dd>
          <dt className="text-stone-500">{t.order.payment}</dt><dd>{t.order.pay[o.payment_status] ?? o.payment_status}</dd>
        </dl>
        {o.payment_status === 'pending' && (
          <div className="flex flex-col items-start gap-3 border-t border-stone-200 pt-4">
            {o.payment_method === 'qr' && (
              <>
                <p className="text-sm text-stone-600">{t.order.qrHint}</p>
                <div className="flex aspect-square w-48 items-center justify-center rounded-2xl bg-brand-soft p-4 text-center font-mono text-[11px] uppercase text-stone-400">{t.order.qrPlaceholder}</div>
              </>
            )}
            {isDemoPayments() && <DemoPayButton orderId={o.id} label={t.order.demoPay} />}
          </div>
        )}
      </div>
      <aside className="flex h-fit flex-col gap-2 rounded-3xl bg-white p-6 ring-1 ring-stone-200">
        <h2 className="mb-2 font-semibold">{t.order.items}</h2>
        {(o.order_items ?? []).map((i: any) => (
          <div key={i.id} className="flex justify-between gap-3 text-sm"><span>{i.name} × {i.qty}</span><span>{fmt(i.price * i.qty)}</span></div>
        ))}
        <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-sm"><span className="text-stone-500">{t.cart.delivery}</span><span>{o.delivery_fee ? fmt(o.delivery_fee) : t.checkout.free}</span></div>
        <div className="flex justify-between text-lg font-semibold"><span>{t.cart.total}</span><span>{fmt(o.total)}</span></div>
      </aside>
    </div>
  );
}
