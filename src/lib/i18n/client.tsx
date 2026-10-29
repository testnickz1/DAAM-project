'use client';
import { createContext, useContext } from 'react';
import { dict, type Dict } from './dict';
import type { Locale } from '../types';

const Ctx = createContext<{ locale: Locale; t: Dict }>({ locale: 'ru', t: dict.ru });

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, t: dict[locale] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
