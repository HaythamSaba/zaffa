import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata = legalMetadata(
  "Terms",
  "/terms",
  "The terms for ordering a Zaffa wedding invitation website.",
);

export default function TermsPage() {
  const { legal } = siteConfig;

  return (
    <LegalPage
      title="Terms"
      intro={
        <p>
          These terms apply when you order a wedding invitation website from Zaffa. Before
          we start, we confirm your package, extras and price in writing, together with
          these terms.
        </p>
      }
    >
      <h2>1. Who we are</h2>
      <p>
        Zaffa is run by {legal.name}, {legal.address}. You can reach us at {legal.email}.
      </p>

      <h2>2. Packages and prices</h2>
      <p>
        Our packages and add-ons are listed on this website. Prices are in euros
        [PLACEHOLDER: VAT status, e.g. &ldquo;VAT included&rdquo; or &ldquo;not subject to
        VAT&rdquo;]. The price that applies is the one we confirm to you in writing before
        work starts.
      </p>

      <h2>3. Payment</h2>
      <ul>
        <li>You pay a 50% deposit once we have agreed on everything.</li>
        <li>You pay the remaining 50% when your invitation is ready, before it goes live.</li>
      </ul>

      <h2>4. Delivery</h2>
      <p>
        We deliver your invitation in about one week. The week starts once we have all
        of your content (names, date, venue, story and photos) and your deposit. Rush
        delivery in 3 days is available as an add-on.
      </p>

      <h2>5. Your content and translations</h2>
      <ul>
        <li>
          You provide the texts and photos for your invitation, and confirm that you have
          the right to use them.
        </li>
        <li>
          You can send your own translation, or we prepare one for you. Nothing goes live
          until you have approved every word. We are not responsible for errors in text
          you have approved.
        </li>
      </ul>

      <h2>6. Revisions</h2>
      <p>
        Two rounds of changes are included. Each extra round costs €30.
      </p>

      <h2>7. Cancellation and refunds</h2>
      <ul>
        <li>The deposit is non-refundable once work has started.</li>
        <li>If you cancel during the project, we keep the deposit.</li>
        <li>
          After delivery there is no refund, but we will fix anything that does not work
          as agreed.
        </li>
      </ul>
      <p>
        [CHECK WITH A LEGAL ADVISER: how these refund terms fit EU consumer law,
        including the 14-day right of withdrawal and how it is waived when work starts
        early at your request.]
      </p>

      <h2>8. How long your invitation stays online</h2>
      <p>
        Your invitation stays online until 3 months after your wedding. After that we
        archive it and it is no longer publicly available.
      </p>

      <h2>9. Guest replies (RSVP data)</h2>
      <ul>
        <li>
          Your guests&rsquo; replies are stored in the EU and are visible only to you,
          through your password-protected dashboard.
        </li>
        <li>
          After your wedding we offer you a CSV export of your guest list, and then delete
          the guest data within about 30 days.
        </li>
        <li>
          We process guest data on your behalf: [PLACEHOLDER: data processing terms].
        </li>
      </ul>

      <h2>10. Custom domains</h2>
      <p>
        If you order a custom domain, [PLACEHOLDER: who registers and owns the domain].
        The domain expires unless it is renewed.
      </p>

      <h2>11. Showing your invitation to others</h2>
      <p>
        We show your invitation to future couples only with your permission. You can ask
        us to blur names and photos.
      </p>

      <h2>12. Liability and governing law</h2>
      <p>
        [PLACEHOLDER: limitation of liability, and governing law and jurisdiction, e.g.
        the law of Slovenia. Have this section reviewed by a legal adviser.]
      </p>
    </LegalPage>
  );
}
