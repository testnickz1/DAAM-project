'use client';
import { useEffect, useRef } from 'react';
import { load2gis, BISHKEK } from './load2gis';

export type PickedPoint = { lat: number; lon: number; address: string };

export default function AddressPicker({ hint, onPick }: { hint: string; onPick: (v: PickedPoint) => void }) {
  const key = process.env.NEXT_PUBLIC_2GIS_KEY;
  const el = useRef<HTMLDivElement>(null);
  const cb = useRef(onPick);
  cb.current = onPick;

  useEffect(() => {
    if (!key || !el.current) return;
    let map: any, marker: any, cancelled = false;
    load2gis().then((mapgl) => {
      if (cancelled || !el.current) return;
      map = new mapgl.Map(el.current, { center: BISHKEK, zoom: 12, key });
      map.on('click', async (e: any) => {
        const [lon, lat] = e.lngLat;
        if (marker) marker.setCoordinates([lon, lat]);
        else marker = new mapgl.Marker(map, { coordinates: [lon, lat] });
        let address = '';
        try {
          const r = await fetch(`https://catalog.api.2gis.com/3.0/items/geocode?lon=${lon}&lat=${lat}&fields=items.address&key=${key}`);
          const it = (await r.json())?.result?.items?.[0];
          address = it?.full_name || it?.address_name || it?.name || '';
        } catch { /* адрес можно ввести вручную */ }
        cb.current({ lat, lon, address });
      });
    }).catch(() => {});
    return () => { cancelled = true; map?.destroy(); };
  }, [key]);

  if (!key) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-stone-500">{hint}</p>
      <div ref={el} className="h-64 w-full overflow-hidden rounded-xl bg-brand-soft" />
    </div>
  );
}
