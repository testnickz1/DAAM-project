import type { Metadata } from 'next';
import { getI18n } from '@/lib/i18n/server';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = { title: 'Вход' };

export default async function Login() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-3xl bg-white p-8 ring-1 ring-stone-200">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{t.login.title}</h1>
        <p className="text-stone-500">{t.login.text}</p>
      </div>
      <LoginForm />
    </div>
  );
}
