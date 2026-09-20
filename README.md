# Fairy Finds Boutique 🌸

> Artisanal ready-to-wear garments and bespoke couture commissions crafted for celebratory grace.

A high-performance luxury fashion e-commerce web application built with Next.js 16, Tailwind CSS v4, TypeScript, and Supabase.

---

## ✨ Features

- **Storefront Experience**:
  - **1920×1080 Editorial Hero Canvas**: Centered typography, narrative storytelling, and transparent-to-solid overlay navigation, with natural aspect-ratio image display and below-image CTA on mobile screens.
  - **Ready-to-Wear Catalog**: Filter by category, collection, size, and in-stock availability.
  - **Size & Stock Intelligence**: Real-time stock indicators per size with out-of-stock commission prompts and interactive size charts (both global presets and bespoke per-garment measurement tables).
  - **Bespoke Tailoring Studio & Custom Portfolio**: 4-step consultation flow for custom bridal, lehenga, and saree commissions with video/reels gallery.
  - **Direct WhatsApp Checkout & Order Reference**: Generates unique order codes (`FFYYMMDD-XXX`), itemizes delivery fees, saves orders to database, and pre-fills WhatsApp hotline chats.
  - **Client Review UGC Marquee**: Editorial portrait cards showing patrons wearing their garments, 5-star ratings, testimonials, and worn garment attribution (touch-scrollable on mobile).
  - **Dark & Light Mode Adaptive Favicon**: Automatically switches between black and white logo icons based on browser/OS theme.
  - **Production-Ready SEO & Schema.org System**: Dynamic `/sitemap.xml`, `/robots.txt` with AI bot permissions, Google Sitelinks schema (`SiteNavigationElement`), dynamic 1200×630 OpenGraph social cards, canonical URLs, and full Schema.org structured data (`ClothingStore`, `Product`, `Offer`, `BreadcrumbList`, `ItemList`).
  - **Agentic Browsing & LLM Discovery**: Native `/llms.txt` and `/llms-full.txt` served from Vercel Edge CDN with CORS & UTF-8 headers for AI agent accessibility.

- **Administrative Portal (`/admin`)**:
  - **Real-Time Order Alert Center (`/admin/orders`)**: Instant order notifications with native Web Audio chime, floating interactive toast alerts, unread badges in navigation, status lifecycle management (`new` ➔ `confirmed` ➔ `shipped` ➔ `delivered`), and one-click customer WhatsApp launcher.
  - **Edge-Level Security**: Protected via Next.js 16 Edge proxy (`proxy.ts`), authenticated session cookies, and Server Action mutation guards (`assertAdmin()`).
  - **Client Onboarding Handbook**: Complete 7-page visual PDF guide with SVG diagrams available at `/docs/Fairy_Finds_Admin_Portal_Guide.pdf`.
  - **Unique Product ID Auto-Generation**: Standardized collision-free SKU generator (`FF-[CAT]-[NAME]-[NUM]`) with live sync and manual override.
  - **Dual Size Chart Management**: Manage reusable boutique-wide presets (`/admin/size-charts`) or build custom per-piece measurement tables directly in the product editor.
  - **Category Management**: Dedicated portal to create, edit, search, and delete categories, plus inline `+ New Category` quick-add inside the product form.
  - **Collections CMS**: Create signature edits, manage banners, and toggle homepage feature status.
  - **Custom Designs Showcase**: Curate bespoke couture portfolio pieces with Instagram video/reels integration (`/admin/custom-designs`).
  - **Homepage Section CMS**: Move Up / Move Down section reordering, visibility toggles, and live text editor.
  - **Apple HEIC Support & Smart Compression**: Client-side conversion of iPhone HEIC/HEIF photos and 80% compression.
  - **Customer Review CMS**: Manage customer UGC outfit photos and testimonials.
  - **SEO & Discovery Control Panel**: 5-tab control center with live Google SERP simulator, database connection diagnostics, curated Kerala keyword bank, page-by-page meta controls, WhatsApp sharing preview, and Search Console/GA4 tags.
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
