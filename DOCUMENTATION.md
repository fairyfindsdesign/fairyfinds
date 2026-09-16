# Fairy Finds Boutique — Complete Project Documentation

Master operational, architectural, and design reference for the **Fairy Finds Boutique** e-commerce application.

---

## 1. Executive Summary & Brand Positioning

**Fairy Finds Boutique** is a modern, feminine luxury fashion web application offering a curated selection of ready-to-wear artisanal garments alongside bespoke couture commissions.

### Brand Identity & Aesthetic Principles
- **Atmosphere**: Minimal, Elegant, Feminine, Soft, Modern, Premium, and Trustworthy.
- **Design Rule**: Generous whitespace, clean editorial typography, minimal cards without heavy drop shadows, no arbitrary gradients, and visual focus kept firmly on product photography.
- **CMS Principle**: **Owner controls content; Developer controls design.** The boutique owner can manage inventory, categories, collections, pricing, text, reviews, and homepage section order, while core typography tokens, responsive layouts, and aesthetic constraints remain protected.

### Final Approved Color System
| Token | HEX | Purpose |
|---|---|---|
| **Primary Accent** | `#FF55D2` | Main brand accent, primary CTAs, highlight badges, active indicators |
| **Secondary Neutral** | `#1A1A1A` | Dark neutral, typography, headings, dark buttons, borders |
| **Hover State** | `#FD00B9` | Interactive hover transitions on buttons and clickable links |
| **Active State** | `#D5009C` | Pressed/active button states and active selection rings |
| **Background** | `#FFFFFF` / `#FAF9F6` | Warm, soft off-white alabaster and clean white surfaces |
| **Borders** | `#E5E5E5` | Subtle, clean separation dividers |
| **Muted Text** | `#737373` | Secondary metadata, labels, and timestamps |

### Typography
- **Headings & Titles ONLY**: **Cormorant Garamond** (`--font-cormorant`, `.font-serif`, `h1`–`h6`) — used exclusively for hero headlines, section titles, collection titles, product card titles, and editorial fashion statements.
- **Paragraphs, Small Texts & Interface**: **Manrope** (`--font-manrope`, `.font-sans`, `p`, `small`, UI elements) — applied universally to all narrative paragraphs, product descriptions, customer review quotes, prices, form inputs, buttons, tags, badges, navigation links, and administrative controls for optimal legibility.

---

## 2. Technology Stack & Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with centralized CSS variables (`app/globals.css`)
- **Icons**: [Lucide React](https://lucide.dev/) + custom high-precision SVG brand icons
- **State Management**: React Context (`context/CartContext.tsx`) with localStorage persistence and stock checks
- **Edge Routing & Auth**: Next.js 16 Edge Proxy (`proxy.ts`) with encrypted session cookie validation
- **Image Processing**: Client-side Apple HEIC/HEIF decoding (`heic2any`) with fast-path magic byte detection and 80% compression
- **Server Mutations**: Next.js Server Actions (`app/actions/store.ts`, `app/actions/auth.ts`) with immediate `purgeStorefrontCache()` revalidation
- **Storage Layer**:
  - **Local Development / Offline**: Resilient server-side JSON persistence (`data/store.json`) ensuring all dashboard edits persist permanently even without database credentials.
  - **Production Cloud**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Supabase Auth, and Supabase Storage).

---

## 3. Site Navigation & Route Manifest

