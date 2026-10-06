import type { Coupon, StoreSettings } from "@/types";
import { BRAND } from "@/lib/brand";

export const SEED_SETTINGS: StoreSettings = {
  general: {
    storeName: BRAND.displayName,
    logoText: BRAND.name,
    email: BRAND.email,
    phone: BRAND.phone,
    address: BRAND.address,
  },
  store: {
    currency: "INR",
    taxRate: 12,
    taxInclusive: true,
    freeShippingAbove: 2999,
    shippingFee: 99,
    codEnabled: true,
    codFee: 49,
  },
  social: {
    instagram: `https://instagram.com/${BRAND.instagram}`,
    facebook: "https://facebook.com/aadyam.studio",
    linkedin: "https://linkedin.com/company/aadyam-studio",
  },
  seo: {
    metaTitle: `${BRAND.displayName} | ${BRAND.tagline}`,
    metaDescription: BRAND.description,
  },
};

export const SEED_COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minOrder: 1499,
    maxDiscount: 500,
    description: "10% off your first order, up to ₹500",
    active: true,
    expiresAt: "2027-03-31T23:59:59+05:30",
    usageCount: 214,
  },
  {
    code: "FESTIVE15",
    type: "percent",
    value: 15,
    minOrder: 3999,
    maxDiscount: 1500,
    description: "15% off festive edits, up to ₹1,500",
    active: true,
    expiresAt: "2026-11-30T23:59:59+05:30",
    usageCount: 87,
  },
  {
    code: "FLAT500",
    type: "flat",
    value: 500,
    minOrder: 4999,
    description: "Flat ₹500 off on orders above ₹4,999",
    active: true,
    expiresAt: "2027-01-31T23:59:59+05:30",
    usageCount: 132,
  },
  {
    code: "AADYAM20",
    type: "percent",
    value: 20,
    minOrder: 7999,
    maxDiscount: 2500,
    description: "20% off orders above ₹7,999, up to ₹2,500",
    active: true,
    expiresAt: "2026-12-31T23:59:59+05:30",
    usageCount: 41,
  },
  {
    code: "MONSOON25",
    type: "percent",
    value: 25,
    minOrder: 2999,
    description: "Monsoon sale code (expired)",
    active: false,
    expiresAt: "2026-08-31T23:59:59+05:30",
    usageCount: 306,
  },
];
