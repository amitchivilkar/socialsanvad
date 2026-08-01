import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site";

const LEGAL_EMAIL = "socialsanvad@gmail.com";

export const metadata: Metadata = {
  title: "Payment & Refund Policy",
  description: `Payment, delivery, and refund rules for ${siteConfig.name} ebook purchases.`,
  alternates: { canonical: "/paratava" },
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Payment & Refund Policy"
      description="Clear rules for ebook payment, digital delivery, and refunds."
      updatedAt="1 August 2026"
    >
      <section>
        <h2>1. What you are buying</h2>
        <p className="mt-3">
          We sell digital ebooks (PDF). There is no physical product and no
          courier delivery. Traditional “return / exchange” does not apply in
          the same way as for physical goods.
        </p>
      </section>

      <section>
        <h2>2. Payment</h2>
        <ul>
          <li>Prices are shown in Indian Rupees (INR) on the website.</li>
          <li>
            Payments are processed through <strong>Cashfree</strong> (UPI, cards,
            net banking, and other methods they support).
          </li>
          <li>
            An order is considered complete only after successful payment. Failed
            or cancelled payments are not charged.
          </li>
          <li>
            Bank or gateway delays and any fees charged by your bank follow their
            own policies.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Delivery</h2>
        <ul>
          <li>
            After successful payment, the PDF is delivered digitally using the
            contact details you provide at checkout.
          </li>
          <li>
            Delivery is usually within a few minutes to a few hours. Manual
            checks may occasionally cause a short delay.
          </li>
          <li>
            If you do not receive the PDF within 24 hours, email{" "}
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> with your name,
            contact number, and payment time / transaction details.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Refunds — general rule</h2>
        <p className="mt-3">
          Once a digital file has been delivered, it cannot be “returned.”
          Therefore,{" "}
          <strong>
            refunds are generally not available after successful delivery
          </strong>
          .
        </p>
        <p className="mt-3">We may help or consider a refund when:</p>
        <ul>
          <li>
            Payment succeeded but we could not deliver the PDF for technical
            reasons, and alternative delivery is not possible
          </li>
          <li>You were charged twice by mistake</li>
          <li>
            You were charged an incorrect price compared with the published price
            on our site
          </li>
        </ul>
      </section>

      <section>
        <h2>5. When refunds are not available</h2>
        <ul>
          <li>
            You received the file but changed your mind or did not like the
            content
          </li>
          <li>You provided incorrect contact details at checkout</li>
          <li>
            You cannot open or download the file due to your own device or app
            issues
          </li>
          <li>You shared the file with others and then requested a refund</li>
        </ul>
      </section>

      <section>
        <h2>6. How to request a refund</h2>
        <p className="mt-3">
          Contact us within 7 days of purchase at{" "}
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>. Include your name,
          the contact number used at checkout, payment date / transaction ID, and
          a short description of the issue.
        </p>
        <p className="mt-3">
          If a refund is approved, it will be initiated to the original payment
          method within about 5–10 business days, subject to your bank’s
          timelines.
        </p>
      </section>

      <section>
        <h2>7. Cancellation</h2>
        <p className="mt-3">
          You may leave checkout before payment is completed — no charge applies.
          After successful payment and file delivery, orders generally cannot be
          cancelled except under the cases listed above.
        </p>
      </section>

      <section>
        <h2>8. Related pages</h2>
        <p className="mt-3">
          <Link href="/niyam">Terms & Conditions</Link> ·{" "}
          <Link href="/gopanita">Privacy Policy</Link>
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p className="mt-3">
          Email: <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
        </p>
      </section>
    </LegalPage>
  );
}
