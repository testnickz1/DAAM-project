import Link from 'next/link';
import { getI18n } from '@/lib/i18n/server';
import { getCategories, getProducts, getStores } from '@/lib/data';
import { loc } from '@/lib/utils';
import ProductGrid from '@/components/ProductGrid';
import Section from '@/components/Section';
import StoresMap from '@/components/maps/StoresMap';

export default async function Home() {
  const { t, locale } = await getI18n();
  const [cats, own, sale, popular, stores] = await Promise.all([
    getCategories(), getProducts({ own: true, limit: 5 }), getProducts({ sale: true, limit: 5 }), getProducts({ limit: 10 }), getStores(),
  ]);
  const insta = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/';
  const appStore = process.env.NEXT_PUBLIC_APPSTORE_URL;
  const googlePlay = process.env.NEXT_PUBLIC_GOOGLEPLAY_URL;

  return (
    <>
      <section className="flex flex-col items-start gap-5 rounded-3xl bg-white px-6 py-12 ring-1 ring-stone-200 md:px-12 md:py-20">
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight [text-wrap:balance] md:text-6xl">{t.home.heroTitle}</h1>
        <p className="max-w-xl text-lg text-stone-600">{t.home.heroText}</p>
        <Link href="/catalog" className="rounded-xl bg-brand px-6 py-3.5 font-medium text-white hover:bg-brand-dark">{t.home.heroCta}</Link>
      </section>

      <Section title={t.home.categories} href="/catalog" linkText={t.home.seeAll}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((c) => (
            <Link key={c.id} href={`/catalog?category=${c.id}`} className="flex min-h-24 items-end rounded-2xl bg-white p-4 text-sm font-medium ring-1 ring-stone-200 hover:ring-stone-400">
              {loc(c, 'name', locale)}
            </Link>
          ))}
        </div>
      </Section>

      {own.length > 0 && <Section title={t.home.own} href="/catalog?own=1" linkText={t.home.seeAll}><ProductGrid products={own} /></Section>}
      {sale.length > 0 && <Section title={t.home.sale} href="/promo" linkText={t.home.seeAll}><ProductGrid products={sale} /></Section>}
      <Section title={t.home.popular} href="/catalog" linkText={t.home.seeAll}><ProductGrid products={popular} /></Section>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col items-start gap-3 rounded-3xl bg-white p-8 ring-1 ring-stone-200">
          <h2 className="text-2xl font-bold">{t.home.loyaltyTitle}</h2>
          <p className="text-stone-600">{t.home.loyaltyText}</p>
          <Link href="/login" className="mt-2 rounded-xl bg-brand-soft px-5 py-3 text-sm font-medium">{t.nav.login}</Link>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-3xl bg-white p-8 ring-1 ring-stone-200">
          <h2 className="text-2xl font-bold">{t.home.appTitle}</h2>
          <p className="text-stone-600">{t.home.appText}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {appStore ? <a href={appStore} className="rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white">App Store</a> : null}
            {googlePlay ? <a href={googlePlay} className="rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white">Google Play</a> : null}
            {!appStore && !googlePlay && <span className="rounded-xl bg-brand-soft px-5 py-3 text-sm text-stone-500">{t.home.soon}</span>}
          </div>
        </div>
      </div>

      <Section title={t.home.instaTitle}>
        <a href={insta} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-3xl bg-white p-8 ring-1 ring-stone-200 hover:ring-stone-400">
          <span className="text-lg font-medium">@daam</span>
          <span className="text-sm text-stone-500">{t.home.instaCta} →</span>
        </a>
      </Section>

      <Section title={t.home.storesTitle} href="/about" linkText={t.nav.about}>
        <StoresMap stores={stores} />
        <div className="grid gap-3 md:grid-cols-3">
          {stores.map((s) => (
            <div key={s.id} className="flex flex-col gap-1 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <span className="font-medium">{loc(s, 'address', locale)}</span>
              <span className="text-sm text-stone-500">{s.hours}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
