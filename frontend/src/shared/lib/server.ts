import { mockGet } from "@/shared/mock/api";
import type { Store } from "./types";

/** Public catalog data may be up to this many seconds stale; checkout re-reads prices and stock on the API. */
const REVALIDATE_SECONDS = 30;

/**
 * `BACKEND_URL` is the Vercel service binding (runtime only); `API_INTERNAL_URL` is the Docker/dev address.
 * On Vercel without either (backend service disconnected) or with `MOCK_API=1`, reads come from mock data.
 */
function apiBase(): string | null {
  if (process.env.MOCK_API === "1") return null;
  const origin = process.env.BACKEND_URL ?? process.env.API_INTERNAL_URL;
  if (!origin && process.env.VERCEL) return null;
  return `${(origin ?? "http://localhost:4010").replace(/\/+$/, "")}/api/v1`;
}

/** Server-side read from the public API. Returns null on 404. */
export async function serverGet<T>(path: string): Promise<T | null> {
  const base = apiBase();
  if (!base) return (mockGet(path) as T | undefined) ?? null;
  const res = await fetch(`${base}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return (await res.json()) as T;
}

export async function getStore(): Promise<Store> {
  return (await serverGet<Store>("/public/settings"))!;
}
