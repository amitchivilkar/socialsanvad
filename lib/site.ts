export const siteConfig = {
  name: "Social Sanvad",
  nameMr: "सोशल संवाद",
  tagline: "राजकारणात ऑनलाइन कसं बोलायचं — सोप्या मराठीतून",
  description:
    "नेते, कार्यकर्ते आणि संस्थांसाठी सोशल मीडिया, AI आणि WhatsApp — सोप्या मराठीतून.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://socialsanvad.com",
  locale: "mr_IN",
  language: "mr",
  author: {
    name: "Social Sanvad",
    role: "डिजिटल संवाद",
    bio: "मी राजकारण आणि सामाजिक कामात ऑनलाइन बोलण्याचं काम करतो. जे शिकलो ते इथे सोप्या भाषेत लिहितो — म्हणजे लगेच वापरता येईल.",
    email: "hello@socialsanvad.com",
  },
  social: {
    facebook: "https://facebook.com/socialsanvad",
    instagram: "https://instagram.com/socialsanvad",
    twitter: "https://twitter.com/socialsanvad",
    youtube: "https://youtube.com/@socialsanvad",
    whatsapp: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999"}`,
  },
  nav: [
    { href: "/", label: "होमपेज" },
    { href: "/lekha", label: "लेख" },
    { href: "/vishay", label: "विषय" },
    { href: "/sansadhane", label: "साधने" },
    { href: "/majhyabadal", label: "माझ्याबद्दल" },
  ],
  legal: [
    { href: "/niyam", label: "Terms" },
    { href: "/gopanita", label: "Privacy" },
    { href: "/paratava", label: "Refunds" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
