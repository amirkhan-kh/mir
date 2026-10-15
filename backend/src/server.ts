import express, { type ErrorRequestHandler } from "express";
import { app } from "./app.js";
import { config } from "./core/config.js";
import { langOf } from "./core/i18n.js";
import { migrate } from "./core/migrate.js";
import { seed } from "./core/seed.js";

let ready: Promise<void> | null = null;

/** Migrate + seed once per process; a failed attempt is retried on the next request. */
function boot(): Promise<void> {
  if (process.env.VERCEL && !process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    return Promise.reject(new Error("DATABASE_URL (or POSTGRES_URL) is not set in the Vercel project environment"));
  }
  ready ??= migrate()
    .then(seed)
    .catch((err) => {
      ready = null;
      throw err;
    });
  return ready;
}

const bootFailed: ErrorRequestHandler = (err, req, res, _next) => {
  console.error("API boot failed:", err);
  res.status(503).json({
    error: langOf(req) === "ky" ? "Сервер иштеген жок, бир аздан кийин кайра аракет кылыңыз" : "Сервер не запустился, попробуйте чуть позже",
  });
};

// Vercel runs the default export as a function: boot lazily so a DB outage returns 503 instead of crashing the instance.
const server = express();
server.use(["/api", "/health"], async (_req, _res, next) => {
  await boot();
  next();
});
server.use(["/api", "/health"], bootFailed);
server.use(app);

if (!process.env.VERCEL) {
  await boot();
  app.listen(config.port, () => {
    console.log(`Mir API → http://localhost:${config.port}/api/v1`);
  });
}

export default server;
