# 🪵 Олійник Меблі — Next.js 14

Повноцінний інтернет-магазин меблів на **Next.js 14 App Router** + **TypeScript** + **sql.js**.

---

## 📁 Структура проєкту

```
oliynyk-next/
├── app/
│   ├── layout.tsx          ← Root layout, metadata, Schema.org
│   ├── page.tsx            ← Server Component — головна сторінка
│   ├── globals.css         ← Усі стилі
│   ├── sitemap.ts          ← Динамічний sitemap.xml
│   ├── robots.ts           ← robots.txt
│   └── api/
│       ├── products/route.ts       ← GET /api/products
│       ├── orders/route.ts         ← POST /api/orders
│       └── consultations/route.ts  ← POST /api/consultations
├── components/
│   ├── ShopClient.tsx      ← Client shell: кошик, стан, layout
│   ├── ui/
│   │   ├── Navbar.tsx      ← Fixed navbar зі scroll-ефектом
│   │   ├── CartSidebar.tsx ← Кошик + оформлення замовлення
│   │   └── ProductModal.tsx← Модальне вікно товару
│   └── sections/
│       ├── HeroSection.tsx     ← Hero з хітом продажу
│       ├── Catalog.tsx         ← Фільтри + сітка товарів
│       ├── ReviewsCarousel.tsx ← Карусель відгуків
│       ├── ContactForm.tsx     ← Форма консультації
│       └── RevealInit.tsx      ← Intersection Observer
├── lib/
│   ├── types.ts   ← TypeScript типи (Product, Order, Cart...)
│   ├── db.ts      ← sql.js singleton, всі CRUD операції
│   └── utils.ts   ← slugify, calcPrice, formatPrice
└── public/
    ├── favicon.svg
    └── site.webmanifest
```

---

## 🚀 Запуск локально

```bash
# 1. Встановити залежності
npm install

# 2. Скопіювати .env
cp .env.local.example .env.local

# 3. Запустити dev-сервер
npm run dev
```

Відкрити: **http://localhost:3000**

---

## 🏗️ Архітектура

### Server Components (SSR)
- `app/page.tsx` — отримує товари **прямо з БД** без HTTP round-trip
- `app/sitemap.ts` — генерує sitemap з актуальними товарами
- Schema.org Product JSON-LD генерується на сервері

### Client Components
- `ShopClient` — керує станом кошика, відкриттям модалок
- `Navbar` — scroll-ефект, мобільне меню
- `CartSidebar` — кошик + форма оформлення
- `ProductModal` — опції, динамічна ціна
- `Catalog` — фільтрація по категоріях
- `ReviewsCarousel` — нескінченна карусель вправо

### API Routes
| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/products` | Каталог товарів |
| POST | `/api/orders` | Нове замовлення + Telegram |
| POST | `/api/consultations` | Заявка + Telegram |

---

## 🌐 Деплой

### Vercel (найпростіший варіант)
```bash
npm install -g vercel
vercel
```
Додайте змінні середовища в Vercel Dashboard.

> ⚠️ **Важливо:** sql.js зберігає БД у файл `data/oliynyk.sqlite`.
> На Vercel файлова система **ephemeral** — дані скидаються при redeployment.
> Для продакшну використовуйте Vercel Postgres, PlanetScale або Railway з PostgreSQL.

### VPS / Railway
```bash
npm run build
npm start
```
На VPS дані зберігаються постійно у `data/oliynyk.sqlite`.

---

## 📱 Telegram-сповіщення

1. Створіть бота через [@BotFather](https://t.me/BotFather)
2. Отримайте chat_id через [@userinfobot](https://t.me/userinfobot)
3. Додайте в `.env.local`:
```env
TELEGRAM_BOT_TOKEN=1234567890:AAF...
TELEGRAM_CHAT_ID=123456789
```
