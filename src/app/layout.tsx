import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import { getI18n } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/client';
import { CartProvider } from '@/components/cart/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

const onest = Onest({ subsets: ['latin', 'cyrillic'], variable: '--font-onest' });

export const metadata: Metadata = {
  title: { default: 'DAAM — доставка еды и продуктов в Бишкеке', template: '%s — DAAM' },
  description: 'Готовая еда собственного производства и продукты с доставкой по Бишкеку.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getI18n();
  return (
    <html lang={locale} className={onest.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <I18nProvider locale={locale}>
          <CartProvider>
            <Header />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6">{children}</main>
            <Footer />
            <BottomNav />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
