export default function ProductImage({ src, alt, className = '' }: { src: string | null; alt: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className={`flex h-full w-full items-center justify-center bg-brand-soft p-3 text-center font-mono text-[11px] uppercase tracking-wide text-stone-400 ${className}`}>
      фото товара
    </div>
  );
}
