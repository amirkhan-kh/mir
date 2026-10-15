import type { Lang } from "./config";
import { ky } from "./ky";
import { ru, type Dict } from "./ru";

export type { Dict };

export const DICTS: Record<Lang, Dict> = { ru, ky };
