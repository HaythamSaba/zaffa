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
  /** Short v3 feature lines shown on the arch card. */
  features: readonly string[];
  cta: string;
  featured?: boolean;
  badge?: string;
  /** Botanical line drawing on the card. */
  icon: "small-sprig" | "sprig" | "blossom";
}

export interface AddOn {
  name: string;
  price: string;
}

export const siteConfig = {
  name: "Zaffa",
  title: "Zaffa: invitations that bring every family to the celebration",
  description:
    "Elegant wedding invitation websites, in the languages your families speak, with RSVP built in.",
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
    /** Handwritten-style signature under the intro statement. */
    signature: "Haytham",
    role: "Founder · Ljubljana",
  },
} as const;

/** Header nav, split around the centred logo (docs/landing-reference.html). */
export const headerNav: { start: readonly NavLink[]; end: readonly NavLink[] } = {
  start: [
    { label: "About", href: "/#about" },
    { label: "What we do", href: "/#features" },
  ],
  end: [
    { label: "Packages", href: "/#packages" },
    { label: "Contact", href: "/#contact" },
  ],
};

export const footerNav: readonly NavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Packages", href: "/#packages" },
  { label: "FAQ", href: "/#faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Legal", href: "/legal" },
];

export const packages: readonly Package[] = [
  {
    id: "essential",
    name: "Essential",
    tagline: "Everything you need, beautifully done",
    priceEur: 250,
    features: [
      "Names, date and countdown",
      "Your story, venue and map",
      "RSVP with your deadline",
      "Guest dashboard, CSV export",
    ],
    cta: "Choose Essential",
    icon: "small-sprig",
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "The full wedding-day experience",
    priceEur: 450,
    features: [
      "Everything in Essential",
      "Schedule, gallery, dress code",
      "Music and opening animation",
      "Your own colors and fonts",
    ],
    cta: "Choose Premium",
    featured: true,
    badge: "Most loved",
    icon: "sprig",
  },
  {
    id: "bespoke",
    name: "Bespoke",
    tagline: "Designed around your wedding",
    priceEur: 700,
    priceFrom: true,
    features: [
      "Everything in Premium",
      "A design made just for you",
      "Custom sections",
      "Video",
    ],
    cta: "Let's talk",
    icon: "blossom",
  },
];

export const addOns: readonly AddOn[] = [
  { name: "video", price: "€50" },
  { name: "custom domain", price: "€40" },
  { name: "extra section", price: "€40" },
  { name: "extra revision", price: "€30" },
  { name: "rush delivery in 3 days", price: "+€100" },
];