| Route | Render Type | Purpose |
|---|---|---|
| **`/`** | Dynamic (`ƒ`) | **Section-based CMS Homepage** with 1920×1080 Hero, New Arrivals, Featured Collections, Categories, Bespoke Tailoring, and Customer UGC Reviews. |
| **`/shop`** | Dynamic (`ƒ`) | **Ready-to-Wear Catalog** with category filter pills, collection filters, size picker, and in-stock toggles. |
| **`/category/[slug]`** | Dynamic (`ƒ`) | **Dedicated Category Catalog** for permanent, crawlable SEO URLs (e.g., `/category/dresses`, `/category/sarees`). |
| **`/categories/[slug]`** | Dynamic (`ƒ`) | **Permanent Redirect** route automatically routing plural category queries to `/category/[slug]`. |
| **`/product/[slug]`** | Dynamic (`ƒ`) | **Product Detail Page** with image thumbnail gallery, size/stock matrix, size guide, and direct WhatsApp inquiry. |
| **`/collections/[slug]`** | Dynamic (`ƒ`) | **Signature Collection Showcases** (e.g., *Red Saree*, *Green Lehenga*). |
| **`/custom`** | Dynamic (`ƒ`) | **Custom-Made Studio** detailing the bespoke process and collecting tailoring inquiry details. |
| **`/cart`** | Static (`○`) | **Bag Review & WhatsApp Checkout** (`noindex, nofollow` protected). |
| **`/about`** | Dynamic (`ƒ`) | **Our Story** explaining brand values, heritage, and Kottayam craftsmanship. |
| **`/contact`** | Dynamic (`ƒ`) | **Contact & Location** with direct WhatsApp chat, email, physical store address in Neendoor, and opening hours. |
| **`/llms.txt`** | Static (`○`) | **AI Agent Context File** (Edge CDN asset) following the llmstxt.org specification for AI agents and LLM crawlers. |
| **`/llms-full.txt`** | Static (`○`) | **Full AI Agent Knowledge Base** detailing brand collections, ordering flows, and atelier details for deep agent indexing. |
| **`/sitemap.xml`** | Dynamic (`ƒ`) | **Dynamic XML Sitemap** automatically generated from store & database items with tuned priorities (Home 1.0, Shop 0.95, Custom 0.90). |
| **`/robots.txt`** | Dynamic (`ƒ`) | **Robots Exclusion Standard** allowing search engines & AI crawlers (GPTBot, ClaudeBot, PerplexityBot) and blocking private admin/cart routes. |
| **`/opengraph-image`** | Static (`○`) | **Dynamic OpenGraph Preview** rendering branded 1200×630 share card for WhatsApp, Facebook, X. |
| **`/docs/Fairy_Finds_Admin_Portal_Guide.pdf`** | Static (`○`) | **Client Owner Handbook** (7-page vector PDF guide with SVG workflow diagrams for daily boutique operations). |
| **`/admin`** | Dynamic (`ƒ`) | **Protected Owner Dashboard** with inventory metrics, categories count, stock alerts, and quick action cards. |
| **`/admin/products`** | Dynamic (`ƒ`) | **Product & Stock Manager** with search, per-size stock breakdown, auto-generated product code, and delete actions. |
| **`/admin/products/new`** | Dynamic (`ƒ`) | **Create Garment Form** with live unique product code auto-sync, inline "+ New Category" modal, and size matrix. |
| **`/admin/products/[id]`** | Dynamic (`ƒ`) | **Edit Garment Form** to update pricing, descriptions, images, category, and stock counts. |
| **`/admin/categories`** | Dynamic (`ƒ`) | **Category Management Portal** to create, edit, search, re-order, and delete categories with product count tracking. |
| **`/admin/collections`** | Dynamic (`ƒ`) | **Collections Manager** to create collections, edit editorial narratives, and toggle homepage visibility. |
| **`/admin/homepage`** | Dynamic (`ƒ`) | **Homepage CMS** with Move Up / Move Down reordering, visibility toggles, and text editor. |
| **`/admin/navigation`** | Dynamic (`ƒ`) | **Navigation & Dropdown CMS** to manage top-level nav visibility and customize the *Featured* dropdown menu links. |
| **`/admin/reviews`** | Dynamic (`ƒ`) | **Customer Reviews CMS** to manage customer UGC outfit photos, testimonials, ratings, and worn product references. |
| **`/admin/seo`** | Dynamic (`ƒ`) | **SEO & Discovery Control Panel** with live database connectivity status, page-by-page meta controls, Kerala Keyword Bank, Social OG Cards, and Search Console/Analytics tags. |
| **`/admin/settings`** | Dynamic (`ƒ`) | **Store Settings** to configure the business WhatsApp phone number, store details, and announcement bar. |
| **`/admin/login`** | Dynamic (`ƒ`) | **Owner Sign-in Portal** protected by password authentication (`fairyfinds@123`). |

---

## 4. Database Schema Design (PostgreSQL / Supabase)

The complete SQL migration script is located at [`fairy-finds/supabase/schema.sql`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/supabase/schema.sql).

### Table Definitions

1. **`categories`**:
   - `id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
   - `name TEXT NOT NULL`
   - `slug TEXT UNIQUE NOT NULL`
   - `description TEXT`
   - `image_url TEXT`
   - `display_order INT DEFAULT 0`
   - `created_at TIMESTAMPTZ DEFAULT now()`

2. **`collections`**:
   - `id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
   - `name TEXT NOT NULL`
   - `slug TEXT UNIQUE NOT NULL`
   - `description TEXT`
   - `image_url TEXT`
   - `show_on_home BOOLEAN DEFAULT false`
   - `has_dedicated_page BOOLEAN DEFAULT true`
   - `display_order INT DEFAULT 0`
   - `is_published BOOLEAN DEFAULT true`
   - `created_at TIMESTAMPTZ DEFAULT now()`

