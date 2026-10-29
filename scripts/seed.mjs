// Заливает демо-данные в Supabase: npm run seed (нужен .env.local с SERVICE_ROLE ключом)
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, PRODUCTS, ZONES, STORES, PROMOS } from '../src/lib/seed-data.js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local'); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

for (const [table, rows] of [['categories', CATEGORIES], ['zones', ZONES], ['stores', STORES], ['promotions', PROMOS], ['products', PRODUCTS]]) {
  const { error } = await sb.from(table).upsert(rows);
  if (error) { console.error(`✗ ${table}: ${error.message}`); process.exit(1); }
  console.log(`✓ ${table}: ${rows.length}`);
}
