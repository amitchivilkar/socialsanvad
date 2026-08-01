import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppSticky } from "@/components/layout/whatsapp-sticky";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <Footer />
      <WhatsAppSticky />
    </div>
  );
}
