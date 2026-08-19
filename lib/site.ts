export const siteConfig = {
  name: "Social Sanvad",
  nameMr: "सोशल संवाद",
  tagline: "राजकारणात ऑनलाइन कसं बोलायचं — सोप्या मराठीतून",
  description:
    "Social Sanvad (काही जण Social Samvad असंही शोधतात) — नेते, कार्यकर्ते आणि संस्थांसाठी सोशल मीडिया, AI आणि WhatsApp सोप्या मराठीतून.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://socialsanvad.com",
  locale: "mr_IN",
  language: "mr",
  author: {
    name: "Social Sanvad",
    role: "डिजिटल संवाद",
    bio: "मी राजकारण आणि सामाजिक कामात ऑनलाइन बोलण्याचं काम करतो. जे शिकलो ते इथे सोप्या भाषेत लिहितो — म्हणजे लगेच वापरता येईल.",
    email: "socialsanvad@gmail.com",
  },
  contact: {
    email: "socialsanvad@gmail.com",
    phone: "+917738533840",
    phoneDisplay: "+91 77385 33840",
  },
  social: {
    facebook: "https://facebook.com/socialsanvad",
    instagram: "https://instagram.com/socialsanvad",
    twitter: "https://twitter.com/socialsanvad",
    youtube: "https://youtube.com/@socialsanvad",
    whatsapp: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917738533840"}`,
  },
  nav: [
    { href: "/", label: "होमपेज" },
    { href: "/articles", label: "लेख" },
    { href: "/topics", label: "विषय" },
    { href: "/resources", label: "साधने" },
    { href: "/about", label: "माझ्याबद्दल" },
    { href: "/contact", label: "संपर्क" },
  ],
  legal: [
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
    { href: "/refunds", label: "Refunds" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
