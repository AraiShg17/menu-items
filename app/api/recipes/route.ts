import { NextRequest, NextResponse } from "next/server";
import {
  CreateRecipeRequest,
  CreateRecipeResponse,
  ListRecipesResponse,
  Recipe,
} from "@/lib/types";
import { ensureStorage, readAllRecipes, writeAllRecipes } from "@/lib/storage";
import { generateThumbnailSvg } from "@/lib/thumbnail";

export const runtime = "nodejs";

export async function GET() {
  await ensureStorage();
  const recipes = await readAllRecipes();
  const res: ListRecipesResponse = { recipes };
  return NextResponse.json(res, { status: 200 });
}

export async function PUT(req: NextRequest) {
  await ensureStorage();
  const body = await req.json();
  const { id, title, details, imageUrl } = body;

  if (!id || !title?.trim() || !details?.trim()) {
    return NextResponse.json(
      { error: "id, title and details are required" },
      { status: 400 }
    );
  }

  const recipes = await readAllRecipes();
  const recipeIndex = recipes.findIndex((r) => r.id === id);

  if (recipeIndex === -1) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  // レシピを更新
  recipes[recipeIndex].title = title.trim();
  recipes[recipeIndex].details = details.trim();

  // 画像URLが提供されている場合は更新
  if (imageUrl) {
    recipes[recipeIndex].thumbnailPath = imageUrl;
  }

  await writeAllRecipes(recipes);

  return NextResponse.json({ recipe: recipes[recipeIndex] }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  await ensureStorage();
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const recipes = await readAllRecipes();
  const recipeIndex = recipes.findIndex((r) => r.id === id);

  if (recipeIndex === -1) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  // レシピを削除
  const deletedRecipe = recipes.splice(recipeIndex, 1)[0];
  await writeAllRecipes(recipes);

  return NextResponse.json({ recipe: deletedRecipe }, { status: 200 });
}

export async function POST(req: NextRequest) {
  await ensureStorage();
  const body = (await req.json()) as CreateRecipeRequest;
  const title = (body.title ?? "").trim();
  const details = (body.details ?? "").trim();
  const imageUrl = body.imageUrl;

  if (!title || !details) {
    return NextResponse.json(
      { error: "title and details are required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const recipeId = crypto.randomUUID();

  // アップロードされた画像がある場合はそれを使用、なければSVGサムネイルを生成
  let thumbnailPath: string;
  if (imageUrl) {
    thumbnailPath = imageUrl;
  } else {
    const { svgDataUrl } = generateThumbnailSvg(title, details);
    thumbnailPath = svgDataUrl;
  }

  const newRecipe: Recipe = {
    id: recipeId,
    title,
    details,
    thumbnailPath,
    createdAt: now,
  };

  const recipes = await readAllRecipes();
  recipes.unshift(newRecipe);
  await writeAllRecipes(recipes);

  const res: CreateRecipeResponse = { recipe: newRecipe };
  return NextResponse.json(res, { status: 201 });
}
