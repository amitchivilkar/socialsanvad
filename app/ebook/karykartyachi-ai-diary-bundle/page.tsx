import { redirect } from "next/navigation";

/** Old/ads links → single landing with Bundle preselected. */
export default function EbookBundleRedirectPage() {
  redirect("/ebook/karykartyachi-ai-diary?v=bundle");
}
