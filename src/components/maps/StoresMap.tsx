'use client';
import { useEffect, useRef } from 'react';
import { load2gis, BISHKEK } from './load2gis';
import type { Store } from '@/lib/types';

export default function StoresMap({ stores }: { stores: Store[] }) {
  const key = process.env.NEXT_PUBLIC_2GIS_KEY;
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!key || !el.current) return;
    let map: any, cancelled = false;
    load2gis().then((mapgl) => {
      if (cancelled || !el.current) return;
      map = new mapgl.Map(el.current, { center: BISHKEK, zoom: 11.5, key });
      stores.forEach((s) => new mapgl.Marker(map, { coordinates: [s.lon, s.lat] }));
    }).catch(() => {});
    return () => { cancelled = true; map?.destroy(); };
  }, [key, stores]);

  if (!key) return null;
  return <div ref={el} className="h-80 w-full overflow-hidden rounded-2xl bg-brand-soft" />;
}
