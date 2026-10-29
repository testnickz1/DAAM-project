import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import CartView from '@/components/CartView';

export const metadata: Metadata = { title: 'Корзина' };

export default async function CartPage() {
  const { t } = await getI18n();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.cart.title}</h1>
      <CartView />
    </div>
  );
}
