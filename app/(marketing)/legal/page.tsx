import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata = legalMetadata(
  "Legal notice",
  "/legal",
  "Legal information about the provider of this website.",
);

export default function LegalNoticePage() {
  const { legal } = siteConfig;

  return (
    <LegalPage title="Legal notice">
      <h2>Provider of this website</h2>
      <dl>
        <dt>Name</dt>
        <dd>{legal.name}</dd>
        <dt>Legal form</dt>
        <dd>{legal.form}</dd>
        <dt>Address</dt>
        <dd>{legal.address}</dd>
        <dt>Registration</dt>
        <dd>{legal.registration}</dd>
        <dt>VAT ID</dt>
        <dd>{legal.vatId}</dd>
        <dt>Email</dt>
        <dd>{legal.email}</dd>
        <dt>Phone</dt>
        <dd>{legal.phone}</dd>
        <dt>Responsible for content</dt>
        <dd>[NAME OF PERSON RESPONSIBLE]</dd>
      </dl>
    </LegalPage>
  );
}
