'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/seed-data.js';

async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('unauthorized');
  const { data: p } = await sb.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!p?.is_admin) throw new Error('forbidden');
  return sb;
}

const ORDER_STATUSES = ['new', 'confirmed', 'cooking', 'delivering', 'delivered', 'cancelled'];
const PAY_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export async function updateOrder(formData: FormData) {
  const sb = await requireAdmin();
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  const payment_status = String(formData.get('payment_status'));
  if (!ORDER_STATUSES.includes(status) || !PAY_STATUSES.includes(payment_status)) throw new Error('bad status');
  const { error } = await sb.from('orders').update({ status, payment_status }).eq('id', id);
  if (error) throw new Error(error.message);
  if (status === 'delivered') await sb.rpc('award_order_points', { p_order: id });
  revalidatePath('/admin/orders');
}

export async function saveProduct(formData: FormData) {
  const sb = await requireAdmin();
  const s = (k: string) => { const v = formData.get(k); return v == null || v === '' ? null : String(v).trim(); };
  const n = (k: string) => { const v = s(k); return v == null || Number.isNaN(Number(v)) ? null : Number(v); };
  const id = s('id');
  const row: Record<string, any> = {
    name_ru: s('name_ru'), name_ky: s('name_ky'), category_id: s('category_id'),
    description_ru: s('description_ru'), description_ky: s('description_ky'),
    composition_ru: s('composition_ru'), composition_ky: s('composition_ky'),
    price: n('price') ?? 0, old_price: n('old_price'), unit: s('unit'),
    kcal: n('kcal'), protein: n('protein'), fat: n('fat'), carbs: n('carbs'), shelf_life: s('shelf_life'),
    is_own: formData.get('is_own') === 'on', in_stock: formData.get('in_stock') === 'on', is_active: formData.get('is_active') === 'on',
    labels: formData.getAll('labels').map(String), popularity: n('popularity') ?? 0,
  };
  if (!row.name_ru) throw new Error('Название обязательно');
  row.slug = s('slug') || slugify(row.name_ru);

  const file = formData.get('image');
  if (file instanceof File && file.size > 0) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${row.slug}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from('products').upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw new Error(error.message);
    row.image_url = sb.storage.from('products').getPublicUrl(path).data.publicUrl;
  }

  const { error } = id && id !== 'new'
    ? await sb.from('products').update(row).eq('id', id)
    : await sb.from('products').insert(row);
  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}
