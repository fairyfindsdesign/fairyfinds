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
| **`/product/[slug]`** | Dynamic (`ƒ`) | **Product Detail Page** with image thumbnail gallery, size/stock matrix, size guide, and direct WhatsApp inquiry. |
| **`/collections/[slug]`** | Dynamic (`ƒ`) | **Signature Collection Showcases** (e.g., *Red Saree*, *Green Lehenga*). |
| **`/custom`** | Static (`○`) | **Custom-Made Atelier** detailing the bespoke process and collecting tailoring inquiry details. |
| **`/cart`** | Static (`○`) | **Bag Review & WhatsApp Checkout** collecting customer delivery details and launching WhatsApp. |
| **`/about`** | Static (`○`) | **Brand Story & Atelier Heritage** explaining craftsmanship values. |
| **`/contact`** | Static (`○`) | **Atelier Location & Hotline** with direct WhatsApp chat, email, and opening hours. |
| **`/admin`** | Dynamic (`ƒ`) | **Protected Owner Dashboard** with inventory metrics, categories count, stock alerts, and quick action cards. |
| **`/admin/products`** | Dynamic (`ƒ`) | **Product & Stock Manager** with search, per-size stock breakdown, auto-generated product code, and delete actions. |
| **`/admin/products/new`** | Dynamic (`ƒ`) | **Create Garment Form** with live unique product code auto-sync, inline "+ New Category" modal, and size matrix. |
| **`/admin/products/[id]`** | Dynamic (`ƒ`) | **Edit Garment Form** to update pricing, descriptions, images, category, and stock counts. |
| **`/admin/categories`** | Dynamic (`ƒ`) | **Category Management Portal** to create, edit, search, re-order, and delete categories with product count tracking. |
| **`/admin/collections`** | Dynamic (`ƒ`) | **Collections Manager** to create collections, edit editorial narratives, and toggle homepage visibility. |
| **`/admin/homepage`** | Dynamic (`ƒ`) | **Homepage CMS** with Move Up / Move Down reordering, visibility toggles, and text editor. |
| **`/admin/navigation`** | Dynamic (`ƒ`) | **Navigation & Dropdown CMS** to manage top-level nav visibility and customize the *Featured* dropdown menu links. |
| **`/admin/reviews`** | Dynamic (`ƒ`) | **Customer Reviews CMS** to manage customer UGC outfit photos, testimonials, ratings, and worn product references. |
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
Compiles all 21 routes with 0 TypeScript/ESLint errors into an optimized production bundle.
