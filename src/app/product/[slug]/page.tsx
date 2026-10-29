import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getI18n } from '@/lib/i18n/server';
import { getCategories, getProduct, getProducts } from '@/lib/data';
import { fmt, loc } from '@/lib/utils';
import AddToCart from '@/components/AddToCart';
import ProductImage from '@/components/ProductImage';
import ProductGrid from '@/components/ProductGrid';
import Section from '@/components/Section';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const p = await getProduct((await params).slug);
  return { title: p?.name_ru ?? 'Товар', description: p?.description_ru ?? undefined };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const { t, locale } = await getI18n();
  const [cats, similar] = await Promise.all([getCategories(), p.category_id ? getProducts({ category: p.category_id, limit: 6 }) : Promise.resolve([])]);
  const cat = cats.find((c) => c.id === p.category_id);
  const name = loc(p, 'name', locale);
  const composition = loc(p, 'composition', locale);
  const description = loc(p, 'description', locale);
  const related = similar.filter((x) => x.id !== p.id).slice(0, 5);
  const nutrition = [
    [t.product.kcal, p.kcal, ''], [t.product.protein, p.protein, t.product.g], [t.product.fat, p.fat, t.product.g], [t.product.carbs, p.carbs, t.product.g],
  ] as const;

  return (
    <>
      <nav className="mb-4 flex gap-2 text-sm text-stone-500">
        <Link href="/catalog">{t.nav.catalog}</Link>
        {cat && <><span>/</span><Link href={`/catalog?category=${cat.id}`}>{loc(cat, 'name', locale)}</Link></>}
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200"><ProductImage src={p.image_url} alt={name} /></div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {p.is_own && <span className="text-sm font-medium text-stone-500">{t.product.own}</span>}
            <h1 className="text-3xl font-bold tracking-tight [text-wrap:balance] md:text-4xl">{name}</h1>
            <span className="text-stone-500">{p.unit}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{fmt(p.price)}</span>
            {p.old_price ? <span className="text-lg text-stone-400 line-through">{fmt(p.old_price)}</span> : null}
          </div>
          <div className="max-w-xs"><AddToCart p={p} inStock={p.in_stock} large /></div>

          {p.kcal != null && (
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold">{t.product.nutrition}</h2>
              <div className="grid grid-cols-4 gap-2">
                {nutrition.map(([label, v, u]) => (
                  <div key={label} className="flex flex-col rounded-xl bg-white p-3 ring-1 ring-stone-200">
                    <span className="text-lg font-semibold">{v ?? '—'}{v != null && u ? ` ${u}` : ''}</span>
                    <span className="text-xs text-stone-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {composition && <div className="flex flex-col gap-1"><h2 className="font-semibold">{t.product.composition}</h2><p className="text-stone-600">{composition}</p></div>}
          {description && <div className="flex flex-col gap-1"><h2 className="font-semibold">{t.product.description}</h2><p className="text-stone-600">{description}</p></div>}
          {p.shelf_life && <p className="text-sm text-stone-500">{t.product.shelfLife}: {p.shelf_life}</p>}
        </div>
      </div>
      {related.length > 0 && <Section title={t.product.related}><ProductGrid products={related} /></Section>}
    </>
  );
}
