import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { categories } from "@/lib/categories";
import { Container } from "@/components/ui/container";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.09 16.02 2 14.86 2 12.06 2 10 3.74 10 7.14V9.5H7v4h3V22h4z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialLinks = [
  {
    href: siteConfig.social.facebook,
    label: "Facebook @socialsanvad",
    icon: FacebookIcon,
  },
  {
    href: siteConfig.social.instagram,
    label: "Instagram @socialsanvad",
    icon: InstagramIcon,
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--background)]">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/images/logo.png"
                alt=""
                width={306}
                height={226}
                className="h-8 w-auto object-contain dark:invert"
              />
              <span className="font-english text-lg font-semibold text-[var(--foreground)]">
                Social Sanvad
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[var(--muted)]">
              {siteConfig.tagline}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-[var(--foreground)]">
              मेनू
            </h3>
            <ul className="mt-4 space-y-2.5">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-[var(--foreground)]">
              विषय
            </h3>
            <ul className="mt-4 space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/topics/${cat.slug}`}
                    className="text-[15px] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-[var(--foreground)]">
              संपर्क
            </h3>
            <ul className="mt-4 space-y-2.5 text-[15px] text-[var(--muted)]">
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[var(--foreground)]"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="font-english transition-colors hover:text-[var(--foreground)]"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="font-english transition-colors hover:text-[var(--foreground)]"
                >
                  {siteConfig.contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--foreground)]"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            © {new Date().getFullYear()} Social Sanvad. सगळे हक्क राखीव.
          </p>
          <nav aria-label="कायदेशीर" className="flex flex-wrap gap-x-4 gap-y-2">
            {siteConfig.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
