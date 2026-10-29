'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/client';
import { fmt, loc } from '@/lib/utils';
import { useCart } from './cart/CartProvider';
import ProductImage from './ProductImage';

export default function CartView() {
  const { t, locale } = useI18n();
  const cart = useCart();

  if (!cart.ready) return <p className="text-stone-500">{t.common.loading}</p>;
  if (!cart.lines.length) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl bg-white p-8 ring-1 ring-stone-200">
        <p className="text-lg">{t.cart.empty}</p>
        <Link href="/catalog" className="rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white">{t.cart.toCatalog}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
        {cart.lines.map(({ id, qty, p }) => {
          const name = loc(p, 'name', locale);
          return (
            <div key={id} className="flex items-center gap-4 p-4">
              <Link href={`/product/${p.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><ProductImage src={p.image_url} alt={name} /></Link>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link href={`/product/${p.slug}`} className="text-sm font-medium">{name}</Link>
                <span className="text-xs text-stone-500">{p.unit} · {fmt(p.price)}</span>
                <button onClick={() => cart.remove(id)} className="self-start text-xs text-stone-400 hover:text-stone-900">{t.cart.remove}</button>
              </div>
              <div className="flex items-center rounded-xl bg-brand-soft">
                <button onClick={() => cart.setQty(id, qty - 1)} className="h-10 w-10">−</button>
                <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => cart.setQty(id, qty + 1)} className="h-10 w-10">+</button>
              </div>
              <span className="hidden w-24 text-right font-semibold sm:block">{fmt(p.price * qty)}</span>
            </div>
          );
        })}
      </div>
      <aside className="flex h-fit flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <div className="flex justify-between"><span className="text-stone-500">{t.cart.subtotal}</span><span>{fmt(cart.subtotal)}</span></div>
        <p className="text-xs text-stone-500">{t.cart.deliveryNote}</p>
        <Link href="/checkout" className="mt-2 rounded-xl bg-brand py-3 text-center font-medium text-white hover:bg-brand-dark">{t.cart.checkout}</Link>
        <button onClick={cart.clear} className="text-sm text-stone-400 hover:text-stone-900">{t.cart.clear}</button>
      </aside>
    </div>
  );
}
