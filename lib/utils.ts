import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeScore(raw: any): number | null {
  if (raw == null) return null;
  let n: number;
  if (typeof raw === "string") {
    const matched = raw.match(/-?\d+(?:\.\d+)?/);
    if (!matched) return null;
    n = Number(matched[0]);
  } else {
    n = Number(raw);
  }
  if (!Number.isFinite(n)) return null;
  if (n <= 1) return Math.round(n * 100);
  if (n <= 10) return Math.round(n * 10);
  return Math.round(n);
}
