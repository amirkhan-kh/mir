import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { ReviewsAdmin } from "@/features/admin/reviews/ReviewsAdmin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.reviews };
}

export default function ReviewsPage() {
  return <ReviewsAdmin />;
}
