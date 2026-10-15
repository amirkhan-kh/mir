import path from "node:path";

const env = process.env;

export const config = {
  port: Number(env.PORT ?? 4010),
  databaseUrl: env.DATABASE_URL ?? "postgres://mir:mir@127.0.0.1:5440/mir",
  jwtSecret: env.JWT_SECRET ?? "dev-only-mir-secret-change-me-in-production",
  corsOrigin: (env.CORS_ORIGIN ?? "http://localhost:3010").split(",").map((s) => s.trim()),
  adminUsername: env.ADMIN_USERNAME ?? "admin",
  adminPassword: env.ADMIN_PASSWORD ?? "admin123",
  seedDemo: (env.SEED_DEMO ?? "true") === "true",
  uploadDir: path.resolve(env.UPLOAD_DIR ?? "uploads"),
  /** Set when a Vercel Blob store is connected; uploads then go to Blob instead of `uploadDir`. */
  blobToken: env.BLOB_READ_WRITE_TOKEN,
  isProd: env.NODE_ENV === "production",
};
