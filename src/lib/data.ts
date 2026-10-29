import { hasSupabase, createClient } from './supabase/server';
import * as seed from './seed-data.js';
import { norm } from './utils';
import type { Category, Product, ProductFilter, Promo, Store, Zone } from './types';

// Без Supabase всё читается из seed-data.js — сайт можно задеплоить сразу.

function filterMock(f: ProductFilter): Product[] {
  let list = (seed.PRODUCTS as Product[]).slice();
  if (f.ids) list = list.filter((p) => f.ids!.includes(p.id));
  if (f.category) list = list.filter((p) => p.category_id === f.category);
  if (f.q) { const q = norm(f.q); list = list.filter((p) => norm(p.name_ru).includes(q) || norm(p.name_ky).includes(q)); }
  if (f.min != null) list = list.filter((p) => p.price >= f.min!);
  if (f.max != null) list = list.filter((p) => p.price <= f.max!);
  if (f.sale) list = list.filter((p) => p.old_price != null);
  if (f.own) list = list.filter((p) => p.is_own);
  const s = f.sort ?? 'popular';
  list.sort((a, b) =>
    s === 'cheap' ? a.price - b.price :
    s === 'expensive' ? b.price - a.price :
    s === 'new' ? Number(b.labels.includes('new')) - Number(a.labels.includes('new')) :
    b.popularity - a.popularity);
  return f.limit ? list.slice(0, f.limit) : list;
}

export async function getProducts(f: ProductFilter = {}): Promise<Product[]> {
  if (!hasSupabase) return filterMock(f);
  const sb = await createClient();
  let q = sb.from('products').select('*').eq('is_active', true);
  if (f.ids) q = q.in('id', f.ids.length ? f.ids : ['-']);
  if (f.category) q = q.eq('category_id', f.category);
  if (f.q) { const s = f.q.replace(/[%,()*]/g, ' ').trim(); if (s) q = q.or(`name_ru.ilike.%${s}%,name_ky.ilike.%${s}%`); }
  if (f.min != null) q = q.gte('price', f.min);
  if (f.max != null) q = q.lte('price', f.max);
  if (f.sale) q = q.not('old_price', 'is', null);
  if (f.own) q = q.eq('is_own', true);
  const s = f.sort ?? 'popular';
  q = s === 'cheap' ? q.order('price') : s === 'expensive' ? q.order('price', { ascending: false }) :
      s === 'new' ? q.order('created_at', { ascending: false }) : q.order('popularity', { ascending: false });
  if (f.limit) q = q.limit(f.limit);
  const { data, error } = await q;
  if (error) { console.error('getProducts', error.message); return []; }
  return (data ?? []) as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!hasSupabase) return (seed.PRODUCTS as Product[]).find((p) => p.slug === slug) ?? null;
  const sb = await createClient();
  const { data } = await sb.from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
  return (data as Product) ?? null;
}

async function table<T>(name: string, fallback: T[], order = 'sort'): Promise<T[]> {
  if (!hasSupabase) return fallback;
  const sb = await createClient();
  const { data, error } = await sb.from(name).select('*').order(order);
  if (error) { console.error(name, error.message); return []; }
  return (data ?? []) as T[];
}

export const getCategories = () => table<Category>('categories', seed.CATEGORIES as Category[]);
export const getZones = () => table<Zone>('zones', seed.ZONES as Zone[]);
export const getStores = () => table<Store>('stores', seed.STORES as Store[], 'id');
export const getPromos = () => table<Promo>('promotions', seed.PROMOS as Promo[]);
