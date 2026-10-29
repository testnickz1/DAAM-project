import { cookies } from 'next/headers';
import { dict } from './dict';
import type { Locale } from '../types';

export async function getI18n() {
  const v = (await cookies()).get('lang')?.value;
  const locale: Locale = v === 'ky' ? 'ky' : 'ru';
  return { locale, t: dict[locale] };
}
