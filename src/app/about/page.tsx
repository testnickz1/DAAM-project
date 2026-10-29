import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import { getStores } from '@/lib/data';
import { loc } from '@/lib/utils';
import StoresMap from '@/components/maps/StoresMap';

export const metadata: Metadata = { title: 'О нас' };

export default async function About() {
  const { t, locale } = await getI18n();
  const stores = await getStores();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{t.about.title}</h1>
        <p className="text-lg text-stone-600 [text-wrap:pretty]">{t.about.text}</p>
      </div>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t.about.stores}</h2>
        <StoresMap stores={stores} />
        <div className="grid gap-3 md:grid-cols-3">
          {stores.map((s) => (
            <div key={s.id} className="flex flex-col gap-1 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <span className="font-medium">{loc(s, 'name', locale)}</span>
              <span className="text-sm">{loc(s, 'address', locale)}</span>
              <span className="text-sm text-stone-500">{t.about.hours}: {s.hours}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
