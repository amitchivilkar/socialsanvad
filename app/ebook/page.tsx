import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ई-बुक",
};

export default function EbookIndexPage() {
  redirect("/ebook/karykartyachi-ai-diary");
}
