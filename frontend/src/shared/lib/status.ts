import type { Tone } from "@/shared/ui/Badge";
import type { OrderStatus, Role } from "./types";

/** Badge colours per state; labels live in the dictionaries (`t.status.*`). */
export const ORDER_TONE: Record<OrderStatus, Tone> = {
  new: "amber",
  confirmed: "sky",
  delivering: "lime",
  delivered: "leaf",
  cancelled: "flame",
};

export const ORDER_STATUSES = Object.keys(ORDER_TONE) as OrderStatus[];

export const REVIEW_TONE: Record<"pending" | "approved" | "rejected", Tone> = {
  pending: "amber",
  approved: "leaf",
  rejected: "flame",
};

export const ROLES: Role[] = ["admin", "manager", "courier"];
