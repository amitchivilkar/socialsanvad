import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrdersRedirectPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const status = params.status;
  const query = status ? `?status=${status}` : "";
  redirect(`/admin${query}`);
}
