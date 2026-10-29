import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import { getZones } from '@/lib/data';
import { fmt, loc } from '@/lib/utils';

export const metadata: Metadata = { title: 'Доставка и оплата' };

export default async function Delivery() {
  const { t, locale } = await getI18n();
  const zones = await getZones();
  const d = t.deliveryPage;
  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{d.zonesTitle}</h2>
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-stone-500">
              <tr>{[d.zone, d.fee, d.freeFrom, d.minOrder, d.eta].map((h) => <th key={h} className="p-4 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {zones.map((z) => (
                <tr key={z.id}>
                  <td className="p-4 font-medium">{loc(z, 'name', locale)}</td>
                  <td className="p-4">{fmt(z.fee)}</td>
                  <td className="p-4">{fmt(z.free_from)}</td>
                  <td className="p-4">{fmt(z.min_order)}</td>
                  <td className="p-4">{z.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{d.paymentTitle}</h2>
        <p className="text-stone-600">{d.paymentText}</p>
      </section>
    </div>
  );
}
