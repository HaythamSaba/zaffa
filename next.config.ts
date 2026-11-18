import type { NextConfig } from "next";

// Baseline security headers. A full Content-Security-Policy is a known gap (see the PR):
// it needs nonces, which conflict with static prerendering, so ship it Report-Only first.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // HTTPS only (ignored by browsers over plain http, so local dev is unaffected).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  // Lets the e2e dry-run dev server use its own build folder (.next/e2e), so it can
  // run next to a developer's own `next dev`. Defaults to .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // AVIF first (much smaller photos, faster hero LCP); WebP for browsers without AVIF.
  images: { formats: ["image/avif", "image/webp"] },
  cacheComponents: true,
  partialPrefetching: true,
  // Two root layouts (marketing, invitations): unmatched URLs use app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
