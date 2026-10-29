import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-stone-500">Страница не найдена · Барак табылган жок</p>
      <Link href="/" className="rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white">DAAM</Link>
    </div>
  );
}
