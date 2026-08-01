"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site";

const message =
  "नमस्कार! मला Social Sanvad च्या टिप्स WhatsApp वर हव्या आहेत.";

export function WhatsAppSticky() {
  const href = `${siteConfig.social.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-[var(--background)] shadow-md transition-opacity hover:opacity-90 sm:bottom-6 sm:right-6"
      aria-label="WhatsApp वर संपर्क साधा"
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
      <span>WhatsApp</span>
    </a>
  );
}
