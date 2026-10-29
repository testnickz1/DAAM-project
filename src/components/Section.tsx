import Link from 'next/link';

export default function Section({ title, href, linkText, children }: { title: string; href?: string; linkText?: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {href && <Link href={href} className="shrink-0 text-sm text-stone-500 hover:text-stone-900">{linkText} →</Link>}
      </div>
      {children}
    </section>
  );
}
