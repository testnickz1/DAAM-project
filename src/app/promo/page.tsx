import Link from 'next/link';
import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import { getProducts, getPromos } from '@/lib/data';
import { loc } from '@/lib/utils';
import ProductGrid from '@/components/ProductGrid';
import Section from '@/components/Section';

export const metadata: Metadata = { title: 'Акции' };

export default async function Promo() {
  const { t, locale } = await getI18n();
  const [promos, sale] = await Promise.all([getPromos(), getProducts({ sale: true })]);
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">{t.promo.title}</h1>
      {promos.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {promos.map((p) => {
            const body = (
              <>
                <h2 className="text-xl font-bold [text-wrap:balance]">{loc(p, 'title', locale)}</h2>
                <p className="text-stone-600">{loc(p, 'text', locale)}</p>
              </>
            );
            const cls = 'flex flex-col gap-2 rounded-3xl bg-white p-8 ring-1 ring-stone-200';
            return p.link ? <Link key={p.id} href={p.link} className={`${cls} hover:ring-stone-400`}>{body}</Link> : <div key={p.id} className={cls}>{body}</div>;
          })}
        </div>
      ) : <p className="mt-4 text-stone-500">{t.promo.empty}</p>}
      {sale.length > 0 && <Section title={t.promo.sale}><ProductGrid products={sale} /></Section>}
    </>
  );
}
