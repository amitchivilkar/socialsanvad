import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site";

const LEGAL_EMAIL = "socialsanvad@gmail.com";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms and conditions for using ${siteConfig.name} and purchasing digital products.`,
  alternates: { canonical: "/niyam" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="These terms apply when you use this website and buy our digital products."
      updatedAt="1 August 2026"
    >
      <section>
        <h2>1. Who we are</h2>
        <p className="mt-3">
          This website is operated by <strong>{siteConfig.name}</strong>. For
          questions, email{" "}
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
        </p>
      </section>

      <section>
        <h2>2. What this site is for</h2>
        <p className="mt-3">
          We publish articles, tools, and ebooks related to political and social
          digital communication. Content is for general guidance only. It is not
          legal, electoral, or professional advice.
        </p>
      </section>

      <section>
        <h2>3. Ebook purchases</h2>
        <ul>
          <li>
            Ebooks are sold as digital PDF files. There is no physical delivery.
          </li>
          <li>
            After successful payment, the PDF is delivered digitally (for
            example, to the contact details you provide at checkout).
          </li>
          <li>
            Prices are shown in Indian Rupees (INR). Payments are processed
            securely through Cashfree.
          </li>
          <li>
            You must provide accurate details at checkout. We are not responsible
            if delivery fails because of incorrect information you submitted.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Use and copyright</h2>
        <ul>
          <li>
            Website content, design, and ebook materials are owned by{" "}
            {siteConfig.name}, unless stated otherwise.
          </li>
          <li>
            Ebooks are for personal use. Reselling, mass copying, or public
            redistribution without permission is not allowed.
          </li>
          <li>
            Misuse of the site (hacking, spam, spreading false information) is
            prohibited.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Limitation of liability</h2>
        <p className="mt-3">
          We aim to share useful information, but we do not guarantee outcomes
          (for example, reach or campaign results). To the fullest extent
          permitted by law, our liability for any loss arising from use of the
          site or ebooks is limited.
        </p>
      </section>

      <section>
        <h2>6. Payments and refunds</h2>
        <p className="mt-3">
          Details about payment, delivery, and refunds are in our{" "}
          <Link href="/paratava">Payment & Refund Policy</Link>.
        </p>
      </section>

      <section>
        <h2>7. Privacy</h2>
        <p className="mt-3">
          How we handle your data is explained in our{" "}
          <Link href="/gopanita">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>8. Changes</h2>
        <p className="mt-3">
          We may update these terms from time to time. The “Last updated” date
          on this page will change when we do. Terms in effect at the time of
          purchase apply to that order.
        </p>
      </section>

      <section>
        <h2>9. Governing law</h2>
        <p className="mt-3">
          These terms are governed by the applicable laws of India. Courts in
          Maharashtra / India shall have jurisdiction over disputes, as
          applicable.
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
