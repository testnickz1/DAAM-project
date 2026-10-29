import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import { getProducts } from '@/lib/data';
import ProductGrid from '@/components/ProductGrid';

export const metadata: Metadata = { title: 'Поиск' };

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const { t } = await getI18n();
  const query = q.trim().slice(0, 100);
  const products = query ? await getProducts({ q: query }) : [];
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">{query ? `${t.search.results} «${query}»` : t.search.title}</h1>
      {!query ? <p className="text-stone-500">{t.search.hint}</p> : products.length ? <ProductGrid products={products} /> : <p className="text-stone-500">{t.search.empty}</p>}
    </div>
  );
}