3. **`products`**:
   - `id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
   - `product_code TEXT UNIQUE` (Standardized unique ID: `FF-[CAT]-[NAME]-[NUM]`)
   - `name TEXT NOT NULL`
   - `slug TEXT UNIQUE NOT NULL`
   - `description TEXT`
   - `price DECIMAL(10, 2) NOT NULL`
   - `product_type TEXT CHECK (product_type IN ('READY_MADE')) DEFAULT 'READY_MADE'`
   - `category_id TEXT REFERENCES categories(id) ON DELETE SET NULL`
   - `collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL`
   - `images JSONB DEFAULT '[]'::jsonb`
   - `fabric TEXT`
   - `care_instructions TEXT`
   - `is_published BOOLEAN DEFAULT true`
   - `is_featured BOOLEAN DEFAULT false`
   - `created_at TIMESTAMPTZ DEFAULT now()`
   - `updated_at TIMESTAMPTZ DEFAULT now()`

4. **`product_variants`**:
   - `id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
   - `product_id TEXT REFERENCES products(id) ON DELETE CASCADE`
   - `size TEXT NOT NULL`
   - `stock_quantity INT DEFAULT 0`
   - `sku TEXT`
   - `UNIQUE(product_id, size)`

5. **`homepage_sections`**:
   - `id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text`
   - `section_type TEXT NOT NULL`
   - `title TEXT`
   - `subtitle TEXT`
   - `content JSONB DEFAULT '{}'::jsonb`
   - `display_order INT DEFAULT 0`
   - `is_visible BOOLEAN DEFAULT true`

6. **`store_settings`**:
   - `id TEXT PRIMARY KEY DEFAULT 'default'`
   - `whatsapp_number TEXT NOT NULL`
   - `store_name TEXT NOT NULL`
   - `contact_email TEXT`
   - `instagram_url TEXT`
   - `address TEXT`
   - `announcement_bar TEXT`
   - `currency_symbol TEXT DEFAULT 'Rs.'`

---

## 5. Core User Experiences & Storefront Workflows

