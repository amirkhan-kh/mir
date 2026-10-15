import { langFromCookie } from "@/shared/i18n/config";
import { DICTS } from "@/shared/i18n/dict";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const currentLang = () => langFromCookie(typeof document === "undefined" ? "" : document.cookie);

/** Public reads carry `lang` in the URL so cached responses never mix languages. */
function withLang(path: string) {
  if (!path.startsWith("/public/")) return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${currentLang()}`;
}

/** Browser-side API call through the Next rewrite (`/api/v1/*`). */
export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const lang = currentLang();
  const t = DICTS[lang].common;
  let res: Response;
  try {
    res = await fetch(`/api/v1${withLang(path)}`, {
      credentials: "include",
      ...rest,
      headers: { "x-lang": lang, ...(json !== undefined ? { "content-type": "application/json" } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, t.networkError);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    throw new ApiError(res.status, data?.error ?? t.serverError);
  }
  return data as T;
}

export async function uploadImage(file: File): Promise<string> {
  if (file.size > 6 * 1024 * 1024) throw new ApiError(413, DICTS[currentLang()].common.imageTooBig);
  const { url } = await api<{ url: string }>("/uploads", {
    method: "POST",
    headers: { "content-type": file.type },
    body: file,
  });
  return url;
}
