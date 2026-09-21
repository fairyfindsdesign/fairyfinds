export type ProductType = 'READY_MADE';

// ─── Order System ───────────────────────────────────────────────────────────

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product_id: string;
  product_code: string;
  product_name: string;
  product_image?: string;
  size: string;
  quantity: number;
  unit_price: number;
  delivery_fee: number;
  line_total: number;
}

export type EmailNotificationStatus = 'pending' | 'sent' | 'failed';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes?: string;
  status: OrderStatus;
  is_read: boolean;
  email_notification_status?: EmailNotificationStatus;
  created_at: string;
  updated_at?: string;
}

// ─── End Order System ────────────────────────────────────────────────────────


export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  stock_quantity: number;
  sku?: string;
}

export interface Product {
  id: string;
  product_code: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  delivery_fee?: number;
  product_type: ProductType;
  category_id?: string;
  category_name?: string;
  collection_id?: string;
  collection_name?: string;
  images: string[];
  size_chart_id?: string;
  size_chart_url?: string;
  custom_size_chart?: {
    columns: string[];
    rows: Record<string, string>[];
    notes?: string;
    unit?: 'Inches' | 'cm';
  };
  fabric?: string;
  care_instructions?: string;
  is_published: boolean;
  is_featured: boolean;
  variants: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface SizeChartRow {
  size: string;
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
  [key: string]: string | undefined;
}

export interface SizeChart {
  id: string;
  name: string;
  unit: 'Inches' | 'cm';
  columns: string[];
  rows: SizeChartRow[];
  notes?: string;
  description?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomDesign {
  id: string;
  title: string;
  description: string;
  images: string[];
  video_url?: string;
  category?: string;
  display_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  created_at?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  show_on_home: boolean;
  has_dedicated_page: boolean;
  display_order: number;
  is_published: boolean;
  created_at?: string;
}

export type SectionType = 
  | 'HERO'
  | 'PRODUCT_COLLECTION'
  | 'IMAGE_TEXT'
  | 'BANNER'
  | 'CATEGORY_CARDS'
  | 'CUSTOM_MADE'
  | 'CUSTOM_DESIGNS'
  | 'REVIEWS'
  | 'FEATURED_COLLECTIONS'
  | 'FEATURED_PRODUCTS';

export interface HeroSlide {
  id: string;
  heading: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  button_text?: string;
  button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  image_url: string;
  text_color?: 'light' | 'dark';
  text_position?: 'left' | 'center' | 'right';
}

export interface HomepageSection {
  id: string;
  section_type: SectionType;
  title?: string;
  subtitle?: string;
  content: {
    heading?: string;
    description?: string;
    button_text?: string;
    button_link?: string;
    image_url?: string;
    collection_id?: string;
    product_limit?: number;
    badge?: string;
    alignment?: 'left' | 'center' | 'right';
    slides?: HeroSlide[];
    autoplay_interval?: number;
    [key: string]: any;
  };
  display_order: number;
  is_visible: boolean;
}

export interface PageSeoItem {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  is_indexed?: boolean;
}

export interface SeoConfig {
  global: {
    site_title: string;
    title_template: string;
    meta_description: string;
    keywords: string[];
    canonical_base: string;
  };
  local_business: {
    name: string;
    legal_name?: string;
    alternate_names?: string[];
    street_address: string;
    address_locality: string;
    address_region: string;
    postal_code: string;
    address_country: string;
    latitude: string;
    longitude: string;
    opening_hours: string;
    price_range: string;
    payment_accepted: string;
    areas_served?: string[];
  };
  pages: {
    home?: PageSeoItem;
    shop?: PageSeoItem;
    custom?: PageSeoItem;
    about?: PageSeoItem;
    contact?: PageSeoItem;
    [key: string]: PageSeoItem | undefined;
  };
  social: {
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_card: 'summary' | 'summary_large_image';
  };
  verification: {
    google_site_verification?: string;
    google_analytics_id?: string;
    google_tag_manager_id?: string;
    meta_pixel_id?: string;
    bing_verification?: string;
  };
  crawl: {
    is_indexed: boolean;
    disallow_paths?: string[];
  };
  last_updated?: string;
}

export interface StoreSettings {
  whatsapp_number: string;
  store_name: string;
  contact_email: string;
  instagram_url: string;
  address: string;
  announcement_bar: string;
  currency_symbol: string;
  navigation?: NavItem[];
  reviews?: CustomerReview[];
  seo_config?: SeoConfig;
}

export interface CartItem {
  id: string; // `${product_id}-${size}`
  product: Product;
  size: string;
  quantity: number;
  price: number;
}

export interface CustomerOrderDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface CustomInquiryDetails {
  name: string;
  phone: string;
  dressType: string;
  sizeOrMeasurements: string;
  preferredFabric?: string;
  preferredColor?: string;
  notes?: string;
}

export interface NavDropdownItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  isDropdown?: boolean;
  dropdownItems?: NavDropdownItem[];
  is_visible: boolean;
}

export interface CustomerReview {
  id: string;
  customer_name: string;
  avatar_url?: string;
  image_url?: string; // Photo of customer wearing the product
  product_name?: string; // Garment/product worn by customer
  rating: number; // 1 to 5
  comment: string;
  location?: string;
  tag?: string; // e.g., "Bridal Silk Edit" or "Verified Purchase"
  is_visible: boolean;
  display_order?: number;
  created_at?: string;
}
