import bcrypt from "bcryptjs";
import { tx } from "../../core/db.js";
import { conflict, notFound } from "../../core/http.js";
import { msg } from "../../core/i18n.js";

const NO_STAFF = msg("Сотрудник не найден", "Кызматкер табылган жок");
import * as repo from "./repository.js";

export interface StaffInput {
  username: string;
  password: string;
  full_name: string;
  phone: string | null;
  role: "admin" | "manager" | "courier";
}

export const create = async (input: StaffInput) => {
  const password_hash = await bcrypt.hash(input.password, 10);
  return tx((db) => repo.insert(db, { ...input, password_hash }));
};

export const update = (
  id: number,
  actorId: number,
  input: { full_name: string; phone: string | null; role: StaffInput["role"]; active: boolean },
) =>
  tx(async (db) => {
    const admins = await repo.lockActiveAdmins(db);
    const user = await repo.lock(db, id);
    if (!user) throw notFound(NO_STAFF);
    const roleChanged = user.role !== input.role;
    const blocked = user.active && !input.active;
    if (id === actorId && (roleChanged || blocked)) {
      throw conflict(msg("Нельзя менять свою роль или блокировать себя", "Өз ролуңузду өзгөртүүгө же өзүңүздү бөгөттөөгө болбойт"));
    }
    const losesAdmin = user.role === "admin" && user.active && (roleChanged || blocked);
    if (losesAdmin && admins.length <= 1) throw conflict(msg("Должен остаться хотя бы один активный администратор", "Жок дегенде бир активдүү администратор калышы керек"));
    return repo.update(db, id, { ...input, bump: roleChanged || blocked });
  });

export const resetPassword = async (id: number, password: string) => {
  const hash = await bcrypt.hash(password, 10);
  await tx(async (db) => {
    if (!(await repo.lock(db, id))) throw notFound(NO_STAFF);
    await repo.setPassword(db, id, hash);
  });
};