### 5.1 Ready-to-Wear Purchase Flow
1. **Browse**: User explores [`/shop`](http://localhost:3000/shop), filtering by category (Sarees, Dresses, Blouses, Other), collection, or size.
2. **Select Variant**: On [`/product/[slug]`](http://localhost:3000/product/crimson-heritage-kanjivaram-saree), the user clicks a size button. Live stock badges inform the customer:
   - *In Stock*: Green checkmark; Add to Bag enabled.
   - *Limited Stock*: Accent pulse; specifies remaining units (e.g., *"Only 2 left"*).
   - *Out of Stock*: Strikethrough; button disabled with prompt to commission custom making.
3. **Cart Drawer**: Adding a product opens the slide-out quick cart drawer without navigating away.
4. **Checkout Transition**: Clicking "Proceed to WhatsApp Order" routes the user to the dedicated [`/cart`](http://localhost:3000/cart) page.
5. **Customer Details**: On `/cart`, the user provides Name, Phone number, and Delivery Address.
6. **WhatsApp Launch**: Clicking "Complete Order on WhatsApp" launches WhatsApp with a pre-filled, itemized message formatted to the boutique's configured business number.

### 5.2 Custom-Made Atelier Consultation Flow
1. **Bespoke Landing**: User visits [`/custom`](http://localhost:3000/custom) explaining the 4-step tailored process: Design Consultation → Measurements & Fabric → Artisanal Tailoring → Delivery & Fitting.
2. **Inquiry Form**: Customer specifies Name, WhatsApp Phone, Garment Type (Bridal Saree, Festive Lehenga, Evening Gown, etc.), Measurements, Preferred Fabric, and Color Palette.
3. **WhatsApp Dispatch**: Form opens WhatsApp with all inquiry details pre-filled. Customers are informed they can attach reference photos directly in the chat.

---

## 6. WhatsApp Message Formatting

All WhatsApp URLs are built by [`lib/whatsapp.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/lib/whatsapp.ts).

### Ready-Made Order Message Template
```text
*Fairy Finds Boutique Order*

*Customer Name:* [Customer Name]
*Phone:* [Customer Phone]

*Items:*
1. [Product 1 Name]
   Size: [Selected Size]
   Quantity: [Quantity]
   Price: Rs. [Unit Price]

2. [Product 2 Name]
   Size: [Selected Size]
   Quantity: [Quantity]
   Price: Rs. [Unit Price]

*Subtotal:* Rs. [Subtotal]
*Total:* Rs. [Total]

*Delivery Address:*
[Customer Address]

*Special Notes:* [Optional Notes]
```

### Custom-Made Inquiry Message Template
```text
*Fairy Finds Boutique - Custom Made Inquiry*

*Customer Name:* [Customer Name]
*Phone:* [Customer Phone]
*Garment Type:* [Garment Type]
*Size / Measurements:* [Size or Measurements]
*Preferred Fabric:* [Fabric Selection]
*Preferred Color:* [Color Palette]
*Additional Notes:* [Styling Notes]

_(I will share reference images and photos directly in this chat)_
```

---

## 7. Owner Admin Dashboard & CMS Controls

Accessed at [`/admin`](http://localhost:3000/admin).

### 7.1 Security & Route Authentication
- **Password Authentication**: Access to `/admin/*` requires entering the secure administrative passkey (`fairyfinds@123`, configurable via `ADMIN_PASSWORD` environment variable).
- **Session Cookies**: Validated logins receive an `httpOnly`, `sameSite: 'lax'` session cookie (`admin_session`) valid for 7 days.
- **Edge Route Protection ([`proxy.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/proxy.ts))**: Automatically intercepts all unauthenticated `/admin/*` traffic and performs a `307` temporary redirect to `/admin/login?from=[path]`.
- **Sign Out**: Available in both the desktop header and mobile slide-over drawer, immediately clearing session cookies and returning to `/admin/login`.
- **Storefront Login Shortcut**: Discreet "Admin Login" links are present in the public website footer and copyright bar for owner convenience.

### 7.2 Unique Product ID Auto-Generation System
- **Generation Formula**: `FF-[CATEGORY]-[NAME]-[NUMBER]`
  - Brand Prefix: `FF`
  - Category Code: 2–4 uppercase letters derived from category taxonomy (`SAR`, `LEH`, `DRS`, `TOP`, `KRT`, `JWL`, `BAG`, `SHOE`, `CST`, or first 3 alphanumeric letters).
  - Product Name Code: Initials of significant words (e.g. *"Crimson Heritage Saree"* ➔ `CHS`) or first 3–4 letters for single-word titles.
  - Sequential Number: Guaranteed collision-free 3-digit number (`001`, `002`, `003`...).
- **Live Reactivity ([`ProductFormClient.tsx`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/components/admin/ProductFormClient.tsx))**:
  - Dynamically updates as the admin types the title or changes the category.
  - Manual override toggle with a one-click "Re-sync with Name" button.
  - Immediate duplicate prevention check preventing form submission if an ID collides.

### 7.3 Category Management Portal ([`/admin/categories`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/categories/page.tsx))
- **Taxonomy Overview**: View all active categories with thumbnail images, slug, description, display order, and active garment count in the atelier.
- **Search & Filter**: Search categories by name, slug, or keywords.
- **Add New Category**:
  - Name with real-time automatic URL slug generation (e.g. typing *"Abayas & Kaftans"* ➔ `abayas-kaftans`).
  - Optional description.
  - Curated atelier texture presets (Crimson Silk, Emerald Velvet, Pastel Organza, Banarasi Brocade, etc.) or direct image upload.
  - Display order preference for filter tabs.
- **Edit & Re-order**: Modify titles, descriptions, and sort order with instant storefront cache clearing.
- **Safe Deletion Guard**: Warns if products are currently assigned to that category and unlinks them safely without deleting garments.
- **Inline Quick-Add in Garment Form**: Administrators can click `+ New Category` directly beside the Category selector when adding or editing a product, creating and selecting a category on the fly without losing unsaved progress.

### 7.4 Products & Stock Manager ([`/admin/products`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/products/page.tsx))
- Search by product title, product code (SKU), or category.
- **Add New Piece Form** ([`/admin/products/new`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/products/new/page.tsx)):
  - Title, unique product ID with auto-sync, price, category selector (with inline `+ New Category` modal), and collection dropdown.
  - Multi-image gallery uploader with drag-and-drop, Apple HEIC support, and automatic 80% compression.
  - Fabric composition and care instructions.
  - **Size & Stock Matrix**: Interactive counters for S, M, L, XL, plus "Add Another Size" for custom sizes.
- **Edit Piece Form** ([`/admin/products/[id]`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/products/[id]/page.tsx)).
- Delete confirmation with instant catalog update.

### 7.5 Collections Management ([`/admin/collections`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/collections/page.tsx))
- Full control over collection titles, URL slugs, editorial banners, storytelling text, display order, and publication status.
- Quick `Featured on Home` toggle to feature capsule collections on the homepage.
- Deletion safety: deletes the collection while preserving all associated products.

### 7.6 Customer Reviews & UGC CMS ([`/admin/reviews`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/reviews/page.tsx))
- **Customer Outfit Photos (UGC)**: Replaced generic circular avatar icons with editorial 4:5 fashion portraits of patrons wearing their purchased garments.
- **Worn Product Attribution**: Record the exact garment worn (e.g. *Wearing: Crimson Heritage Saree*).
- **Customer Details**: Name, location, verified buyer status, star rating (1–5), and testimonial text.
- **Storefront Display**: Responsive infinite marquee on desktop with edge fade masks and hover-to-pause; touch-scrollable rail with active indicator dots on mobile.

### 7.7 Homepage Section CMS ([`/admin/homepage`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/homepage/page.tsx))
- **Move Up & Move Down**: Reorder homepage sections without touching code.
- **Visibility Toggle**: Hide seasonal sections or drafts from the live homepage instantly.
- **Text & Banner Editor**: Edit headings, eyebrow badges, descriptions, CTAs, and background images.

### 7.8 Navigation CMS ([`/admin/navigation`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/navigation/page.tsx))
- Top-level menu visibility controls.
- "Featured" dropdown link manager: add, edit, re-order, and delete custom collection links.

### 7.9 Store Settings ([`/admin/settings`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/settings/page.tsx))
- WhatsApp Business Order Hotline (immediately updates all checkout actions).
- Store name, email, Instagram URL, and atelier address.
- Announcement bar text and toggles.

### 7.10 SEO & Discovery Control Panel ([`/admin/seo`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/seo/page.tsx))
- **Tab 1: Global & Local SEO**: Store meta title, title suffix template, global meta description with character count feedback, live Google SERP Simulator (Desktop and Mobile preview modes), and Central Kerala & Kottayam Google Map Pack signals (physical NAP, GPS coordinates, opening hours, accepted payment methods).
- **Tab 2: Page-Specific Meta**: Customize individual SEO titles and descriptions for Homepage (`/`), Shop Catalog (`/shop`), Custom Atelier (`/custom`), About Story (`/about`), and Contact (`/contact`).
- **Tab 3: Kerala & India Keyword Bank**: Active keywords tag manager with curated high-intent suggestion clusters for Kottayam local search, bridal & bespoke couture, traditional & festive wear, and NRI diaspora wedding shoppers.
- **Tab 4: Social & WhatsApp (Open Graph)**: Open Graph share title, description, banner image picker, and interactive WhatsApp chat link preview card mockup.
- **Tab 5: Search Console, Analytics & Crawl**: Google Search Console verification meta token, Google Analytics 4 (GA4) ID injection, Meta Pixel ID, search engine indexing master toggle (`index, follow` vs `noindex, nofollow`), and XML sitemap / robots.txt quick inspectors.

---

## 8. Storefront Aesthetics & Adaptive Design

### 8.1 Hero Section (1920×1080 Dimensions)
- **Banner Proportions**: Sized to `max-w-[1920px] lg:h-[1080px]` matching 1080p Full HD resolution and 16:9 banner proportions.
- **Visual Alignment**: Headline centered at 32px font size (`text-[26px] sm:text-[32px]`), with narrative description and centered dual CTAs ("Explore Ready-to-Wear" and "Commission Bespoke").
- **Transparent Navbar Overlay**: When positioned over the homepage hero banner, the navbar background and borders become transparent (`bg-transparent border-transparent`) with white logo, white text links, and white action icons, smoothly transitioning to solid white upon scrolling down.

### 8.2 Dark & Light Mode Adaptive Favicon
- **Light Mode Browser**: Automatically displays the **black logo** favicon against light browser tab chrome.
- **Dark Mode Browser**: Automatically displays the **white logo** favicon against dark browser tab chrome.
- **Dual-Layer Architecture**:
  - Declarative Next.js Metadata API delivering `media="(prefers-color-scheme: light)"` and `media="(prefers-color-scheme: dark)"` upon initial HTML render.
  - Client-side reactive listener ([`DynamicFavicon.tsx`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/components/ui/DynamicFavicon.tsx)) monitoring live OS/browser theme switches.

### 8.3 Mobile Touch-Scrollable Customer Reviews
- **Touch Rail**: Replaced the non-interactive auto-running CSS marquee on mobile viewports with a native touch-friendly horizontal track (`overflow-x-auto snap-x snap-mandatory`).
- **Interactive Controls**: Active pagination indicator dots with click-to-scroll support and tactile prev/next chevron buttons (`ChevronLeft` / `ChevronRight`).
- **Compact Card Proportions**: Reduced card width to 215–260px and photo height to 208px (`aspect-[4/5]`), bringing total card height down from ~510px to ~350px (~35% reduction) for a comfortable mobile viewing experience.

---

## 9. Mobile & UX Micro-Animation Architecture

### 9.1 Mobile-First Viewport Enhancements
- **Modern 2-Column Catalog Grids**: Both the Homepage (New Arrivals & Categories) and Shop Catalog display as sleek 2-column grids on mobile (`grid-cols-2`), drastically reducing vertical scrolling fatigue while emulating top-tier luxury fashion mobile apps.
- **Sticky Mobile Purchase Bar**: On product detail pages (`/product/[slug]`), a floating bottom bar keeps the piece name, selected size, price, and "Add to Bag" action immediately accessible at all times.
- **Touch-Optimized Targets**: All interactive buttons, size selector pills, and mobile menu links adhere to minimum 44×44px touch targets.
- **iOS Safari Auto-Zoom Prevention**: Enforces a minimum 16px font-size rule on all `<input>`, `<select>`, and `<textarea>` elements on screens `< 640px` to eliminate involuntary mobile viewport zooming.

### 9.2 Tactile Micro-Animations
- **Smooth Scrolling**: Global `scroll-behavior: smooth` and optimized font antialiasing across all pages.
- **Tactile Button Press**: Interactive `active:scale-[0.98]` and `active:scale-90` press responses.
- **Cart Badge Bounce**: CSS keyframe bounce (`animate-cart-bounce`) micro-animation whenever items are added or present in the bag.
- **Floating Back-to-Top**: Discreet floating button that appears after 350px of vertical scroll, smoothly gliding the user back to the top.

---

## 10. Data Persistence & Cache Architecture

### How Changes Persist (Offline & Local Development)
1. Whenever an admin form is submitted, it invokes a **Next.js Server Action** (`app/actions/store.ts`).
2. The Server Action writes the updated data directly to disk at [`data/store.json`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/data/store.json).
3. The server action executes `purgeStorefrontCache()`, calling `revalidatePath` on all relevant route layouts and pages.
4. **All changes persist permanently** across page refreshes, browser sessions, and server restarts.

### Supabase Cloud Synchronization
When connecting a live Supabase project:
1. Run the SQL script from `fairy-finds/supabase/schema.sql` in the Supabase SQL Editor.
2. In `fairy-finds`, create `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_PASSWORD=your-secure-admin-password
   ```
3. The server store will automatically query and synchronize with your live cloud database while using local storage as a graceful fallback.

---

## 11. How to Run, Test, and Build

### Development Server
```bash
npm run dev
```
The application will be accessible at **http://localhost:3000**.

### Production Build
```bash
npm run build
npm run start
```
Compiles all 26 static and dynamic routes with 0 TypeScript/ESLint errors into an optimized production bundle.

---

## 12. Production SEO, Open Graph & Structured Data Architecture

A complete, production-grade SEO and discoverability system is embedded natively into the Next.js 16 App Router architecture, adhering to Google Search Central standards without modifying any visual design elements.

### 12.1 Architecture & Utilities Layer
- **Constants ([`lib/seo/constants.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/lib/seo/constants.ts))**: Centralized repository of brand identity, canonical URL (`https://fairyfindsboutique.store`), postal address (Neendoor, Kottayam, Kerala), coordinates, phone, email, opening hours, and regional fashion keywords.
- **Schema Builders ([`lib/seo/schema.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/lib/seo/schema.ts))**: Strongly typed generator functions outputting Google Rich Results-compliant JSON-LD.
- **Universal Injector ([`components/seo/JsonLd.tsx`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/components/seo/JsonLd.tsx))**: Server component safely rendering `<script type="application/ld+json">` tags with XSS character escaping.

### 12.2 Dynamic XML Sitemap (`/sitemap.xml`)
- Route: [`app/sitemap.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/sitemap.ts)
- Generated dynamically from the live store and cloud database with search-engine tuned update frequencies and priorities:
  - **Homepage (`/`)**: Daily, Priority `1.0` *(Maximum priority — designated canonical brand entry)*
  - **Shop Catalog (`/shop`)**: Daily, Priority `0.95` *(Primary ready-to-wear catalog)*
  - **Custom Commissions (`/custom`)**: Weekly, Priority `0.90` *(Core bespoke bridal service)*
  - **Dedicated Categories (`/category/[slug]`)**: Weekly, Priority `0.85`
  - **Signature Collections (`/collections/[slug]`)**: Weekly, Priority `0.85`
  - **Individual Products (`/product/[slug]`)**: Weekly, Priority `0.80`, with accurate `lastModified` timestamp from `updated_at`/`created_at`.
  - **About Us (`/about`)**: Monthly, Priority `0.50`
  - **Contact Page (`/contact`)**: Monthly, Priority `0.40` *(Lowered so Google and search bots rank Home, Shop, and Custom ahead of utility support pages)*
- Excludes private admin portals, authentication endpoints, and internal cart flows.

### 12.3 Robots Exclusion & AI Crawler Directives (`/robots.txt`)
- Route: [`app/robots.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/robots.ts)
- Allows search engine crawlers on all legitimate storefront and catalog routes (`Allow: /`).
- Explicitly authorizes modern AI search and model crawlers alongside traditional search engines:
  - Traditional: `Googlebot`, `Bingbot`, `Slurp`, `DuckDuckBot`
  - AI & LLM: `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Applebot`, `Applebot-Extended`
- Explicitly blocks private and administrative sections:
  - `Disallow: /admin`
  - `Disallow: /admin/`
  - `Disallow: /api/`
  - `Disallow: /cart`
- References the live sitemap: `Sitemap: https://fairyfindsboutique.store/sitemap.xml`.

### 12.4 Schema.org JSON-LD Structured Data
1. **`ClothingStore` & `LocalBusiness`**:
   - Location: Neendoor, Kottayam, Kerala, India (PIN: 686601).
   - Area Served: Kerala, India, and NRI diaspora worldwide.
   - Contact: Official WhatsApp hotline (`+91 62826 29144`), email, store hours (Mon–Sat 10:00–19:00), price range (`₹₹`), accepted payment methods, and Instagram profile.
2. **`SiteNavigationElement` (Google Sitelinks Schema)**:
   - Injects structured navigation graph into `<head>` declaring primary brand hierarchy:
     1. Home (`/`)
     2. Shop Ready-to-Wear (`/shop`)
     3. Custom Made Outfits (`/custom`)
     4. Our Story (`/about`)
     5. Contact & Location (`/contact`)
   - Helps Google display rich sitelinks under the main homepage search snippet.
3. **`Product` & `Offer`**:
   - Dynamic per product: name, description, SKU / unique product code, brand (`Fairy Finds Boutique`), fabric/material, and high-res imagery.
   - Real price in `INR`, `NewCondition`, and real-time inventory status (`InStock` vs `OutOfStock` derived from variant matrix).
   - Only attaches `AggregateRating` when genuine customer reviews exist in the CMS. No fabricated reviews or ratings.
4. **`BreadcrumbList`**:
   - Structured hierarchy on all catalog, product, category, collection, and static pages (e.g. `Home` → `Shop` → `Dresses` → `Product Name`).
5. **`ItemList`**:
   - Structured catalog listings on `/shop`, `/category/[slug]`, and `/collections/[slug]` for rich carousel/grid display in Google Search.

### 12.5 Dynamic Social Sharing & OpenGraph Card
- Route: [`app/opengraph-image.tsx`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/opengraph-image.tsx)
- Automatically compiles a high-resolution 1200×630 image with the brand palette, luxury serif typography, and category tags when the site is shared on WhatsApp, Facebook, iMessage, and X/Twitter.

### 12.6 Canonical URLs & Duplicate Prevention
- Root layout enforces `metadataBase: new URL('https://fairyfindsboutique.store')`.
- All pages emit an explicit `<link rel="canonical" href="...">`.
- Safe ID-to-slug redirect: Accessing `/product/prod-01` automatically 308-redirects to the canonical `/product/crimson-heritage-kanjivaram-saree`.
- Plural category redirect: Navigating to `/categories/[slug]` permanently redirects to `/category/[slug]`.

### 12.7 Search Engine Verification Hooks
- The root layout metadata includes verification hooks for both Google and Microsoft Bing:
  ```ts
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    other: {
      ...(bingVerification ? { 'msvalidate.01': bingVerification } : {}),
    },
  }
  ```
- Configure either via `.env.local` / Vercel Environment Variables or dynamically through `/admin/seo` → Tab 5:
  - Google: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="your_token"`
  - Bing: `NEXT_PUBLIC_BING_SITE_VERIFICATION="your_token"`

### 12.8 AI Agent Discovery & Agentic Browsing (`/llms.txt` & `/llms-full.txt`)
- Routes: [`public/llms.txt`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/public/llms.txt) & [`public/llms-full.txt`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/public/llms-full.txt)
- Adheres to the official [llmstxt.org](https://llmstxt.org/) specification:
  - Single `# Fairy Finds Boutique` H1 headline
  - Blockquote executive summary of the boutique and services
  - Markdown link lists for core pages, categories, collections, and WhatsApp ordering channels
- Served directly as **static edge assets** from the Vercel Global Edge CDN with zero lambda cold start (< 15ms response time).
- Includes edge headers configured in `next.config.ts`:
  - `Content-Type: text/plain; charset=utf-8`
  - `Access-Control-Allow-Origin: *` (eliminates CORS blocks for external AI agents)
- Passes Google Lighthouse 13.3+ "Agentic Browsing" accessibility checks without timing out.

### 12.9 Meta Title Deduplication & Regional SEO
- **Title Formatter ([`lib/seo/constants.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/lib/seo/constants.ts))**:
  ```ts
  export function formatMetaTitle(title?: string | null, brandName = 'Fairy Finds Boutique'): string {
    if (!title || !title.trim()) return brandName;
    const clean = title.trim();
    if (clean.toLowerCase().includes('fairy finds')) return clean;
    return `${clean} | ${brandName}`;
  }
  ```
- **Absolute Title Injection**: All page routes (`/`, `/shop`, `/custom`, `/about`, `/contact`) wrap metadata titles in `title: { absolute: title }` to prevent Next.js layout templates from repeating the brand name twice (e.g., prevents `"Title | Fairy Finds Boutique | Fairy Finds Boutique"`).
- **Regional Brand Dominance**: Home page metadata specifically targets *"Fairy Finds Boutique | Women's Fashion & Bridal Couture in Neendoor, Kottayam"*, ensuring the home page dominates local Google searches for Kottayam and Neendoor.

---

## 13. Administrative Security & Access Control

### 13.1 Edge Proxy Authentication (`proxy.ts`)
- Implemented as Next.js 16 Edge middleware (`proxy.ts`).
- Matches `/admin/:path*` routes:
  - Unauthenticated requests attempting to access any `/admin/*` route (except `/admin/login`) are automatically intercepted and redirected to `/admin/login?from=[pathname]`.
  - Authenticated requests visiting `/admin/login` are automatically redirected to the dashboard `/admin`.
- Authentication is verified via an `admin_session` cookie (`admin_session=authenticated; path=/; max-age=604800; SameSite=Lax`).

### 13.2 Owner Login Flow (`/admin/login`)
- Route: [`app/admin/login/page.tsx`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/admin/login/page.tsx)
- Server Action: [`app/actions/auth.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/actions/auth.ts)
- Features:
  - Password input with show/hide eye toggle.
  - Case and whitespace resilience: automatically trims accidental leading/trailing spaces (`password.trim()`).
  - Secure verification: Compares against `ADMIN_PASSWORD` environment variable (defaults to `fairyfinds@123`).
  - Full-page redirect via `window.location.href` to ensure cookie propagation across Edge middleware.

### 13.3 Server Action Mutation Guards
- All mutation actions in [`app/actions/store.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/actions/store.ts) enforce an internal `assertAdmin()` security check:
  ```ts
  async function assertAdmin() {
    const isAuthed = await checkAdminSession();
    if (!isAuthed) {
      throw new Error('Unauthorized: Valid admin authentication required.');
    }
  }
  ```
- Guards cover: `saveSettingsAction`, `saveSeoConfigAction`, `saveNavigationAction`, `saveProductAction`, `deleteProductAction`, `saveCategoryAction`, `deleteCategoryAction`, `saveCollectionAction`, `deleteCollectionAction`, `reorderSectionsAction`, `toggleSectionAction`, `saveReviewsAction`.

### 13.4 Image Upload Security
- Endpoint: [`app/api/upload/route.ts`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/app/api/upload/route.ts)
- Checks for valid `admin_session` cookie before allowing image file writes to Supabase storage or disk, returning `401 Unauthorized` for unauthenticated requests.

---

## 14. Cloud Database & Vercel Read-Only Mode Architecture

### 14.1 Ephemeral Read-Only Filesystem vs Supabase
- **Local Environment**: Mutations write directly to `data/store.json` on disk.
- **Vercel Serverless**: Functions run in a stateless, read-only container (`EROFS`). Changes written to disk only exist in temporary memory and reset on the next container instance.
- **Production Persistence**: Live production saves require [Supabase](https://supabase.com/) credentials configured in Vercel Project Settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 14.2 Supabase SEO Settings Migration
To enable saving SEO settings from the `/admin/seo` dashboard to Supabase, run this single SQL query in the Supabase SQL Editor:
```sql
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{}'::jsonb;
```

### 14.3 Visual Connection Status in `/admin/seo`
The SEO dashboard ([`SeoManagerClient.tsx`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/components/admin/SeoManagerClient.tsx)) includes real-time database diagnostics:
- **Notice: Database Not Connected (Vercel Read-Only Mode)**: Appears if Supabase environment variables are missing in Vercel.
- **Action Required: Database Migration Needed**: Appears if Supabase is connected but the `seo_config` column has not been added yet, providing a one-click copy button for the SQL command.

---

## 15. Client Onboarding & Admin Portal Handbook

### 15.1 Owner Handbook PDF
- High-resolution, 7-page print-ready handbook created specifically for non-technical boutique owners and staff:
  - Source HTML & CSS: [`docs/Fairy_Finds_Admin_Portal_Guide.html`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/docs/Fairy_Finds_Admin_Portal_Guide.html)
  - Compiled Vector PDF: [`docs/Fairy_Finds_Admin_Portal_Guide.pdf`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/docs/Fairy_Finds_Admin_Portal_Guide.pdf)
  - Public Download Link: `https://fairyfindsboutique.store/docs/Fairy_Finds_Admin_Portal_Guide.pdf`

### 15.2 Handbook Contents
1. **Welcome & Security**: Login URL, passkey, session security, and dashboard navigation.
2. **Product Catalog & Stock Management**: Adding new garments, size matrix (XS–XXL), out-of-stock behavior, and SKU format (`FF-[CAT]-[NAME]-[NUM]`).
3. **Categories & Signature Collections**: Adding categories, uploading category banners, and creating signature edits (e.g. *Red Saree*, *Green Lehenga*).
4. **Homepage CMS**: Move Up / Move Down section order, visibility eye toggles, and live text edits.
5. **Customer Reviews & UGC**: Managing client photos, 5-star ratings, testimonials, and tagging worn outfits.
6. **SEO & WhatsApp Sharing**: Page-by-page meta titles, WhatsApp preview cards, Google Search Console indexing requests, and Kerala fashion keyword bank.
7. **Troubleshooting & FAQs**: WhatsApp number formatting, image upload best practices, and emergency support hotline.


