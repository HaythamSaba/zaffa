import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

type Props = {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
};

/** Drafts are kept out of search results until the text is final and reviewed. */
export function legalMetadata(title: string, path: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: false, follow: true },
    openGraph: { url: path, title, description },
  };
}

const prose =
  "flex flex-col gap-4 text-cocoa " +
  "[&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-h3 [&_h2]:font-medium [&_h2]:uppercase [&_h2]:tracking-caps " +
  "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:ps-6 " +
  "[&_a]:text-taupe [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-cocoa " +
  "[&_dl]:grid [&_dl]:grid-cols-1 sm:[&_dl]:grid-cols-[auto_1fr] [&_dl]:gap-x-6 [&_dl]:gap-y-1 sm:[&_dl]:gap-y-2 " +
  "[&_dt]:font-semibold [&_dt]:mt-2 sm:[&_dt]:mt-0";

export function LegalPage({ title, intro, children }: Props) {
  return (
    <>
      <SiteHeader variant="solid" />
      <main id="main">
        <article className="py-14 nav:py-20">
          <Container className="max-w-200">
            <p
              role="note"
              className="mb-8 border border-taupe bg-sand px-4 py-3 text-small font-semibold text-cocoa"
            >
              DRAFT: this page is not final and has not been legally reviewed. Text in
              [BRACKETS] still needs real details.
            </p>

            <h1 className="caps text-h2 text-balance">{title}</h1>
            <p className="mt-3 text-small text-mocha">Last updated: {siteConfig.legal.lastUpdated}</p>
            {intro && <div className="mt-6 text-taupe">{intro}</div>}

            <div className={`mt-8 ${prose}`}>{children}</div>
          </Container>
        </article>
      </main>
    </>
  );
}
