import fs from "node:fs/promises";
import path from "node:path";
import { Recipe } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "recipes.json");
const THUMB_DIR = path.join(process.cwd(), "public", "thumbnails");

export async function ensureStorage(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(THUMB_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(
      DB_FILE,
      JSON.stringify({ recipes: [] }, null, 2),
      "utf8"
    );
  }
}

export async function readAllRecipes(): Promise<Recipe[]> {
  await ensureStorage();
  const raw = await fs.readFile(DB_FILE, "utf8");
  const parsed = JSON.parse(raw) as { recipes: Recipe[] };
  return parsed.recipes ?? [];
}

export async function writeAllRecipes(recipes: Recipe[]): Promise<void> {
  await ensureStorage();
  const payload = { recipes };
  await fs.writeFile(DB_FILE, JSON.stringify(payload, null, 2), "utf8");
}

export function thumbnailFsPath(filename: string): string {
  return path.join(THUMB_DIR, filename);
}

export function thumbnailPublicPath(filename: string): string {
  return path.posix.join("/thumbnails", filename);
}
