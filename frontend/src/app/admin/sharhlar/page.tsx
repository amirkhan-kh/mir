import type { Metadata } from "next";
import { ReviewsAdmin } from "@/features/admin/reviews/ReviewsAdmin";

export const metadata: Metadata = { title: "Sharhlar" };

export default function ReviewsPage() {
  return <ReviewsAdmin />;
}
