'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/client';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white pb-20 md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-extrabold">DAAM</span>
          <span className="text-sm text-stone-500">{t.tagline}</span>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-stone-600 sm:grid-cols-3">
          <Link href="/catalog">{t.nav.catalog}</Link>
          <Link href="/promo">{t.nav.promo}</Link>
          <Link href="/delivery">{t.nav.delivery}</Link>
          <Link href="/about">{t.nav.about}</Link>
          <Link href="/account">{t.nav.account}</Link>
          <Link href="/cart">{t.nav.cart}</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-8 text-xs text-stone-400">© {new Date().getFullYear()} DAAM · {t.footer.demo}</div>
    </footer>
  );
}
