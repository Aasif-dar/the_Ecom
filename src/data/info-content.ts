import type { InfoSection } from "@/components/layout/info-page";

export interface InfoDoc {
  slug: string;
  eyebrow: string;
  title: string;
  accent: string;
  metaTitle: string;
  description: string;
  intro: string;
  updated?: string;
  sections: InfoSection[];
}

export const INFO_DOCS: Record<string, InfoDoc> = {
  shipping: {
    slug: "shipping",
    eyebrow: "Customer service",
    title: "Shipping &",
    accent: "delivery",
    metaTitle: "Shipping & delivery",
    description: "Delivery times, shipping charges and tracking for Aadyam orders across India.",
    intro: "We ship across India from our studio in Mumbai, in plastic-free packaging, and tell you at every step where your order is.",
    updated: "1 October 2026",
    sections: [
      {
        heading: "Delivery times",
        body: [
          "Orders are packed within 24 hours on working days.",
          ["Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Kolkata): 3–4 working days", "Rest of India: 5–7 working days", "Remote pin codes may take up to 9 working days"],
        ],
      },
      {
        heading: "Shipping charges",
        body: ["Shipping is free on orders above ₹2,999. Below that, a flat ₹99 applies.", "Cash on delivery is available on most pin codes for an additional ₹49 handling fee."],
      },
      {
        heading: "Tracking your order",
        body: [
          "You will receive an email and an in-app notification at every stage: confirmed, packed, shipped, out for delivery and delivered.",
          "You can also track any order from the Track order page with your order number and mobile number.",
        ],
      },
      {
        heading: "Delivery attempts",
        body: ["Our courier partners make up to three delivery attempts. If a package cannot be delivered it returns to us, and we will contact you to re-ship or refund."],
      },
    ],
  },
  returns: {
    slug: "returns",
    eyebrow: "Customer service",
    title: "Returns &",
    accent: "exchanges",
    metaTitle: "Returns & exchanges",
    description: "Aadyam's 7-day easy returns and exchange policy.",
    intro: "If something is not right, send it back within 7 days of delivery. We would rather you love fewer things than keep something that does not fit.",
    updated: "1 October 2026",
    sections: [
      {
        heading: "What can be returned",
        body: [
          "Items must be unworn, unwashed and have their original tags attached. Footwear should be returned in its original box.",
          "For hygiene reasons, jewellery, innerwear, face masks and personalised items cannot be returned.",
        ],
      },
      {
        heading: "How to start a return",
        body: [["Sign in and open My orders", "Choose the order and select Return or Exchange", "Our courier will collect the parcel from your door within 2–3 working days"]],
      },
      {
        heading: "Refunds",
        body: [
          "Once we receive and inspect your return we will refund to the original payment method within 3–5 working days. Cash on delivery orders are refunded to your bank account or as store credit.",
          "Size exchanges are free, and we will ship the new size as soon as the pick-up is made.",
        ],
      },
      {
        heading: "Damaged or wrong item",
        body: ["If your order arrives damaged or is not what you ordered, write to care@aadyam.in with a photograph within 48 hours. We will replace it or refund you in full, including shipping."],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    eyebrow: "Legal",
    title: "Privacy",
    accent: "policy",
    metaTitle: "Privacy policy",
    description: "How Aadyam collects, uses and protects your personal information.",
    intro: "We collect only what we need to fulfil your order and improve the store, and we never sell your data.",
    updated: "1 October 2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Your name, email, mobile number, delivery addresses and order history, which are needed to process and deliver your orders.",
          "Basic usage data (pages viewed, device type) to understand how the store is used. This demo stores your data only in your own browser.",
        ],
      },
      {
        heading: "How we use it",
        body: [["To process payments, ship orders and send delivery updates", "To respond to support requests", "To send newsletters and offers, only if you have opted in. You can unsubscribe at any time"]],
      },
      {
        heading: "Sharing",
        body: ["We share the minimum necessary details with courier and payment partners to complete your order. We do not sell or rent your personal information."],
      },
      {
        heading: "Your rights",
        body: ["You can view, correct or delete your information from your account settings, or by writing to care@aadyam.in."],
      },
    ],
  },
  terms: {
    slug: "terms",
    eyebrow: "Legal",
    title: "Terms of",
    accent: "service",
    metaTitle: "Terms of service",
    description: "The terms that apply when you shop with Aadyam.",
    intro: "By placing an order you agree to the terms below. They are written to be read.",
    updated: "1 October 2026",
    sections: [
      {
        heading: "Orders and pricing",
        body: ["All prices are in Indian rupees and include GST. An order is confirmed when you receive our confirmation email. We may cancel an order if an item is mispriced or unavailable, and will refund you in full."],
      },
      {
        heading: "Payments",
        body: ["We accept UPI, major cards, net banking and cash on delivery. Online payments are processed by our payment partner. We never store your card details."],
      },
      {
        heading: "Intellectual property",
        body: ["All photographs, designs and text on this site belong to Aadyam or its licensors and may not be reproduced without written permission."],
      },
      {
        heading: "Demo notice",
        body: ["This storefront is a demonstration. No real orders are processed and no payments are taken."],
      },
    ],
  },
};
