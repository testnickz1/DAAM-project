import type { Locale, Zone } from './types';

export const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' сом';

export const norm = (s: string | null | undefined) => String(s ?? '').toLowerCase().replaceAll('ё', 'е').trim();

/** Поле с суффиксом языка: loc(p, 'name', 'ky') → p.name_ky || p.name_ru */
export function loc(o: any, field: string, l: Locale): string {
  return (o?.[`${field}_${l}`] || o?.[`${field}_ru`] || '') as string;
}

/** Нормализует номер КР в 996XXXXXXXXX или возвращает null */
export function normalizePhone(v: string): string | null {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 10 && d.startsWith('0')) d = '996' + d.slice(1);
  if (d.length === 9) d = '996' + d;
  return /^996\d{9}$/.test(d) ? d : null;
}

export function calcDelivery(subtotal: number, zone?: Zone | null) {
  if (!zone || subtotal === 0) return 0;
  return subtotal >= zone.free_from ? 0 : zone.fee;
}

export const POINTS_RATE = 0.03;
export const calcPoints = (total: number) => Math.floor(total * POINTS_RATE);

export const safeNext = (v: string | null | undefined, fallback = '/account') =>
  v && v.startsWith('/') && !v.startsWith('//') ? v : fallback;
