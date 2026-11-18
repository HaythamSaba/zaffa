import type { Metadata } from "next";
import { StatusNotice } from "@/components/invitation/StatusNotice";

export const metadata: Metadata = {
  title: "Temporarily unavailable",
  robots: { index: false, follow: false },
};

/** Shown by proxy.ts when the invitation for a custom domain can't be looked up. */
export default function UnavailablePage() {
  return <StatusNotice kind="unavailable" />;
}
