export type ProductType = 'READY_MADE';

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
  product_type: ProductType;
  category_id?: string;
  category_name?: string;
  collection_id?: string;
  collection_name?: string;
  images: string[];
  size_chart_url?: string;
  fabric?: string;
  care_instructions?: string;
  is_published: boolean;
  is_featured: boolean;
  variants: ProductVariant[];
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
