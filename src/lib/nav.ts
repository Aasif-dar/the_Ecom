export interface NavLink {
  label: string;
  href: string;
  mega?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/shop", mega: true },
  { label: "New Arrivals", href: "/shop/new-arrivals" },
  { label: "Collections", href: "/collections" },
  { label: "Offers", href: "/offers" },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/shop/new-arrivals" },
    { label: "Best Sellers", href: "/shop/best-sellers" },
    { label: "Women", href: "/shop/women" },
    { label: "Men", href: "/shop/men" },
    { label: "Footwear", href: "/shop/footwear" },
    { label: "Accessories", href: "/shop/accessories" },
    { label: "The Sale", href: "/shop/sale" },
  ],
  service: [
    { label: "Track your order", href: "/track-order" },
    { label: "Shipping & delivery", href: "/shipping" },
    { label: "Returns & exchanges", href: "/returns" },
    { label: "Size guide", href: "/size-guide" },
    { label: "Contact us", href: "/contact" },
  ],
  company: [
    { label: "Our story", href: "/about" },
    { label: "Collections", href: "/collections" },
    { label: "Offers", href: "/offers" },
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
  ],
};
