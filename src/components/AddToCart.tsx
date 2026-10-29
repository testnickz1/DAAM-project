'use client';
import { useI18n } from '@/lib/i18n/client';
import { useCart, type CartSnap } from './cart/CartProvider';

export default function AddToCart({ p, inStock = true, large = false }: { p: CartSnap; inStock?: boolean; large?: boolean }) {
  const { t } = useI18n();
  const cart = useCart();
  const qty = cart.qtyOf(p.id);
  const h = large ? 'h-12 text-base' : 'h-10 text-sm';

  if (!inStock) return <button disabled className={`w-full rounded-xl bg-brand-soft text-stone-400 ${h}`}>{t.product.outOfStock}</button>;
  if (!qty) {
    return (
      <button onClick={() => cart.add(p)} className={`w-full rounded-xl bg-brand font-medium text-white hover:bg-brand-dark ${h}`}>
        {t.product.add}
      </button>
    );
  }
  return (
    <div className={`flex w-full items-center justify-between rounded-xl bg-brand-soft ${h}`}>
      <button aria-label="−" onClick={() => cart.setQty(p.id, qty - 1)} className="h-full w-12 text-lg">−</button>
      <span className="font-semibold">{qty}</span>
      <button aria-label="+" onClick={() => cart.setQty(p.id, qty + 1)} className="h-full w-12 text-lg">+</button>
    </div>
  );
}
