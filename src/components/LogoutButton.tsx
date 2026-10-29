'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button onClick={async () => { await createClient().auth.signOut(); router.push('/'); router.refresh(); }}
      className="text-sm text-stone-500 hover:text-stone-900">
      {label}
    </button>
  );
}
