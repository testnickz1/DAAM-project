'use client';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/client';

export default function LangSwitch() {
  const { locale } = useI18n();
  const router = useRouter();
  const set = (l: 'ru' | 'ky') => {
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <div className="flex rounded-xl bg-brand-soft p-0.5 text-xs font-medium">
      {(['ru', 'ky'] as const).map((l) => (
        <button key={l} onClick={() => set(l)} aria-pressed={locale === l}
          className={`rounded-lg px-2 py-1.5 ${locale === l ? 'bg-white shadow-sm' : 'text-stone-500'}`}>
          {l === 'ru' ? 'РУ' : 'КЫ'}
        </button>
      ))}
    </div>
  );
}
