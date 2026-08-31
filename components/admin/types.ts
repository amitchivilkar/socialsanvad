export type OrderRow = {
  orderId: string;
  ebookSlug: string;
  name: string;
  phone: string;
  status: string;
  downloadCount: number;
  downloadToken?: string;
  downloadUrl?: string | null;
  downloadExpiresAt?: string;
  whatsappSentAt?: string;
  createdAt: string;
  paidAt?: string;
};

export type OrderStatusFilter = "all" | "paid" | "pending" | "failed";

export const ARTICLE_TITLE_KEY = "ss_admin_article_title";
export const ARTICLE_URL_KEY = "ss_admin_article_url";
