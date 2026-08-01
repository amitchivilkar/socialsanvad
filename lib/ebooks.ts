export type Ebook = {
  slug: string;
  title: string;
  subtitle: string;
  priceInr: number;
  cover: string;
  ctaLabel: string;
};

export const ebooks: Ebook[] = [
  {
    slug: "karykartyachi-ai-diary",
    title: "कार्यकर्त्याची AI डायरी",
    subtitle: "राजकीय कार्यकर्त्यांसाठी AI कंटेंट सिस्टम",
    priceInr: 125,
    cover: "/images/karykartyachi-ai-diary.png",
    ctaLabel: "आत्ताच ई-बुक मिळवा",
  },
];

export function getEbook(slug: string): Ebook | undefined {
  return ebooks.find((e) => e.slug === slug);
}

export function formatInr(amount: number): string {
  return `₹${amount}`;
}
