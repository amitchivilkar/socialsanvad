import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-sm font-medium text-[var(--muted)]">404</p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight">
        हे पेज सापडलं नाही
      </h1>
      <p className="mt-3 max-w-md text-[var(--muted)]">
        तुम्ही शोधत असलेलं पेज नाहीये, किंवा हलवलं गेलंय.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-[var(--background)]"
      >
        होमपेजवर जा
      </Link>
    </Container>
  );
}
