# Fairy Finds Boutique — Complete Project Documentation

Master operational, architectural, and design reference for the **Fairy Finds Boutique** e-commerce application.

---

## 1. Executive Summary & Brand Positioning

**Fairy Finds Boutique** is a modern, feminine fashion web application offering a curated selection of ready-to-wear garments alongside custom-made couture commissions.

### Brand Identity & Aesthetic Principles
- **Atmosphere**: Minimal, Elegant, Feminine, Soft, Modern, Premium, and Trustworthy.
- **Design Rule**: Generous whitespace, clean editorial typography, minimal cards without heavy drop shadows, no arbitrary gradients, and visual focus kept firmly on product photography.
- **CMS Principle**: **Owner controls content; Developer controls design.** The boutique owner can manage inventory, pricing, text, and homepage section order, while core typography tokens, responsive layouts, and aesthetic constraints remain protected.

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

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with centralized CSS variables (`app/globals.css`)
- **Icons**: [Lucide React](https://lucide.dev/) + custom high-precision SVG brand icons
- **State Management**: React Context (`context/CartContext.tsx`) with localStorage persistence and stock checks
- **Server Mutations**: Next.js Server Actions (`app/actions/store.ts`) with immediate `revalidatePath` cache clearing
- **Storage Layer**:
  - **Local Development / Offline**: Resilient server-side JSON persistence (`data/store.json`) ensuring all dashboard edits persist permanently even without database credentials.
  - **Production Cloud**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Supabase Auth for `/admin`, and Supabase Storage for product assets).

---

## 3. Site Navigation & Route Manifest

| Route | Render Type | Purpose |
|---|---|---|
| **`/`** | Dynamic (`ƒ`) | **Section-based CMS Homepage** with Hero, New Arrivals, Banners, Categories, and Bespoke Tailoring. |
| **`/shop`** | Dynamic (`ƒ`) | **Ready-to-Wear Catalog** with category filter pills, collection filters, size picker, and in-stock toggles. |
| **`/product/[slug]`** | Dynamic (`ƒ`) | **Product Detail Page** with image thumbnail gallery, size/stock matrix, size guide, and direct WhatsApp inquiry. |
| **`/collections/[slug]`** | Dynamic (`ƒ`) | **Signature Collection Showcases** (e.g., *Red Saree*, *Green Lehenga*). |
| **`/custom`** | Static (`○`) | **Custom-Made Atelier** detailing the bespoke process and collecting tailoring inquiry details. |
| **`/cart`** | Static (`○`) | **Bag Review & WhatsApp Checkout** collecting customer delivery details and launching WhatsApp. |
| **`/about`** | Static (`○`) | **Brand Story & Atelier Heritage** explaining craftsmanship values. |
| **`/contact`** | Static (`○`) | **Atelier Location & Hotline** with direct WhatsApp chat, email, and opening hours. |
| **`/admin`** | Dynamic (`ƒ`) | **Owner Dashboard Overview** with inventory health, stock alerts, and quick actions. |
| **`/admin/navigation`** | Dynamic (`ƒ`) | **Navigation & Dropdown CMS** to manage top-level nav visibility and customize the *Featured* dropdown menu links. |
| **`/admin/products`** | Dynamic (`ƒ`) | **Product & Stock Manager** with search, per-size stock breakdown, and delete actions. |
| **`/admin/products/new`** | Dynamic (`ƒ`) | **Create Garment** form with image preview, pricing, and size matrix. |
| **`/admin/products/[id]`** | Dynamic (`ƒ`) | **Edit Garment** form to update pricing, descriptions, and stock counts. |
| **`/admin/collections`** | Dynamic (`ƒ`) | **Collections Manager** to create collections and toggle homepage visibility. |
| **`/admin/homepage`** | Dynamic (`ƒ`) | **Homepage CMS** with Move Up / Move Down reordering, visibility toggles, and text editor. |
| **`/admin/reviews`** | Dynamic (`ƒ`) | **Customer Reviews CMS** to add, edit, rate (1-5 stars), add customer photos, and manage testimonials in the marquee. |
| **`/admin/settings`** | Dynamic (`ƒ`) | **Store Settings** to configure the business WhatsApp phone number, store details, and announcement bar. |
| **`/admin/login`** | Static (`○`) | **Owner Sign-in Portal** for administrative access (accessed directly via URL). |

