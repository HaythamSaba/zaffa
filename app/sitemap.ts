import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Legal pages are drafts with noindex, so only the landing page is listed for now.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", getSiteUrl()).href,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
