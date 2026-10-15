export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Browser-side API call through the Next rewrite (`/api/v1/*`). */
export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      credentials: "include",
      ...rest,
      headers: json !== undefined ? { "content-type": "application/json", ...headers } : headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, "Internet aloqasini tekshiring va qayta urinib ko'ring");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
    throw new ApiError(res.status, data?.error ?? "Server xatosi, birozdan so'ng qayta urinib ko'ring");
  }
  return data as T;
}

export async function uploadImage(file: File): Promise<string> {
  if (file.size > 6 * 1024 * 1024) throw new ApiError(413, "Rasm 6 MB dan oshmasin");
  const { url } = await api<{ url: string }>("/uploads", {
    method: "POST",
    headers: { "content-type": file.type },
    body: file,
  });
  return url;
}
