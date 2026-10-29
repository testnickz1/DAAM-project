import Link from 'next/link';
import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import { getCategories, getProducts } from '@/lib/data';
import { loc } from '@/lib/utils';
import ProductGrid from '@/components/ProductGrid';
import type { Sort } from '@/lib/types';

export const metadata: Metadata = { title: 'Каталог' };
type SP = Promise<Record<string, string | undefined>>;
const num = (v?: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);
const SORTS: Sort[] = ['popular', 'cheap', 'expensive', 'new'];
const field = 'w-full rounded-xl bg-brand-soft px-3 py-2 text-sm outline-none';

export default async function Catalog({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { t, locale } = await getI18n();
  const sort = SORTS.includes(sp.sort as Sort) ? (sp.sort as Sort) : 'popular';
  const filter = { category: sp.category, min: num(sp.min), max: num(sp.max), sale: sp.sale === '1', own: sp.own === '1', sort };
  const [cats, products] = await Promise.all([getCategories(), getProducts(filter)]);
  const current = cats.find((c) => c.id === filter.category);

  return (
    <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-6">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
          <Link href="/catalog" className={`shrink-0 rounded-lg px-3 py-2 text-sm ${!current ? 'bg-brand text-white' : 'hover:bg-brand-soft'}`}>{t.catalog.all}</Link>
          {cats.map((c) => (
            <Link key={c.id} href={`/catalog?category=${c.id}`} className={`shrink-0 rounded-lg px-3 py-2 text-sm ${current?.id === c.id ? 'bg-brand text-white' : 'hover:bg-brand-soft'}`}>
              {loc(c, 'name', locale)}
            </Link>
          ))}
        </nav>
        <form className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
          <span className="font-semibold">{t.catalog.filters}</span>
          {filter.category && <input type="hidden" name="category" value={filter.category} />}
          <span className="text-xs text-stone-500">{t.catalog.price}</span>
          <div className="grid grid-cols-2 gap-2">
            <input name="min" type="number" min={0} placeholder={t.catalog.from} defaultValue={sp.min} className={field} />
            <input name="max" type="number" min={0} placeholder={t.catalog.to} defaultValue={sp.max} className={field} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sale" value="1" defaultChecked={filter.sale} />{t.catalog.onlySale}</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="own" value="1" defaultChecked={filter.own} />{t.catalog.onlyOwn}</label>
          <span className="text-xs text-stone-500">{t.catalog.sort}</span>
          <select name="sort" defaultValue={sort} className={field}>
            {SORTS.map((s) => <option key={s} value={s}>{t.catalog.sorts[s]}</option>)}
          </select>
          <button className="rounded-xl bg-brand py-2.5 text-sm font-medium text-white">{t.catalog.apply}</button>
          <Link href={filter.category ? `/catalog?category=${filter.category}` : '/catalog'} className="text-center text-sm text-stone-500">{t.catalog.reset}</Link>
        </form>
      </aside>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{current ? loc(current, 'name', locale) : t.catalog.all}</h1>
          <span className="text-sm text-stone-500">{t.catalog.count}: {products.length}</span>
        </div>
        {products.length ? <ProductGrid products={products} /> : <p className="text-stone-500">{t.catalog.empty}</p>}
      </div>
    </div>
  );
}