---

## 4. Database Schema Design (PostgreSQL / Supabase)

The complete SQL migration script is located at [`fairy-finds/supabase/schema.sql`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/supabase/schema.sql).

### Table Definitions

1. **`categories`**: `id`, `name`, `slug`, `description`, `image_url`, `display_order`, `created_at`
2. **`collections`**: `id`, `name`, `slug`, `description`, `image_url`, `show_on_home`, `has_dedicated_page`, `display_order`, `is_published`
3. **`products`**: `id`, `product_code`, `name`, `slug`, `description`, `price`, `product_type`, `category_id`, `collection_id`, `images`, `fabric`, `care_instructions`, `is_published`, `is_featured`
4. **`product_variants`**: `id`, `product_id`, `size`, `stock_quantity`, `sku` (Unique on `(product_id, size)`)
5. **`homepage_sections`**: `id`, `section_type`, `title`, `subtitle`, `content`, `display_order`, `is_visible`
6. **`store_settings`**: `id`, `whatsapp_number`, `store_name`, `contact_email`, `instagram_url`, `address`, `announcement_bar`, `currency_symbol`

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

### 7.1 Dashboard Overview (`/admin`)
- Real-time inventory counter (Total Products & Total Stock Units).
- Stock alert counter showing variants at 0 inventory.
- Active WhatsApp order hotline with single-click edit shortcut.
- Recent products snapshot table.

