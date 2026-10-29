'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPayButton({ orderId, label }: { orderId: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} className="rounded-xl bg-brand px-5 py-3 font-medium text-white disabled:opacity-50"
      onClick={async () => {
        setBusy(true);
        await fetch('/api/payment/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
        setBusy(false);
        router.refresh();
      }}>
      {label}
    </button>
  );
}
