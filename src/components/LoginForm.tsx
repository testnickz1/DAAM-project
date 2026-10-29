'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/client';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';
import { normalizePhone, safeNext } from '@/lib/utils';

const input = 'w-full rounded-xl bg-brand-soft px-4 py-3 outline-none focus:ring-2 focus:ring-stone-300';

export default function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!supabaseConfigured) return <p className="text-stone-500">{t.login.notConfigured}</p>;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const p = normalizePhone(phone);
    if (!p) { setError(t.checkout.errors.phone); return; }
    setBusy(true); setError('');
    const { error } = await createClient().auth.signInWithOtp({ phone: '+' + p });
    setBusy(false);
    if (error) setError(t.login.error); else setStep('code');
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const { error } = await createClient().auth.verifyOtp({ phone: '+' + normalizePhone(phone), token: code.trim(), type: 'sms' });
    setBusy(false);
    if (error) { setError(t.login.error); return; }
    router.push(safeNext(new URLSearchParams(window.location.search).get('next')));
    router.refresh();
  }

  return step === 'phone' ? (
    <form onSubmit={send} className="flex flex-col gap-3">
      <label className="text-sm text-stone-500" htmlFor="phone">{t.login.phone}</label>
      <input id="phone" className={input} type="tel" placeholder="+996 ___ ___ ___" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" autoFocus />
      {error && <p className="text-sm text-sale">{error}</p>}
      <button disabled={busy} className="rounded-xl bg-brand py-3 font-medium text-white disabled:opacity-50">{t.login.send}</button>
    </form>
  ) : (
    <form onSubmit={verify} className="flex flex-col gap-3">
      <label className="text-sm text-stone-500" htmlFor="code">{t.login.code}</label>
      <input id="code" className={`${input} tracking-[0.4em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
      {error && <p className="text-sm text-sale">{error}</p>}
      <button disabled={busy || code.length < 4} className="rounded-xl bg-brand py-3 font-medium text-white disabled:opacity-50">{t.login.verify}</button>
      <button type="button" onClick={() => { setStep('phone'); setCode(''); }} className="text-sm text-stone-500">{t.login.change}</button>
    </form>
  );
}
