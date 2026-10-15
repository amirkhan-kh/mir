import type { DeliveryMethod, OrderStatus, PaymentMethod, Role } from "./types";

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: "lime" | "ink" | "amber" | "leaf" | "flame" | "sky" }> = {
  new: { label: "Yangi", tone: "amber" },
  confirmed: { label: "Tasdiqlangan", tone: "sky" },
  delivering: { label: "Yetkazilmoqda", tone: "lime" },
  delivered: { label: "Yetkazildi", tone: "leaf" },
  cancelled: { label: "Bekor qilingan", tone: "flame" },
};

/** Customer-facing wording of the same states. */
export const ORDER_STEP: Record<Exclude<OrderStatus, "cancelled">, { title: string; hint: string }> = {
  new: { title: "Qabul qilindi", hint: "Operator tez orada qo'ng'iroq qiladi" },
  confirmed: { title: "Tasdiqlandi", hint: "Tovar tayyorlanmoqda" },
  delivering: { title: "Yo'lda", hint: "Kuryerimiz sizga yo'l olgan" },
  delivered: { title: "Topshirildi", hint: "Xaridingiz uchun rahmat!" },
};

export const STATUS_ACTION: Record<OrderStatus, string> = {
  new: "Yangi",
  confirmed: "Tasdiqlash",
  delivering: "Yetkazishga berish",
  delivered: "Yetkazildi deb belgilash",
  cancelled: "Bekor qilish",
};

export const DELIVERY: Record<DeliveryMethod, string> = {
  courier: "Kuryer orqali",
  pickup: "Do'kondan olib ketish",
};

export const PAYMENT: Record<PaymentMethod, string> = {
  cash: "Naqd pul",
  card: "Karta (qabul qilganda)",
  installment: "Muddatli to'lov",
};

export const ROLE: Record<Role, { label: string; hint: string }> = {
  admin: { label: "Administrator", hint: "Hamma bo'limlar, xodimlar va sozlamalar" },
  manager: { label: "Menejer", hint: "Buyurtmalar, tovarlar, bannerlar, sharhlar" },
  courier: { label: "Kuryer", hint: "Faqat o'ziga biriktirilgan buyurtmalar" },
};

export const REVIEW_STATUS: Record<string, { label: string; tone: "amber" | "leaf" | "flame" }> = {
  pending: { label: "Kutilmoqda", tone: "amber" },
  approved: { label: "Chop etilgan", tone: "leaf" },
  rejected: { label: "Rad etilgan", tone: "flame" },
};
