import { redirect } from "next/navigation";

/** Old/ads links → single landing with 2.0 preselected. */
export default function Ebook2RedirectPage() {
  redirect("/ebook/karykartyachi-ai-diary?v=2");
}
