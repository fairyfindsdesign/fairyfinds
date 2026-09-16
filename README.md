# Fairy Finds Boutique 🌸

> Artisanal ready-to-wear garments and bespoke couture commissions crafted for celebratory grace.

A high-performance luxury fashion e-commerce web application built with Next.js 16, Tailwind CSS v4, TypeScript, and Supabase.

---

## ✨ Features

- **Storefront Experience**:
  - **1920×1080 Editorial Hero Canvas**: Centered typography, narrative storytelling, and transparent-to-solid overlay navigation.
  - **Ready-to-Wear Catalog**: Filter by category, collection, size, and in-stock availability.
  - **Size & Stock Intelligence**: Real-time stock indicators per size with out-of-stock commission prompts.
  - **Bespoke Tailoring Atelier**: 4-step consultation flow for custom bridal, lehenga, and saree commissions.
  - **Direct WhatsApp Checkout**: Itemized cart messages formatted directly to the boutique hotline.
  - **Client Review UGC Marquee**: Editorial portrait cards showing patrons wearing their garments, 5-star ratings, testimonials, and worn garment attribution (touch-scrollable on mobile).
  - **Dark & Light Mode Adaptive Favicon**: Automatically switches between black and white logo icons based on browser/OS theme.
  - **Production-Ready SEO & Schema.org System**: Dynamic `/sitemap.xml`, `/robots.txt`, dynamic 1200×630 OpenGraph social cards, canonical URLs, and full Schema.org structured data (`ClothingStore`, `Product`, `Offer`, `BreadcrumbList`, `ItemList`).

- **Administrative Portal (`/admin`)**:
  - **Password Protected**: Edge route protection via `proxy.ts` with session cookies.
  - **Unique Product ID Auto-Generation**: Standardized collision-free SKU generator (`FF-[CAT]-[NAME]-[NUM]`) with live sync and manual override.
  - **Category Management**: Dedicated portal to create, edit, search, and delete categories, plus inline `+ New Category` quick-add inside the product form.
  - **Collections CMS**: Create signature edits, manage banners, and toggle homepage feature status.
  - **Homepage Section CMS**: Move Up / Move Down section reordering, visibility toggles, and live text editor.
  - **Apple HEIC Support & Smart Compression**: Client-side conversion of iPhone HEIC/HEIF photos and 80% compression.
  - **Customer Review CMS**: Manage customer UGC outfit photos and testimonials.
  - **SEO & Discovery Control Panel**: 5-tab control center with live Google SERP simulator, curated Kerala & Kottayam keyword suggestion bank, page-by-page meta controls, WhatsApp sharing preview, and Search Console/GA4 tags.
  - **Store & WhatsApp Settings**: Hotline number, boutique address, and announcement banner.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database / Cloud**: [Supabase](https://supabase.com/) (PostgreSQL) with local JSON store fallback (`data/store.json`)
- **Image Processing**: `heic2any` with fast-path magic byte detection

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 🔐 Administrative Access

- **Login URL**: `/admin/login`
- **Default Passkey**: `fairyfinds@123` (configure via `ADMIN_PASSWORD` in `.env.local`)

---

## 📖 Complete Documentation

For detailed architecture, database schemas, color systems, and CMS operations, refer to [DOCUMENTATION.md](./DOCUMENTATION.md).
