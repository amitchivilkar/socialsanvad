import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

const subscribeMessage =
  "नमस्कार! मला Social Sanvad च्या टिप्स WhatsApp वर हव्या आहेत.";

export function Newsletter() {
  const href = `${siteConfig.social.whatsapp}?text=${encodeURIComponent(subscribeMessage)}`;

  return (
    <section className="border-t border-[var(--border)] bg-[var(--secondary)]/50 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <div
            className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]"
            aria-hidden
          >
            <MessageCircle
              className="h-5 w-5 text-[var(--primary-foreground)]"
              strokeWidth={1.75}
            />
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            आठवड्यातून एक छोटी टिप
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            कामाची गोष्ट — थेट तुमच्या WhatsApp वर.
          </p>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-7 text-base font-medium text-[var(--background)] transition-opacity hover:opacity-90"
          >
            WhatsApp वर जोडा
          </a>

          <p className="mt-4 text-sm text-[var(--muted)]">
            बटण दाबा → मेसेज पाठवा → अपडेट्स मिळवा
          </p>
        </div>
      </Container>
    </section>
  );
}
