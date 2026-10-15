"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";

export interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
  setData: (d: T | null) => void;
}

/** The one client data hook: GET `path`, re-run when it changes, `null` path = idle. */
export function useApi<T>(path: string | null, opts: { pollMs?: number } = {}): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [tick, setTick] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    if (!path) return;
    const id = ++seq.current;
    setLoading(true);
    api<T>(path)
      .then((d) => {
        if (id !== seq.current) return;
        setData(d);
        setError(null);
      })
      .catch((e: unknown) => {
        if (id !== seq.current) return;
        setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi");
      })
      .finally(() => {
        if (id === seq.current) setLoading(false);
      });
  }, [path, tick]);

  useEffect(() => {
    if (!opts.pollMs || !path) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") setTick((n) => n + 1);
    }, opts.pollMs);
    return () => clearInterval(t);
  }, [opts.pollMs, path]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { data, error, loading, reload, setData };
}
