let promise: Promise<any> | null = null;

export const BISHKEK: [number, number] = [74.59, 42.87];

/** Загружает 2ГИС MapGL один раз на страницу */
export function load2gis(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('ssr'));
  const w = window as any;
  if (w.mapgl) return Promise.resolve(w.mapgl);
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://mapgl.2gis.com/api/js/v1';
      s.async = true;
      s.onload = () => resolve(w.mapgl);
      s.onerror = () => { promise = null; reject(new Error('2gis load failed')); };
      document.head.appendChild(s);
    });
  }
  return promise;
}