### 7.2 Products & Stock Manager (`/admin/products`)
- Search by product title, product code (SKU), or category.
- Add New Piece form ([`/admin/products/new`](http://localhost:3000/admin/products/new)):
  - Title, SKU Code, Price, Category, Collection dropdown.
  - Multi-image URL management.
  - Fabric composition and care instructions.
  - **Size & Stock Matrix**: Interactive counters for S, M, L, XL, plus "Add Another Size" button for custom sizes (e.g., 38, Free Size, XXL).
- Edit Piece form ([`/admin/products/[id]`](http://localhost:3000/admin/products/prod-01)).
- Delete confirmation with instant catalog update.

### 7.3 Collections Management (`/admin/collections`)
- **Full Creation & Editing Suite**: Full control over all content fields when creating new signature collections or editing existing ones:
  - **Collection Title**: Title displayed in collection banners and headers.
  - **URL Handle / Slug**: Custom URL slug with live route preview (`/collections/{slug}`). Auto-generated from title by default, with complete manual customization support.
  - **Editorial Banner Image**: Direct URL input with real-time visual thumbnail preview and one-tap luxury image presets.
  - **Editorial Narrative**: Form for storytelling about textiles, weave craftsmanship, and occasion.
  - **Display Order**: Precise integer sorting across storefront menus and landing pages.
  - **Homepage Feature Toggle**: Instant toggle (`show_on_home`) to feature in signature homepage edits.
  - **Dedicated Page Toggle**: Controls whether `/collections/{slug}` is accessible as a dedicated landing page.
  - **Publish Status Toggle**: Toggle between `Published` (live on storefront) and `Draft`.
- **Card-Level Management**:
  - **Edit Collection**: Opens the comprehensive pre-filled editor with smooth scrolling.
  - **Quick Home Toggle**: One-tap `Featured on Home` switch with instant feedback.
  - **Publish / Unpublish**: One-tap status switcher.
  - **Delete Collection**: Deletes the collection with confirmation, preserving all associated catalog garments.
  - **Live Page Preview**: Direct link to `/collections/{slug}`.
  - **Catalog Link**: Quick jump to `/shop?collection={slug}`.

### 7.4 Homepage Section CMS (`/admin/homepage`)
- **Move Up & Move Down**: Reorder homepage sections without touching code.
- **Eye / EyeOff Toggle**: Hide seasonal sections or drafts from the live homepage instantly.
- **Edit Text**: In-place editor to modify main headings, eyebrow subtitles, descriptions, button labels, button destination links, and background banner images.

### 7.5 Navigation & Featured Dropdown CMS (`/admin/navigation`)
- **Storefront Navbar Focus**: The public navigation bar strictly features **Home**, **Featured** (with dropdown), **About**, and **Contact**, along with the Shopping Bag counter.
- **Removal of Owner Shortcut**: To maintain privacy and a seamless customer-facing luxury aesthetic, the "Owner" button/shortcut has been completely removed from public navigation. Boutique administrators access the dashboard directly at `/admin` or `/admin/login`.
- **Top-Level Visibility Controls**: Toggle visibility (`Eye` / `EyeOff`) for any top-level navigation item.
- **"Featured" Dropdown Link Manager**:
  - Add custom links (Menu Label, Destination URL, and optional Subtitle).
  - Move links **Up** or **Down** to reorder their appearance.
  - Inline **Edit** mode to adjust link titles or URLs without recreating.
  - **Delete** outdated collection links.
  - All changes immediately sync to `data/store.json` via Server Actions and live-revalidate across all visitor pages.

### 7.6 Customer Reviews & Slow Marquee CMS (`/admin/reviews`)
- **Storefront Display**: Elegant, infinite slow-scrolling horizontal marquee on the homepage showcasing genuine customer experiences, complete with soft edge gradient masks and hover-to-pause functionality.
- **Star Rating Selector**: Interactive 1 to 5 star rating picker for each testimonial.
- **Customer Details**: Manage customer name, profile avatar URL (with fallback monogram badge), city/location, and garment tag (e.g. *Bridal Silk Edit*, *Custom Bespoke Client*).
- **Inline Editing & Management**:
  - Live preview of avatar images.
  - In-place editor to update existing review text, ratings, or tags.
  - Delete expired or obsolete reviews.
  - Visibility toggles (`Eye` / `EyeOff`) to instantly hide or show reviews on the storefront.
  - Updates persist directly to `data/store.json` with immediate live revalidation.

### 7.7 Store Settings (`/admin/settings`)
- **Business WhatsApp Number**: Editing this number immediately redirects all checkout and inquiry buttons store-wide.
- Store Name, Currency Symbol (`Rs.`), Email, Instagram profile link, and Atelier address.
- Top Announcement Bar copy.

---

## 8. Mobile & UX Micro-Animation Architecture

### 8.1 Mobile-First Viewport Enhancements
- **Modern 2-Column Catalog Grids**: Both the Homepage (New Arrivals & Categories) and Shop Catalog display as sleek 2-column grids on mobile (`grid-cols-2`), drastically reducing vertical scrolling fatigue while emulating top-tier luxury fashion mobile apps.
- **Sticky Mobile Purchase Bar**: On product detail pages (`/product/[slug]`), a floating bottom bar keeps the piece name, selected size, price, and "Add to Bag" action immediately accessible at all times without scrolling back to the top.
- **Touch-Optimized Targets**: All interactive buttons, size selector pills, and mobile menu links adhere to minimum 44×44px touch targets.
- **iOS Safari Auto-Zoom Prevention**: Enforces a minimum 16px font-size rule on all `<input>`, `<select>`, and `<textarea>` elements on screens `< 640px` to eliminate involuntary mobile viewport zooming.
- **Native Drawer Sheet**: Shopping bag drawer opens edge-to-edge on mobile with enlarged 28×28px quantity increment/decrement touch targets.

### 8.2 Tactile Micro-Animations
- **Smooth Scrolling**: Global `scroll-behavior: smooth` and optimized font antialiasing across all pages.
- **Tactile Button Press**: Interactive `active:scale-[0.98]` and `active:scale-95` press responses giving an organic tactile feel.
- **Card Hover & Press**: Subtle lift `hover:-translate-y-1 hover:shadow-md` and tactile scale feedback.
- **Cart Badge Bounce**: CSS keyframe bounce (`animate-cart-bounce`) micro-animation whenever items are added or present in the bag.
- **Floating Back-to-Top**: Discreet, luxury floating button that appears after 350px of vertical scroll, smoothly gliding the user back to the top.

### 8.3 Admin Dashboard Mobile Architecture
- **Horizontal Quick-Scroll Navigation Strip**: On mobile devices (`md:hidden`), a high-speed horizontal navigation bar sits directly under the top header, allowing the boutique owner to jump between all 7 management sections (`Dashboard`, `Products`, `Collections`, `Homepage`, `Navigation`, `Reviews`, `Settings`) in a single tap without opening a menu.
- **Slide-Out Admin Navigation Drawer**: Full mobile drawer with section icons, route status indicators, and quick live storefront shortcuts.
- **Sticky Mobile Bottom Action Bars**: Both **Product Creation/Editing** (`/admin/products/new` and `/admin/products/[id]`) and **Store & WhatsApp Settings** (`/admin/settings`) feature a fixed bottom action bar on mobile viewports. The boutique owner can edit long forms and save instantly with a single tap without scrolling back up to the top. Automatic `pb-24` padding guarantees bottom inputs are never hidden.
- **2×2 Metrics Grid**: Compact 2-column mobile cards for garments count, units in stock, zero-stock alerts, and WhatsApp hotline.
- **Mobile Product Card List**: Replaces cumbersome horizontal table scrolling with touch-optimized mobile product cards featuring thumbnails, SKU, prices, size breakdown, and full-width Edit & Delete actions.
- **Mobile-Responsive Size & Stock Matrix**: Size variant stock inputs arrange in a clean 2-column grid (`grid-cols-2`) on phone viewports with comfortable 36px touch quantity inputs and quick size addition.
- **Homepage Section Reordering Toolbar**: Dedicated mobile action bar for section Move Up, Move Down, Visibility, and Text Editing with tactile `active:scale-90` tap feedback.
- **Customer Reviews CMS on Mobile**: Touch-first 5-star rating picker with 36px touch targets, responsive review cards with touch action toolbars, and full-width form buttons.
- **Navigation CMS on Mobile**: 2-column top-level menu item cards and mobile-friendly dropdown link management with touch controls.
- **Responsive Padding & Overflow Protection**: Fluid padding (`p-3.5 sm:p-6 md:p-8 lg:p-10`) prevents horizontal pinch and optimizes screen real estate on all mobile devices.

---

## 9. Data Persistence Architecture

### How Changes Persist (Offline & Local Development)
1. Whenever an admin form is submitted, it invokes a **Next.js Server Action** (`app/actions/store.ts`).
2. The Server Action writes the updated data directly to disk at [`data/store.json`](file:///d:/works/Asme/Fairy%20findds/Website/fairy-finds/data/store.json).
3. Next.js triggers `revalidatePath('/', 'layout')`, instantly invalidating the cached HTML and serving the fresh data.
4. **All changes persist permanently** across page refreshes and server restarts.

### Supabase Cloud Synchronization
When you are ready to connect a live Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL script from `fairy-finds/supabase/schema.sql` in the Supabase SQL Editor.
3. In `fairy-finds`, create `.env.local` using `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. The server store will automatically query and synchronize with your live cloud database.

---

## 9. How to Run, Test, and Build

### Development Server
```bash
cd fairy-finds
npm run dev
```
The application will be accessible at **http://localhost:3000**.

### Production Build
```bash
cd fairy-finds
npm run build
npm run start
```
Compiles with 0 TypeScript/ESLint warnings into an optimized production bundle.
