export type Locale = 'ru' | 'ky';

export interface Category { id: string; name_ru: string; name_ky: string | null; sort: number }

export interface Product {
  id: string; slug: string; category_id: string | null;
  name_ru: string; name_ky: string | null;
  description_ru: string | null; description_ky: string | null;
  composition_ru: string | null; composition_ky: string | null;
  price: number; old_price: number | null; unit: string | null; image_url: string | null;
  kcal: number | null; protein: number | null; fat: number | null; carbs: number | null;
  shelf_life: string | null; is_own: boolean; labels: string[];
  in_stock: boolean; is_active: boolean; popularity: number; created_at?: string;
}

export interface Zone { id: string; name_ru: string; name_ky: string | null; fee: number; free_from: number; min_order: number; eta: string | null; sort: number }
export interface Store { id: string; name_ru: string | null; name_ky: string | null; address_ru: string; address_ky: string | null; lat: number; lon: number; hours: string | null }
export interface Promo { id: string; title_ru: string; title_ky: string | null; text_ru: string | null; text_ky: string | null; image_url: string | null; link: string | null; active: boolean; sort: number }

export type Sort = 'popular' | 'cheap' | 'expensive' | 'new';
export interface ProductFilter { category?: string; q?: string; min?: number; max?: number; sale?: boolean; own?: boolean; sort?: Sort; ids?: string[]; limit?: number }

export type OrderStatus = 'new' | 'confirmed' | 'cooking' | 'delivering' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
