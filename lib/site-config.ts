/**
 * Single source for site-wide copy placeholders, contact details and prices.
 * Values in [BRACKETS] still need real data before launch.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface ContactChannel {
  label: string;
  href: string;
}

export interface Package {
  id: "essential" | "premium" | "bespoke";
  name: string;
  tagline: string;
  priceEur: number;
  priceFrom?: boolean;
  features: readonly string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}

export interface AddOn {
  name: string;
  price: string;
}

export const siteConfig = {
  name: "Zaffa",
  title: "Zaffa: wedding invitations in every language your families speak",
  description:
    "Elegant digital wedding invitations with built-in RSVP and a private guest dashboard. One language or several, beautifully together.",
  location: "Ljubljana, Slovenia",
  copyrightYear: 2026,
  legalName: "[LEGAL NAME / REGISTRATION]",
  demoUrl: "#demo",

  contact: {
    email: { label: "[YOUR EMAIL]", href: "mailto:[YOUR EMAIL]" },
    whatsapp: { label: "WhatsApp · [YOUR NUMBER]", href: "#contact" },
    instagram: { label: "Instagram · [@YOUR HANDLE]", href: "#contact" },
  } satisfies Record<string, ContactChannel>,

  /** Business details for the legal notice, privacy notice and terms. */
  legal: {
    name: "[LEGAL NAME]",
    form: "[LEGAL FORM, e.g. sole proprietor (s.p.)]",
    address: "[STREET, POSTCODE CITY, COUNTRY]",
    registration: "[REGISTRATION NUMBER / REGISTER]",
    vatId: "[VAT ID, or 'not VAT registered']",
    email: "[YOUR EMAIL]",
    phone: "[YOUR PHONE]",
    lastUpdated: "[DATE]",
  },

  founder: {
    name: "Haytham Saba",
    initials: "HS",
    role: "Founder and web developer · Ljubljana, Slovenia",
  },
} as const;

export const mainNav: readonly NavLink[] = [
  { label: "What we do", href: "/#what" },
  { label: "How it works", href: "/#how" },
  { label: "Packages", href: "/#packages" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

export const footerNav: readonly NavLink[] = [
  { label: "What we do", href: "/#what" },
  { label: "Privacy notice", href: "/privacy" },
  { label: "Packages", href: "/#packages" },
  { label: "Terms", href: "/terms" },
  { label: "FAQ", href: "/#faq" },
  { label: "Legal notice", href: "/legal" },
];

export const packages: readonly Package[] = [
  {
    id: "essential",
    name: "Essential",
    tagline: "Everything you need, beautifully done",
    priceEur: 250,
    features: [
      "1 template with your choice of languages",
      "Names, date and live countdown",
      "Your story, venue and map, contact",
      "RSVP form with your deadline",
      "Guest dashboard with CSV export",
      "Template color palette and section order",
    ],
    cta: "Choose Essential",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "The full wedding-day experience",
    priceEur: 450,
    features: [
      "Everything in Essential",
      "Schedule of the day",
      "Photo gallery, up to 20 photos",
      "Dress code section",
      "Background music and opening animation",
      "Custom colors and curated fonts",
    ],
    cta: "Choose Premium",
    featured: true,
    badge: "Most complete",
  },
  {
    id: "bespoke",
    name: "Bespoke",
    tagline: "Designed around your wedding",
    priceEur: 700,
    priceFrom: true,
    features: [
      "Everything in Premium",
      "A design beyond our templates",
      "Custom sections",
      "Video",
    ],
    cta: "Let's talk",
  },
];

export const addOns: readonly AddOn[] = [
  { name: "Video section", price: "€50" },
  { name: "Custom domain", price: "€40 + domain" },
  { name: "Extra section", price: "€40" },
  { name: "Extra revision round", price: "€30" },
  { name: "Rush delivery in 3 days", price: "+€100" },
];
