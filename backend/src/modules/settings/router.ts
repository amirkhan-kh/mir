import { Router } from "express";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import { parse } from "../../core/http.js";
import * as repo from "./repository.js";

export const settingsPublic = Router();
export const settingsRouter = Router();

settingsPublic.get("/", async (_req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  res.json(await repo.getStore(pool));
});

settingsRouter.get("/", async (_req, res) => {
  res.json(await repo.getStore(pool));
});

settingsRouter.put("/", allow(), async (req, res) => {
  res.json(await repo.putStore(pool, parse(repo.storeSchema, req.body)));
});
