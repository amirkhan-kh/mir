import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { clearSessionCookie, requireAuth, setSessionCookie, signToken } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { HttpError, conflict, invalid, parse, unauthorized, zmsg } from "../../core/http.js";
import { msg } from "../../core/i18n.js";

export const authRouter = Router();

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; until: number }>();

const loginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = parse(loginSchema, req.body);
  const key = `${username.toLowerCase()}|${req.ip}`;
  const entry = fails.get(key);
  if (entry && entry.until > Date.now()) {
    const minutes = Math.ceil((entry.until - Date.now()) / 60000);
    throw new HttpError(429, msg(`Слишком много неудачных попыток. Попробуйте через ${minutes} мин.`, `Ийгиликсиз аракет өтө көп. ${minutes} мүнөттөн кийин кайра аракет кылыңыз`));
  }
  const { rows } = await pool.query("SELECT * FROM users WHERE lower(username) = lower($1)", [username]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const lockExpired = entry && entry.until > 0 && entry.until <= Date.now();
    const count = (entry && !lockExpired ? entry.count : 0) + 1;
    fails.set(key, { count, until: count >= MAX_FAILS ? Date.now() + LOCK_MS : 0 });
    throw unauthorized(msg("Неверный логин или пароль", "Логин же сырсөз туура эмес"));
  }
  if (!user.active) throw new HttpError(403, msg("Ваш аккаунт заблокирован. Обратитесь к администратору", "Аккаунтуңуз бөгөттөлгөн. Администраторго кайрылыңыз"));
  fails.delete(key);
  await pool.query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);
  setSessionCookie(res, signToken(user));
  res.json({ id: user.id, username: user.username, full_name: user.full_name, role: user.role });
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

const passwordSchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(8, zmsg("Минимум 8 символов", "Кеминде 8 белги")).max(200),
});

authRouter.post("/password", requireAuth, async (req, res) => {
  const { current, next } = parse(passwordSchema, req.body);
  const { rows } = await pool.query("SELECT password_hash, token_version FROM users WHERE id = $1", [req.user!.id]);
  if (!(await bcrypt.compare(current, rows[0].password_hash))) throw invalid(msg("Текущий пароль неверный", "Учурдагы сырсөз туура эмес"));
  if (current === next) throw conflict(msg("Новый пароль должен отличаться от текущего", "Жаңы сырсөз учурдагыдан айырмаланышы керек"));
  const hash = await bcrypt.hash(next, 10);
  const { rows: updated } = await pool.query(
    "UPDATE users SET password_hash = $2, token_version = token_version + 1 WHERE id = $1 RETURNING id, token_version",
    [req.user!.id, hash],
  );
  setSessionCookie(res, signToken(updated[0]));
  res.status(204).end();
});
