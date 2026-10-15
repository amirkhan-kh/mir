import type { CookieOptions, NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { pool } from "./db.js";
import { forbidden, unauthorized } from "./http.js";

export const COOKIE = "mir_token";
export type Role = "admin" | "manager" | "courier";
export interface SessionUser {
  id: number;
  username: string;
  full_name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

const TTL_SECONDS = 60 * 60 * 24 * 7;

export function signToken(user: { id: number; token_version: number }): string {
  return jwt.sign({ sub: String(user.id), v: user.token_version }, config.jwtSecret, { expiresIn: TTL_SECONDS });
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProd,
  path: "/",
};

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: TTL_SECONDS * 1000 });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE, cookieOptions);
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return (req.cookies?.[COOKIE] as string | undefined) ?? null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) throw unauthorized();
  let payload: { sub: string; v: number };
  try {
    payload = jwt.verify(token, config.jwtSecret) as { sub: string; v: number };
  } catch {
    throw unauthorized("Sessiya tugagan, qayta kiring");
  }
  const { rows } = await pool.query(
    "SELECT id, username, full_name, role, active, token_version FROM users WHERE id = $1",
    [Number(payload.sub)],
  );
  const user = rows[0];
  if (!user || !user.active || user.token_version !== payload.v) throw unauthorized("Sessiya tugagan, qayta kiring");
  req.user = { id: user.id, username: user.username, full_name: user.full_name, role: user.role };
  next();
}

/** Role gate. `admin` passes every gate. */
export const allow =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) throw unauthorized();
    if (role !== "admin" && !roles.includes(role)) throw forbidden();
    next();
  };
