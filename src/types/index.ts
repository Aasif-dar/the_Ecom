// Domain types. These mirror the shape a real REST/GraphQL API would return,
// so the demo stores can be swapped for network calls without touching the UI.

export type ID = string;

export type ProductStatus = "active" | "draft" | "archived";
export type SizeGuideKind = "tops" | "bottoms" | "footwear" | "free";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Variant {
  id: ID;
  sku: string;
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: ID;
  subcategoryId: ID;
  /** current selling price in INR */
  price: number;
  /** maximum retail price in INR (strike-through price) */
  mrp: number;
  sku: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: Variant[];
  tags: string[];
  collections: string[];
  fabric: string;
  fit: string;
  care: string;
  details: string[];
  sizeGuide: SizeGuideKind;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  status: ProductStatus;
  unitsSold: number;
  createdAt: string;
}

export interface Subcategory {
  id: ID;
  slug: string;
  name: string;
  categoryId: ID;
  status: "active" | "hidden";
}

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description: string;
  image: string;
  status: "active" | "hidden";
  subcategories: Subcategory[];
}

export interface Collection {
  id: ID;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export type AddressType = "home" | "work" | "other";

export interface Address {
  id: ID;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  type: AddressType;
  isDefault: boolean;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: ID;
  name: string;
  email: string;
  phone: string;
  /** Demo only. A real backend never ships credentials to the client. */
  password: string;
  role: UserRole;
  status: "active" | "blocked";
  createdAt: string;
  dateOfBirth?: string;
  gender?: "female" | "male" | "other";
  addresses: Address[];
  preferences: {
    newsletter: boolean;
    orderUpdates: boolean;
    smsAlerts: boolean;
    offers: boolean;
  };
}

export interface CartItem {
  id: ID;
  productId: ID;
  color: string;
  size: string;
  quantity: number;
  addedAt: string;
}

export interface WishlistItem {
  productId: ID;
  addedAt: string;
}

export type OrderStatus =
  | "processing"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "online" | "cod";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface OrderItem {
  productId: ID;
  name: string;
  slug: string;
  image: string;
  color: string;
  size: string;
  price: number;
  mrp: number;
  quantity: number;
  sku: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: ID;
  userId: ID;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
  address: Address;
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    instrument?: string;
  };
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  codFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
  createdAt: string;
  estimatedDelivery: string;
  delivery: {
    partner: string;
    trackingId: string;
  };
}

export interface Review {
  id: ID;
  productId: ID;
  userId: ID;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
  orderId?: ID;
}

export type NotificationKind =
  | "order_placed"
  | "order_confirmed"
  | "order_packed"
  | "order_shipped"
  | "order_out_for_delivery"
  | "order_delivered"
  | "order_cancelled"
  | "offer"
  | "system";

export interface Notification {
  id: ID;
  /** user id, or "admin" for back-office alerts */
  recipientId: ID;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  description: string;
  active: boolean;
  expiresAt: string;
  usageCount: number;
}

export interface Offer {
  id: ID;
  title: string;
  description: string;
  code?: string;
  badge: string;
  href: string;
  active: boolean;
}

export interface HeroSlide {
  id: ID;
  eyebrow: string;
  title: string;
  titleAccent: string;
  body: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  imageMain: string;
  imageSide: string;
  active: boolean;
}

export interface PromoBanner {
  id: ID;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  image: string;
  active: boolean;
}

export interface HomepageSection {
  id: "categories" | "new-arrivals" | "promo" | "best-sellers" | "collections" | "story" | "instagram" | "newsletter";
  label: string;
  enabled: boolean;
}

export interface SiteContent {
  announcements: string[];
  hero: HeroSlide;
  promo: PromoBanner;
  featuredProductIds: ID[];
  sections: HomepageSection[];
  offers: Offer[];
}

export interface StoreSettings {
  general: {
    storeName: string;
    logoText: string;
    email: string;
    phone: string;
    address: string;
  };
  store: {
    currency: "INR";
    taxRate: number;
    taxInclusive: boolean;
    freeShippingAbove: number;
    shippingFee: number;
    codEnabled: boolean;
    codFee: number;
  };
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

// ---------- Analytics ----------

export interface TimePoint {
  label: string;
  revenue: number;
  orders: number;
  customers?: number;
}

export interface AdminAnalytics {
  totals: {
    sales: number;
    revenue: number;
    orders: number;
    customers: number;
    products: number;
    pendingOrders: number;
    averageOrderValue: number;
    /** % change in new sign-ups, last 30 days vs the 30 before */
    newCustomersTrend: number;
    newCustomers30: number;
  };
  revenueDaily: TimePoint[];
  revenueWeekly: TimePoint[];
  revenueMonthly: TimePoint[];
  revenueYearly: TimePoint[];
  customerGrowth: { label: string; newCustomers: number; returning: number }[];
  salesByCategory: { name: string; revenue: number; units: number }[];
  topProducts: { productId: ID; name: string; image: string; units: number; revenue: number }[];
  orderStatus: { status: OrderStatus; count: number }[];
  lowStock: { productId: ID; name: string; image: string; stock: number }[];
  outOfStock: { productId: ID; name: string; image: string }[];
}
