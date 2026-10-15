import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./http.js";

/** In-memory fixed-window limiter per IP (single API process). */
export function rateLimit(name: string, max: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${name}|${req.ip}`;
    const entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
      return next();
    }
    if (entry.count >= max) {
      throw new HttpError(429, "Juda ko'p so'rov. Birozdan so'ng qayta urinib ko'ring");
    }
    entry.count += 1;
    next();
  };
}
