import { Router } from "express";
import { allow } from "../../core/auth.js";
import { pool } from "../../core/db.js";
import * as repo from "./repository.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", allow("manager"), async (_req, res) => {
  res.json(await repo.summary(pool));
});
