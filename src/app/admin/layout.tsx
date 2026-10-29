import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasSupabase, createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Админка', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) return <p className="text-stone-500">Админка заработает после подключения Supabase (см. README).</p>;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: profile } = await sb.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) return <p className="text-stone-500">Нет доступа. Попросите администратора выдать права (profiles.is_admin).</p>;

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-2 text-sm">
        <Link href="/admin/orders" className="rounded-lg bg-white px-4 py-2 ring-1 ring-stone-200">Заказы</Link>
        <Link href="/admin/products" className="rounded-lg bg-white px-4 py-2 ring-1 ring-stone-200">Товары</Link>
      </nav>
      {children}
    </div>
  );
}
