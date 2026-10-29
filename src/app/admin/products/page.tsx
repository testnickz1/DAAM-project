import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmt } from '@/lib/utils';

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const sb = await createClient();
  let query = sb.from('products').select('id, name_ru, category_id, price, old_price, in_stock, is_active, image_url').order('name_ru');
  if (q) query = query.ilike('name_ru', `%${q.replace(/[%,]/g, '')}%`);
  const { data: products, error } = await query;
  if (error) return <p className="text-sale">{error.message}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Товары ({products?.length ?? 0})</h1>
        <form><input name="q" defaultValue={q} placeholder="Поиск" className="rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200" /></form>
        <Link href="/admin/products/new" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">+ Новый товар</Link>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-stone-500"><tr><th className="p-3">Название</th><th className="p-3">Категория</th><th className="p-3">Цена</th><th className="p-3">Фото</th><th className="p-3">Наличие</th><th className="p-3">На сайте</th></tr></thead>
          <tbody className="divide-y divide-stone-200">
            {products?.map((p) => (
              <tr key={p.id} className="hover:bg-brand-soft">
                <td className="p-3"><Link href={`/admin/products/${p.id}`} className="font-medium underline-offset-2 hover:underline">{p.name_ru}</Link></td>
                <td className="p-3 text-stone-500">{p.category_id}</td>
                <td className="p-3">{fmt(p.price)}{p.old_price ? <span className="ml-1 text-stone-400 line-through">{fmt(p.old_price)}</span> : null}</td>
                <td className="p-3">{p.image_url ? 'есть' : '—'}</td>
                <td className="p-3">{p.in_stock ? 'да' : 'нет'}</td>
                <td className="p-3">{p.is_active ? 'да' : 'скрыт'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
