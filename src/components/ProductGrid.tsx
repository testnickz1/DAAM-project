'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/client';
import { fmt, loc } from '@/lib/utils';
import type { Product } from '@/lib/types';
import AddToCart from './AddToCart';
import ProductImage from './ProductImage';

export function ProductCard({ p }: { p: Product }) {
  const { locale, t } = useI18n();
  const name = loc(p, 'name', locale);
  return (
    <div className="flex flex-col rounded-2xl bg-white p-3 ring-1 ring-stone-200">
      <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden rounded-xl">
        <ProductImage src={p.image_url} alt={name} />
        {p.labels?.length > 0 && (
          <div className="absolute left-2 top-2 flex gap-1">
            {p.labels.map((l) => <span key={l} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium shadow-sm">{t.labels[l] ?? l}</span>)}
          </div>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{fmt(p.price)}</span>
          {p.old_price ? <span className="text-sm text-stone-400 line-through">{fmt(p.old_price)}</span> : null}
        </div>
        <Link href={`/product/${p.slug}`} className="line-clamp-2 text-sm leading-snug [text-wrap:pretty]">{name}</Link>
        <span className="text-xs text-stone-500">{p.unit}</span>
        <div className="mt-auto pt-2"><AddToCart p={p} inStock={p.in_stock} /></div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
