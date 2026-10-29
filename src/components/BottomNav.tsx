'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n/client';
import { useCart } from './cart/CartProvider';

export default function BottomNav() {
  const { t } = useI18n();
  const cart = useCart();
  const path = usePathname();
  const items = [
    { href: '/', label: t.nav.home },
    { href: '/catalog', label: t.nav.catalog },
    { href: '/cart', label: t.nav.cart, badge: cart.count },
    { href: '/account', label: t.nav.account },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((i) => {
        const active = i.href === '/' ? path === '/' : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} className={`flex h-14 items-center justify-center gap-1 text-xs font-medium ${active ? 'text-stone-900' : 'text-stone-500'}`}>
            {i.label}
            {i.badge ? <span className="rounded-full bg-brand px-1.5 text-[10px] text-white">{i.badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
