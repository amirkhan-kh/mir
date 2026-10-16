import { mkdirSync } from "node:fs";
import { request, type FullConfig } from "@playwright/test";
import { AUTH_DIR, ROLES, loginAs } from "./factories";

/** Waits for the stacks, then stores one session per staff role (backend mode only). */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL!;
  if (process.env.E2E_BACKEND !== "1") return;

  const api = process.env.API_INTERNAL_URL ?? "http://localhost:4010";
  await waitFor(`${api}/health`, 90_000);

  mkdirSync(AUTH_DIR, { recursive: true });
  const ctx = await request.newContext({ baseURL });
  for (const role of ROLES) {
    const session = await request.newContext({ baseURL });
    await loginAs(session, role);
    await session.storageState({ path: `${AUTH_DIR}/${role}.json` });
    await session.dispose();
  }
  await ctx.dispose();
}

async function waitFor(url: string, timeout: number) {
  const until = Date.now() + timeout;
  let last = "";
  while (Date.now() < until) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      last = `HTTP ${res.status}`;
    } catch (e) {
      last = String(e);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`${url} not ready: ${last}`);
}
