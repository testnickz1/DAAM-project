'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/client';
import { calcDelivery, calcPoints, fmt, loc, normalizePhone } from '@/lib/utils';
import type { Zone } from '@/lib/types';
import { useCart } from './cart/CartProvider';
import AddressPicker from './maps/AddressPicker';

const input = 'w-full rounded-xl bg-brand-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-stone-300';

export default function CheckoutForm({ zones, loggedIn }: { zones: Zone[]; loggedIn: boolean }) {
  const { t, locale } = useI18n();
  const cart = useCart();
  const router = useRouter();
  const [f, setF] = useState({ name: '', phone: '', zoneId: '', address: '', apartment: '', comment: '', payment: 'card' as 'card' | 'qr' });
  const [point, setPoint] = useState<{ lat: number; lon: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const zone = zones.find((z) => z.id === f.zoneId);
  const delivery = calcDelivery(cart.subtotal, zone);
  const total = cart.subtotal + delivery;
  const belowMin = zone && cart.subtotal < zone.min_order;

  if (!cart.ready) return <p className="text-stone-500">{t.common.loading}</p>;
  if (!cart.lines.length) return <p>{t.checkout.errors.empty} · <Link href="/catalog" className="underline">{t.cart.toCatalog}</Link></p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = t.checkout.errors.name;
    if (!normalizePhone(f.phone)) er.phone = t.checkout.errors.phone;
    if (!zone) er.zone = t.checkout.errors.zone;
    if (f.address.trim().length < 3) er.address = t.checkout.errors.address;
    if (belowMin) er.form = t.checkout.errors.min;
    setErrors(er);
    if (Object.keys(er).length) return;
    setSending(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, lat: point?.lat, lon: point?.lon, items: cart.lines.map((l) => ({ id: l.id, qty: l.qty })) }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ form: t.checkout.errors[data.error] ?? t.checkout.errors.server }); return; }
      cart.clear();
      router.push(data.redirectUrl ?? `/order/${data.id}`);
    } catch {
      setErrors({ form: t.checkout.errors.server });
    } finally { setSending(false); }
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <span className="text-xs text-sale">{errors[k]}</span> : null);

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        {!loggedIn && <Link href="/login?next=/checkout" className="rounded-2xl bg-white p-4 text-sm ring-1 ring-stone-200">{t.checkout.loginHint} →</Link>}
        <fieldset className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <legend className="mb-2 text-lg font-semibold">{t.checkout.contacts}</legend>
          <input className={input} placeholder={t.checkout.name} value={f.name} onChange={set('name')} autoComplete="name" /><Err k="name" />
          <input className={input} placeholder="+996 ___ ___ ___" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /><Err k="phone" />
        </fieldset>
        <fieldset className="flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <legend className="mb-2 text-lg font-semibold">{t.checkout.address}</legend>
          <select className={input} value={f.zoneId} onChange={set('zoneId')}>
            <option value="">{t.checkout.chooseZone}</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{loc(z, 'name', locale)} — {fmt(z.fee)}</option>)}
          </select><Err k="zone" />
          <AddressPicker hint={t.checkout.mapHint} onPick={(v) => { setPoint({ lat: v.lat, lon: v.lon }); if (v.address) setF((s) => ({ ...s, address: v.address })); }} />
          <input className={input} placeholder={t.checkout.street} value={f.address} onChange={set('address')} autoComplete="street-address" /><Err k="address" />
          <input className={input} placeholder={t.checkout.apartment} value={f.apartment} onChange={set('apartment')} />
          <textarea className={input} rows={2} placeholder={t.checkout.comment} value={f.comment} onChange={set('comment')} />
        </fieldset>
        <fieldset className="flex flex-col gap-2 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <legend className="mb-2 text-lg font-semibold">{t.checkout.payment}</legend>
          {(['card', 'qr'] as const).map((m) => (
            <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1 ${f.payment === m ? 'ring-brand' : 'ring-stone-200'}`}>
              <input type="radio" name="payment" checked={f.payment === m} onChange={() => setF({ ...f, payment: m })} />
              <span className="text-sm">{m === 'card' ? t.checkout.payCard : t.checkout.payQr}</span>
            </label>
          ))}
        </fieldset>
      </div>
      <aside className="flex h-fit flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200 lg:sticky lg:top-24">
        <div className="flex justify-between text-sm"><span className="text-stone-500">{t.cart.subtotal} · {cart.count}</span><span>{fmt(cart.subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-stone-500">{t.cart.delivery}</span><span>{zone ? (delivery ? fmt(delivery) : t.checkout.free) : '—'}</span></div>
        {zone && delivery > 0 && <p className="text-xs text-stone-500">{t.checkout.freeLeft}: {fmt(zone.free_from - cart.subtotal)}</p>}
        {belowMin && <p className="text-xs text-sale">{t.checkout.minOrder}: {fmt(zone.min_order)}</p>}
        <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-semibold"><span>{t.cart.total}</span><span>{fmt(total)}</span></div>
        {loggedIn && <p className="text-xs text-stone-500">{t.checkout.points}: {calcPoints(total)}</p>}
        <Err k="form" />
        <button disabled={sending} className="mt-2 rounded-xl bg-brand py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {sending ? t.checkout.sending : t.checkout.submit}
        </button>
      </aside>
    </form>
  );
}
