<div align="center">

# 🥬 DAAM

**Доставка еды и продуктов в Бишкеке — в стиле ВкусВилл**

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

</div>

> Без ключей Supabase сайт работает на демо-данных (`src/lib/seed-data.js`), поэтому его можно сразу запустить и задеплоить.

---

## 📍 Статус проекта

| # | Этап | Статус |
|---|------|:------:|
| 0 | Демо-сайт: каталог, карточка, корзина, оформление, заказ, баллы, админка, RU/KG | ✅ |
| 1 | Зелёная палитра как у ВкусВилла + фото товаров (Wikimedia Commons) | ✅ |
| 2 | Репозиторий на GitHub и деплой на Vercel (демо-режим) | 🔄 **сейчас** |
| 3 | Supabase: реальная база, Storage для фото, `npm run seed` | ⬜ |
| 4 | Реальный ассортимент, цены, КБЖУ, адреса магазинов, зоны доставки | ⬜ |
| 5 | Вход по SMS (провайдер с номерами +996) и баллы | ⬜ |
| 6 | Оплата: Элсом / O!Деньги / MBank / эквайринг | ⬜ |
| 7 | «Как у ВкусВилла»: слоты доставки, статусы в реальном времени, замены товаров, отзывы, кабинет курьера | ⬜ |
| 8 | Карта 2ГИС: подсказка адреса и расчёт зоны по точке | ⬜ |
| 9 | Домен, SEO, оферта, Lighthouse, бэкапы | ⬜ |
| 10 | Мягкий запуск на один район, аналитика, PWA / приложение | ⬜ |

---

## ✨ Что уже есть

- 🏠 Главная: категории, «Готовим сами», скидки, популярное, баллы, приложение, Instagram, магазины на карте
- 🛒 Каталог с фильтрами (категория, цена, скидки, «наше производство», сортировка) и поиск на русском и кыргызском
- 🍽️ Карточка товара: состав, КБЖУ, срок хранения, похожие товары
- 💳 Корзина и оформление: район → стоимость доставки, точка на карте, оплата картой или QR
- 📦 Страница заказа со статусом и оплатой
- 🎁 Вход по SMS-коду, баллы (3% за заказ), история заказов
- 🛠️ Админка: статусы заказов, товары с загрузкой фото
- 🌐 Переключатель языка РУ / КЫ

### Страницы

| URL | Что |
|---|---|
| `/` | Главная |
| `/catalog?category=…&min=&max=&sale=1&own=1&sort=` | Каталог с фильтрами |
| `/product/[slug]` | Карточка товара |
| `/search?q=` | Поиск |
| `/cart`, `/checkout` | Корзина и оформление |
| `/order/[id]` | Статус заказа и оплата |
| `/login`, `/account` | Вход по SMS, баллы и заказы |
| `/promo`, `/delivery`, `/about` | Акции, зоны и оплата, о нас |
| `/admin/orders`, `/admin/products` | Админка |

---

## 🚀 Быстрый старт

Нужен **Node.js 20+**.

```bash
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                  # http://localhost:3000
```

| Команда | Что делает |
|---|---|
| `npm run dev` | Режим разработки |
| `npm run build` | Продакшн-сборка |
| `npm start` | Запуск собранной версии |
| `npm run seed` | Залить демо-каталог в Supabase |

---

## 🗂️ Структура

```
src/
  app/            страницы и API-роуты (App Router)
  components/     UI, корзина, карточки товаров
  lib/            данные, i18n (dict.ts), платежи, утилиты, Supabase
supabase/schema.sql   схема БД и RLS
scripts/seed.mjs      заливка каталога
public/products/      фото товаров + CREDITS.json (авторы и лицензии)
```

---

## ☁️ Деплой на Vercel

1. Запушить репозиторий на GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → импортировать репозиторий `DAAM-project`. Framework определится как Next.js.
3. В **Environment Variables** добавить переменные из `.env.example` (для демо-режима можно ничего не добавлять).
4. **Deploy**. Дальше каждый push в `main` деплоится автоматически, а PR получают preview-ссылки.

---

## 🗄️ Supabase

1. Создать проект на [supabase.com](https://supabase.com) (регион Frankfurt).
2. В **SQL Editor** выполнить `supabase/schema.sql`.
3. **Authentication → Providers → Phone**: включить и подключить SMS-провайдера (Twilio, Vonage, MessageBird). Проверить доставку SMS на номера +996.
4. Записать ключи из **Project Settings → API** в `.env.local` и в переменные Vercel, затем выполнить `npm run seed`.
5. Войти на сайте по своему номеру и выдать себе права администратора:
   ```sql
   update profiles set is_admin = true where phone = '996XXXXXXXXX';
   ```
6. В Supabase → **Authentication → URL Configuration** указать домен Vercel в Site URL.

### Переменные окружения

| Переменная | Для чего |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Подключение к Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Только на сервере! Не публиковать |
| `NEXT_PUBLIC_2GIS_KEY` | Карта и геокодинг 2ГИС (без ключа карта скрыта) |
| `PAYMENT_PROVIDER` | `demo` или провайдер |
| `PAYMENT_WEBHOOK_SECRET` | Подпись webhook оплаты |
| `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_APPSTORE_URL`, `NEXT_PUBLIC_GOOGLEPLAY_URL` | Ссылки в футере |

---

## 🗺️ 2ГИС

Ключ на [dev.2gis.com](https://dev.2gis.com): нужны MapGL JS API и Catalog API. Записать в `NEXT_PUBLIC_2GIS_KEY` и ограничить ключ доменами сайта.

## 💳 Оплата

Сейчас `PAYMENT_PROVIDER=demo`: на странице заказа есть кнопка «Оплатить (демо)». Для реальной оплаты:

- `src/lib/payments.ts` → `createPayment()`: создать платёж у провайдера и вернуть URL формы оплаты или данные QR;
- `src/app/api/payment/webhook/route.ts`: проверить подпись и обновить `payment_status`.

Суммы пересчитываются на сервере (`/api/orders`), цене из браузера сервер не доверяет.

---

## 🧠 Логика

- **Доставка:** таблица `zones` (стоимость, бесплатно от, минимальный заказ, время).
- **Баллы:** 3% от суммы (`POINTS_RATE` в `src/lib/utils.ts`), начисляются при статусе «Доставлен».
- **Безопасность:** RLS на всех таблицах, заказы создаёт только сервер, пользователь видит только свои.
- **Дизайн:** палитра в `src/app/globals.css` (`brand`, `brand-dark`, `brand-soft`, `sale`).

## 🖼️ Фото и лицензии

Демо-фото взяты с Wikimedia Commons (CC0, общественное достояние, CC BY, CC BY-SA). Авторы и ссылки в `public/products/CREDITS.json`. Для CC BY / CC BY-SA нужна атрибуция, поэтому перед публичным запуском добавьте указание авторов на сайт или замените фото своими.

## ✅ Перед запуском

- [ ] Заменить демо-цены, КБЖУ, адреса магазинов и зоны доставки на реальные
- [ ] Проверить кыргызские переводы с носителем языка
- [ ] Загрузить свои фото через админку
- [ ] Подключить SMS, оплату и 2ГИС
