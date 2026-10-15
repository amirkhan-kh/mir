import type { InstallmentPlan } from "./types";

export const monthly = (price: number, plan: InstallmentPlan) => Math.ceil((price * (1 + plan.percent / 100)) / plan.months);

export function longestPlan(plans: InstallmentPlan[]) {
  return plans.reduce<InstallmentPlan | null>((best, p) => (!best || p.months > best.months ? p : best), null);
}
