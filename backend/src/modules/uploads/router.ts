import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import express, { Router } from "express";
import { z } from "zod";
import { allow } from "../../core/auth.js";
import { config } from "../../core/config.js";
import { invalid, zmsg } from "../../core/http.js";
import { msg } from "../../core/i18n.js";

export const uploadsRouter = Router();

/** Stored images are either our own `/uploads/...` paths or absolute https URLs. */
export const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^\/uploads\/[a-z0-9/_.-]+$/i.test(v) || /^https:\/\/\S+$/i.test(v), zmsg("Неверный адрес изображения", "Сүрөттүн дареги туура эмес"));

const TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  "image/png": { ext: "png", magic: (b) => b.subarray(0, 4).toString("hex") === "89504e47" },
  "image/webp": { ext: "webp", magic: (b) => b.subarray(8, 12).toString("ascii") === "WEBP" },
  "image/avif": { ext: "avif", magic: (b) => b.subarray(4, 12).toString("ascii").startsWith("ftypavi") },
};

uploadsRouter.post(
  "/",
  allow("manager"),
  express.raw({ type: Object.keys(TYPES), limit: "6mb" }),
  async (req, res) => {
    const type = TYPES[String(req.headers["content-type"]).split(";")[0].trim()];
    const body = req.body as Buffer;
    if (!type || !Buffer.isBuffer(body) || body.length === 0) throw invalid(msg("Загружайте только JPG, PNG, WEBP или AVIF", "JPG, PNG, WEBP же AVIF гана жүктөңүз"));
    if (!type.magic(body)) throw invalid(msg("Файл не является изображением или повреждён", "Файл сүрөт эмес же бузулган"));
    const month = new Date().toISOString().slice(0, 7);
    const name = `${crypto.randomBytes(12).toString("hex")}.${type.ext}`;
    if (config.blobToken) {
      const blob = await put(`uploads/${month}/${name}`, body, {
        access: "public",
        contentType: String(req.headers["content-type"]).split(";")[0].trim(),
        addRandomSuffix: false,
        token: config.blobToken,
      });
      res.status(201).json({ url: blob.url });
      return;
    }
    const dir = path.join(config.uploadDir, month);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), body);
    res.status(201).json({ url: `/uploads/${month}/${name}` });
  },
);
