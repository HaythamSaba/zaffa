import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata = legalMetadata(
  "Privacy notice",
  "/privacy",
  "How Zaffa handles the details you send through the contact form.",
);

export default function PrivacyPage() {
  const { legal } = siteConfig;

  return (
    <LegalPage
      title="Privacy notice"
      intro={
        <p>
          This notice explains what happens to the details you send us through the
          contact form on this website. Invitation websites and their RSVP forms will
          have their own notice.
        </p>
      }
    >
      <h2>Who is responsible</h2>
      <p>The controller of your personal data is:</p>
      <dl>
        <dt>Name</dt>
        <dd>{legal.name}</dd>
        <dt>Address</dt>
        <dd>{legal.address}</dd>
        <dt>Email</dt>
        <dd>{legal.email}</dd>
      </dl>

      <h2>What we collect</h2>
      <p>When you send the contact form, we receive the details you enter:</p>
      <ul>
        <li>your names and email address (required)</li>
        <li>
          if you choose to add them: your wedding date, languages, preferred package,
          wedding city and your message
        </li>
      </ul>
      <p>
        To stop abuse of the form, our server briefly uses your IP address to count how
        many messages come from the same connection. This count is kept only in memory,
        for at most 10 minutes, and is not stored. Our hosting provider may also keep
        standard server logs: [CONFIRM: hosting provider log retention].
      </p>
      <p>
        This website sets no cookies and uses no analytics or tracking. Fonts are served
        from our own domain, so your browser does not contact Google when you visit.
      </p>

      <h2>Why we use it and on what legal basis</h2>
      <ul>
        <li>
          To reply to your inquiry and prepare an offer: taking steps at your request
          before entering into a contract (Art. 6(1)(b) GDPR).
        </li>
        <li>
          To keep the form safe from spam and abuse: our legitimate interest in running
          a secure website (Art. 6(1)(f) GDPR).
        </li>
      </ul>
      <p>We do not use your details for marketing, and we never sell them.</p>

      <h2>Who else processes it</h2>
      <ul>
        <li>
          <strong>Resend</strong> delivers the contents of the form to our inbox by email.
          It acts as our processor.
        </li>
        <li>
          <strong>Vercel</strong> hosts this website and processes the request when you
          send the form. It acts as our processor.
        </li>
        <li>
          <strong>[EMAIL PROVIDER]</strong> hosts the inbox where your inquiry arrives.
        </li>
      </ul>
      <p>
        Some of these providers are based in the United States. Transfers are covered
        by [CONFIRM: EU–US Data Privacy Framework certification and/or Standard
        Contractual Clauses for each provider].
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          If you don&rsquo;t become a client: we delete your inquiry [PLACEHOLDER: e.g.
          12 months] after our last contact.
        </li>
        <li>
          If you book with us: we keep it for as long as needed for our agreement and for
          the periods required by accounting and tax law [PLACEHOLDER: retention period].
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>You can ask us at any time to:</p>
      <ul>
        <li>give you a copy of the personal data we hold about you</li>
        <li>correct it, or delete it</li>
        <li>restrict how we use it, or object to our use of it</li>
        <li>send it to you or another provider in a portable format</li>
      </ul>
      <p>
        To use these rights, email us at {legal.email}. You also have the right to
        complain to a data protection authority, in Slovenia the Information
        Commissioner (Informacijski pooblaščenec), or the authority where you live or
        work.
      </p>

      <h2>Changes to this notice</h2>
      <p>
        If we change how we handle your data, we will update this page and the date at
        the top.
      </p>
    </LegalPage>
  );
}
