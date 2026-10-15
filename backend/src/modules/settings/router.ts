import { Router } from "express";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { parse } from "../../core/http.js";
import { langOf } from "../../core/i18n.js";
import * as repo from "./repository.js";

export const settingsPublic = Router();
export const settingsRouter = Router();

settingsPublic.get("/", async (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  res.json(repo.localizeStore(await repo.getStore(pool), langOf(req)));
});

settingsRouter.get("/", async (_req, res) => {
  res.json(await repo.getStore(pool));
});

settingsRouter.put("/", allow(), async (req, res) => {
  res.json(await repo.putStore(pool, parse(repo.storeSchema, req.body)));
});
