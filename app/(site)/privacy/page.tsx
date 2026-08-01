import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site";

const LEGAL_EMAIL = "socialsanvad@gmail.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what personal information we collect, why we collect it, and how we protect it."
      updatedAt="1 August 2026"
    >
      <section>
        <h2>1. Who we are</h2>
        <p className="mt-3">
          This website is operated by <strong>{siteConfig.name}</strong>. For
          privacy questions, email{" "}
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <ul>
          <li>
            <strong>Ebook purchases:</strong> name, mobile / contact number, and
            order-related payment details needed to complete your purchase.
          </li>
          <li>
            <strong>Contact:</strong> information you send us by email.
          </li>
          <li>
            <strong>Technical data:</strong> basic logs such as browser type,
            device, and pages visited, used for hosting, security, and improving
            the site.
          </li>
        </ul>
        <p className="mt-3">
          We do not store your full card details or banking passwords. Card /
          UPI payments are handled by Cashfree or other secure payment
          providers.
        </p>
      </section>

      <section>
        <h2>3. How we use your information</h2>
        <ul>
          <li>To deliver the ebook / PDF after payment</li>
          <li>To complete and verify orders</li>
          <li>To respond to support requests</li>
          <li>To operate, secure, and improve the website</li>
          <li>To comply with legal obligations when required</li>
        </ul>
      </section>

      <section>
        <h2>4. Who we share data with</h2>
        <ul>
          <li>
            <strong>Cashfree:</strong> to process payments
          </li>
          <li>
            <strong>Hosting and delivery tools:</strong> to run the site and
            send digital products
          </li>
          <li>
            Authorities, only when required by law and to the extent necessary
          </li>
        </ul>
        <p className="mt-3">
          We do not sell your phone number or email to third parties for
          advertising.
        </p>
      </section>

      <section>
        <h2>5. How long we keep data</h2>
        <p className="mt-3">
          We keep order and delivery information as long as needed for
          fulfilment, support, accounting, or legal requirements. We then remove
          or minimise data that is no longer needed.
        </p>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p className="mt-3">
          We may use basic cookies or similar storage for site features (for
          example, theme or session preferences). If we add advertising or
          extra tracking cookies, we will disclose that separately.
        </p>
      </section>

      <section>
        <h2>7. Your rights</h2>
        <p className="mt-3">
          You may ask about the personal data we hold, request corrections, or
          ask for deletion by emailing{" "}
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. Some requests may
          be limited where we must keep records for legal or order purposes.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p className="mt-3">
          This site and our ebooks are intended for adults. We do not knowingly
          collect personal data from children under 18.
        </p>
      </section>

      <section>
        <h2>9. Related policies</h2>
        <p className="mt-3">
          Please also read our <Link href="/terms">Terms & Conditions</Link> and{" "}
          <Link href="/refunds">Payment & Refund Policy</Link>.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p className="mt-3">
          Email: <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
        </p>
      </section>
    </LegalPage>
  );
}
