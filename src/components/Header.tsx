'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/client';
import { useCart } from './cart/CartProvider';
import LangSwitch from './LangSwitch';

export default function Header() {
  const { t } = useI18n();
  const cart = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-5">
        <Link href="/" className="text-xl font-extrabold tracking-tight">DAAM</Link>
        <Link href="/catalog" className="hidden rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark md:block">
          {t.nav.catalog}
        </Link>
        <form action="/search" className="min-w-0 flex-1">
          <input name="q" type="search" placeholder={t.searchPlaceholder} aria-label={t.nav.search}
            className="w-full rounded-xl bg-brand-soft px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-300" />
        </form>
        <nav className="hidden items-center gap-5 text-sm text-stone-600 lg:flex">
          <Link href="/promo" className="hover:text-stone-900">{t.nav.promo}</Link>
          <Link href="/delivery" className="hover:text-stone-900">{t.nav.delivery}</Link>
          <Link href="/about" className="hover:text-stone-900">{t.nav.about}</Link>
        </nav>
        <LangSwitch />
        <Link href="/account" className="hidden text-sm text-stone-600 hover:text-stone-900 md:block">{t.nav.account}</Link>
        <Link href="/cart" className="hidden items-center gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-sm font-medium md:flex">
          {t.nav.cart}
          {cart.count > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-white">{cart.count}</span>}
        </Link>
      </div>
    </header>
  );
}
