import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import { hasSupabase, createClient } from '@/lib/supabase/server';
import { fmt } from '@/lib/utils';
import LogoutButton from '@/components/LogoutButton';

export const metadata: Metadata = { title: 'Личный кабинет' };

export default async function Account() {
  const { t, locale } = await getI18n();
  if (!hasSupabase) return <p className="text-stone-500">{t.login.notConfigured}</p>;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/account');
  const [{ data: profile }, { data: orders }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    sb.from('orders').select('id, number, status, payment_status, total, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ]);
  const date = new Intl.DateTimeFormat(locale === 'ky' ? 'ky-KG' : 'ru-RU', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t.account.title}</h1>
        <div className="flex items-center gap-4">
          {profile?.is_admin && <Link href="/admin" className="text-sm font-medium">{t.account.admin}</Link>}
          <LogoutButton label={t.account.logout} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
          <span className="text-sm text-stone-500">{t.account.points}</span>
          <span className="text-4xl font-bold">{profile?.points ?? 0}</span>
          <span className="text-xs text-stone-500">{t.account.pointsHint}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
          <span className="text-sm text-stone-500">{t.account.phone}</span>
          <span className="text-xl font-medium">+{user.phone}</span>
        </div>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t.account.orders}</h2>
        {!orders?.length ? <p className="text-stone-500">{t.account.noOrders}</p> : (
          <div className="flex flex-col divide-y divide-stone-200 rounded-2xl bg-white ring-1 ring-stone-200">
            {orders.map((o) => (
              <Link key={o.id} href={`/order/${o.id}`} className="grid grid-cols-2 gap-2 p-4 text-sm hover:bg-brand-soft sm:grid-cols-4">
                <span className="font-medium">{o.number}</span>
                <span className="text-stone-500">{date.format(new Date(o.created_at))}</span>
                <span>{t.order.statuses[o.status] ?? o.status}</span>
                <span className="font-medium sm:text-right">{fmt(o.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
