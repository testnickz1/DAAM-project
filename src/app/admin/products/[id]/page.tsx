import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { saveProduct } from '../../actions';

const f = 'w-full rounded-lg bg-brand-soft px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-300';
const L = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm"><span className="text-stone-500">{label}</span>{children}</label>
);

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();
  const [{ data: cats }, { data: found }] = await Promise.all([
    sb.from('categories').select('id, name_ru').order('sort'),
    id === 'new' ? Promise.resolve({ data: null }) : sb.from('products').select('*').eq('id', id).maybeSingle(),
  ]);
  if (id !== 'new' && !found) notFound();
  const p: any = found ?? { in_stock: true, is_active: true, labels: [] };

  return (
    <form action={saveProduct} className="flex max-w-3xl flex-col gap-5">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-sm text-stone-500">← Товары</Link>
        <h1 className="text-2xl font-bold">{id === 'new' ? 'Новый товар' : p.name_ru}</h1>
      </div>
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 md:grid-cols-2">
        <L label="Название (рус) *"><input name="name_ru" required defaultValue={p.name_ru} className={f} /></L>
        <L label="Аталышы (кырг)"><input name="name_ky" defaultValue={p.name_ky ?? ''} className={f} /></L>
        <L label="Категория">
          <select name="category_id" defaultValue={p.category_id ?? ''} className={f}>
            <option value="">—</option>
            {cats?.map((c) => <option key={c.id} value={c.id}>{c.name_ru}</option>)}
          </select>
        </L>
        <L label="URL (slug) — пусто = из названия"><input name="slug" defaultValue={p.slug ?? ''} className={f} /></L>
        <L label="Цена, сом *"><input name="price" type="number" min={0} required defaultValue={p.price} className={f} /></L>
        <L label="Старая цена (для скидки)"><input name="old_price" type="number" min={0} defaultValue={p.old_price ?? ''} className={f} /></L>
        <L label="Вес / объём"><input name="unit" defaultValue={p.unit ?? ''} className={f} /></L>
        <L label="Популярность (сортировка)"><input name="popularity" type="number" defaultValue={p.popularity ?? 0} className={f} /></L>
      </div>
      <div className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 md:grid-cols-2">
        <L label="Описание (рус)"><textarea name="description_ru" rows={3} defaultValue={p.description_ru ?? ''} className={f} /></L>
        <L label="Сүрөттөмө (кырг)"><textarea name="description_ky" rows={3} defaultValue={p.description_ky ?? ''} className={f} /></L>
        <L label="Состав (рус)"><textarea name="composition_ru" rows={3} defaultValue={p.composition_ru ?? ''} className={f} /></L>
        <L label="Курамы (кырг)"><textarea name="composition_ky" rows={3} defaultValue={p.composition_ky ?? ''} className={f} /></L>
      </div>
      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 md:grid-cols-5">
        <L label="ккал / 100 г"><input name="kcal" type="number" step="0.1" defaultValue={p.kcal ?? ''} className={f} /></L>
        <L label="Белки, г"><input name="protein" type="number" step="0.1" defaultValue={p.protein ?? ''} className={f} /></L>
        <L label="Жиры, г"><input name="fat" type="number" step="0.1" defaultValue={p.fat ?? ''} className={f} /></L>
        <L label="Углеводы, г"><input name="carbs" type="number" step="0.1" defaultValue={p.carbs ?? ''} className={f} /></L>
        <L label="Срок хранения"><input name="shelf_life" defaultValue={p.shelf_life ?? ''} className={f} /></L>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200">
        <L label="Фото (jpg/png/webp, до 5 МБ)"><input name="image" type="file" accept="image/*" className="text-sm" /></L>
        {p.image_url && <img src={p.image_url} alt="" className="h-32 w-32 rounded-xl object-cover" />}
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="in_stock" defaultChecked={p.in_stock} />В наличии</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={p.is_active} />Показывать на сайте</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="is_own" defaultChecked={p.is_own} />Собственное производство</label>
          {[['hit', 'Хит'], ['new', 'Новинка'], ['sale', 'Скидка']].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2"><input type="checkbox" name="labels" value={v} defaultChecked={p.labels?.includes(v)} />{l}</label>
          ))}
        </div>
      </div>
      <button className="self-start rounded-xl bg-brand px-6 py-3 font-medium text-white">Сохранить</button>
    </form>
  );
}
