"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function closeMobile() {
    setOpen(false);
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-transparent bg-[var(--background)]/90 backdrop-blur-md transition-colors",
          scrolled && "border-[var(--border)]"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-[4.25rem] sm:px-8">
          <Link
            href="/"
            onClick={closeMobile}
            className="flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
            aria-label="Social Sanvad होमपेज"
          >
            <Image
              src="/images/logo.png"
              alt="Social Sanvad"
              width={306}
              height={226}
              className="h-9 w-auto object-contain dark:invert"
              priority
            />
            <span className="font-english text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
              Social Sanvad
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="मुख्य मेनू"
          >
            {siteConfig.nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[15px] transition-colors",
                    active
                      ? "font-medium text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  {item.label}
                  {active ? (
                    <span
                      className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-[var(--primary)]"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
              aria-label="शोध"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)] lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "मेनू बंद करा" : "मेनू उघडा"}
            >
              {open ? (
                <X className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {open ? (
          <nav
            id="mobile-nav"
            className="border-t border-[var(--border)] bg-[var(--background)] px-5 py-4 lg:hidden"
            aria-label="मोबाइल मेनू"
          >
            <ul className="flex flex-col gap-1">
              {siteConfig.nav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className={cn(
                        "block rounded-lg px-3 py-3 text-base",
                        active
                          ? "bg-[var(--secondary)] font-medium text-[var(--foreground)]"
                          : "text-[var(--muted)]"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
