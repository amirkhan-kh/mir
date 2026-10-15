import type { Store } from "./types";

const BASE = `${(process.env.API_INTERNAL_URL ?? "http://localhost:4010").replace(/\/+$/, "")}/api/v1`;

/** Public catalog data may be up to this many seconds stale; checkout re-reads prices and stock on the API. */
const REVALIDATE_SECONDS = 30;

/** Server-side read from the public API. Returns null on 404. */
export async function serverGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: REVALIDATE_SECONDS } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return (await res.json()) as T;
}

export async function getStore(): Promise<Store> {
  return (await serverGet<Store>("/public/settings"))!;
}
