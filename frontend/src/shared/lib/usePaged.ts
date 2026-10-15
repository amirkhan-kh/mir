"use client";

import { useEffect, useState } from "react";
import { useApi } from "./useApi";

/** List screen state: search (300 ms debounce), status chip, page, extra filters. */
export function usePaged<T>(base: string, opts: { limit?: number; extra?: Record<string, string>; pollMs?: number } = {}) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatusRaw] = useState("");
  const [page, setPage] = useState(1);
  const limit = opts.limit ?? 15;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const extraKey = JSON.stringify(opts.extra ?? {});
  useEffect(() => setPage(1), [extraKey]);

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (debounced) params.set("q", debounced);
  if (status) params.set("status", status);
  for (const [k, v] of Object.entries(opts.extra ?? {})) if (v) params.set(k, v);

  const state = useApi<T>(`${base}?${params}`, { pollMs: opts.pollMs });
  const setStatus = (s: string) => {
    setStatusRaw(s);
    setPage(1);
  };
  return { ...state, q, setQ, status, setStatus, page, setPage, limit };
}
