'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';

export type CartSnap = Pick<Product, 'id' | 'slug' | 'name_ru' | 'name_ky' | 'price' | 'old_price' | 'unit' | 'image_url'>;
export type CartLine = { id: string; qty: number; p: CartSnap };

interface CartCtx {
  lines: CartLine[]; ready: boolean; count: number; subtotal: number;
  qtyOf: (id: string) => number; add: (p: CartSnap) => void; setQty: (id: string, qty: number) => void;
  remove: (id: string) => void; clear: () => void;
}

const KEY = 'daam:cart:v2';
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(raw)) setLines(raw.filter((l) => l && typeof l.id === 'string' && l.qty > 0 && l.qty <= 99 && l.p));
    } catch { /* повреждённые данные — начинаем с пустой корзины */ }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines, ready]);

  const value = useMemo<CartCtx>(() => {
    const setQty = (id: string, qty: number) => setLines((ls) => {
      const q = Math.max(0, Math.min(99, Math.floor(qty)));
      return q === 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => (l.id === id ? { ...l, qty: q } : l));
    });
    return {
      lines, ready,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.p.price * l.qty, 0),
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
      add: (p) => setLines((ls) => ls.some((l) => l.id === p.id)
        ? ls.map((l) => (l.id === p.id ? { ...l, qty: Math.min(99, l.qty + 1) } : l))
        : [...ls, { id: p.id, qty: 1, p: { id: p.id, slug: p.slug, name_ru: p.name_ru, name_ky: p.name_ky, price: p.price, old_price: p.old_price, unit: p.unit, image_url: p.image_url } }]),
      setQty,
      remove: (id) => setQty(id, 0),
      clear: () => setLines([]),
    };
  }, [lines, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart вне CartProvider');
  return c;
}
