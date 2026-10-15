import { tx } from "../../core/db.js";
import { notFound } from "../../core/http.js";
import { msg } from "../../core/i18n.js";

const NO_REVIEW = msg("Отзыв не найден", "Пикир табылган жок");
import * as repo from "./repository.js";

export const moderate = (id: number, status: "approved" | "rejected" | "pending") =>
  tx(async (db) => {
    const review = await repo.lock(db, id);
    if (!review) throw notFound(NO_REVIEW);
    const row = await repo.setStatus(db, id, status);
    await repo.recalcRating(db, review.product_id);
    return row;
  });

export const remove = (id: number) =>
  tx(async (db) => {
    const review = await repo.lock(db, id);
    if (!review) throw notFound(NO_REVIEW);
    await repo.remove(db, id);
    await repo.recalcRating(db, review.product_id);
  });
