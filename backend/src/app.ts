import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { requireAuth } from "./core/auth.js";
import { config } from "./core/config.js";
import { pool } from "./core/db.js";
import { errorHandler, notFound } from "./core/http.js";
import { authRouter } from "./modules/auth/router.js";
import { bannersPublic, bannersRouter } from "./modules/banners/router.js";
import { categoriesPublic, categoriesRouter } from "./modules/categories/router.js";
import { dashboardRouter } from "./modules/dashboard/router.js";
import { ordersPublic, ordersRouter } from "./modules/orders/router.js";
import { productsPublic, productsRouter } from "./modules/products/router.js";
import { reviewsPublic, reviewsRouter } from "./modules/reviews/router.js";
import { settingsPublic, settingsRouter } from "./modules/settings/router.js";
import { uploadsRouter } from "./modules/uploads/router.js";
import { usersRouter } from "./modules/users/router.js";

export const app = express();

app.set("trust proxy", "loopback");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
});

app.use("/uploads", express.static(config.uploadDir, { maxAge: "30d", immutable: true, fallthrough: false }));

const api = express.Router();

api.use("/public/categories", categoriesPublic);
api.use("/public/products", productsPublic);
api.use("/public/banners", bannersPublic);
api.use("/public/orders", ordersPublic);
api.use("/public/reviews", reviewsPublic);
api.use("/public/settings", settingsPublic);
api.use("/auth", authRouter);

api.use(requireAuth);
api.use("/dashboard", dashboardRouter);
api.use("/categories", categoriesRouter);
api.use("/products", productsRouter);
api.use("/banners", bannersRouter);
api.use("/orders", ordersRouter);
api.use("/reviews", reviewsRouter);
api.use("/users", usersRouter);
api.use("/settings", settingsRouter);
api.use("/uploads", uploadsRouter);

app.use("/api/v1", api);
app.use(() => {
  throw notFound("Manzil topilmadi");
});
app.use(errorHandler);
