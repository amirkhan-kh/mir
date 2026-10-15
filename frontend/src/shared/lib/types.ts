export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  sort: number;
  active: boolean;
  product_count: number;
  /** Admin API only. */
  name_ky?: string;
}

export interface ProductCard {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  old_price: number | null;
  images: string[];
  stock: number;
  badge: string | null;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  category_id: number;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface ProductDetail extends ProductCard {
  sku: string | null;
  short_description: string;
  description: string;
  specs: Spec[];
  warranty_months: number;
  is_featured: boolean;
  category_name: string;
  category_slug: string;
  related: ProductCard[];
  reviews: Review[];
  rating_breakdown: Record<string, number>;
}

export interface ProductFull extends Omit<ProductCard, "images"> {
  images: string[];
  sku: string | null;
  short_description: string;
  description: string;
  specs: Spec[];
  warranty_months: number;
  is_featured: boolean;
  active: boolean;
  name_ky: string;
  short_description_ky: string;
  description_ky: string;
  specs_ky: Spec[];
  badge_ky: string | null;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  link: string | null;
  cta: string | null;
  theme: "dark" | "light" | "lime";
  placement: "hero" | "promo";
  sort: number;
  active: boolean;
  /** Admin API only. */
  title_ky?: string;
  subtitle_ky?: string;
  cta_ky?: string | null;
}

export interface InstallmentPlan {
  months: number;
  percent: number;
}

export interface Store {
  store_name: string;
  tagline: string;
  phone: string;
  phone2: string;
  address: string;
  hours: string;
  telegram: string;
  instagram: string;
  delivery_fee: number;
  free_delivery_from: number;
  delivery_note: string;
  regions: string[];
  installment: InstallmentPlan[];
}

/** Admin settings: public texts plus their Kyrgyz twins (empty = Russian). */
export interface StoreSettings extends Store {
  tagline_ky: string;
  address_ky: string;
  hours_ky: string;
  delivery_note_ky: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductList extends Paged<ProductCard> {
  facets: { brands: { name: string; count: number }[]; price: { min: number; max: number } };
}

export type OrderStatus = "new" | "confirmed" | "delivering" | "delivered" | "cancelled";
export type DeliveryMethod = "courier" | "pickup";
export type PaymentMethod = "cash" | "card" | "installment";

export interface OrderItem {
  id?: number;
  product_id?: number | null;
  name: string;
  image: string | null;
  price: number;
  qty: number;
  line_total: number;
  slug: string | null;
  stock?: number | null;
}

export interface OrderEvent {
  id?: number;
  status: OrderStatus;
  note?: string;
  user_name?: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  number: string;
  customer_name: string;
  phone: string;
  region: string;
  address: string;
  comment: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  installment_months: number | null;
  installment_monthly: number | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  events: OrderEvent[];
}

export interface AdminOrder extends Order {
  assignee_id: number | null;
  assignee_name: string | null;
  assignee_phone: string | null;
  staff_note: string;
  next: OrderStatus[];
}

export type Role = "admin" | "manager" | "courier";

export interface SessionUser {
  id: number;
  username: string;
  full_name: string;
  role: Role;
}

export interface Staff {
  id: number;
  username: string;
  full_name: string;
  phone: string | null;
  role: Role;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
  open_orders: number;
}
