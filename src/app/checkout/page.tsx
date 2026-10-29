import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import { getZones } from '@/lib/data';
import { hasSupabase, createClient } from '@/lib/supabase/server';
import CheckoutForm from '@/components/CheckoutForm';

export const metadata: Metadata = { title: 'Оформление заказа' };

export default async function CheckoutPage() {
  const { t } = await getI18n();
  const zones = await getZones();
  let loggedIn = false;
  if (hasSupabase) loggedIn = Boolean((await (await createClient()).auth.getUser()).data.user);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.checkout.title}</h1>
      <CheckoutForm zones={zones} loggedIn={loggedIn} />
    </div>
  );
}
