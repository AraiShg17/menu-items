import { NextRequest, NextResponse } from "next/server";
import {
  CreateRecipeRequest,
  CreateRecipeResponse,
  ListRecipesResponse,
  Recipe,
} from "@/lib/types";
import {
  ensureStorage,
  readAllRecipes,
  writeAllRecipes,
  deleteRecipe,
  updateRecipe,
} from "@/lib/storage";
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
  const updatedRecipe = {
    ...recipes[recipeIndex],
    title: title.trim(),
    details: details.trim(),
  };

  // 画像URLが提供されている場合は更新
  if (imageUrl) {
    updatedRecipe.thumbnailPath = imageUrl;
  }

  await updateRecipe(updatedRecipe);

  return NextResponse.json({ recipe: updatedRecipe }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  await ensureStorage();
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // レシピが存在するか確認
  const recipes = await readAllRecipes();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  // Firestoreからレシピを削除
  await deleteRecipe(id);

  return NextResponse.json({ recipe }, { status: 200 });
}

export async function POST(req: NextRequest) {
  await ensureStorage();
  const body = (await req.json()) as CreateRecipeRequest;
  const title = (body.title ?? "").trim();
  const details = (body.details ?? "").trim();
  const imageUrl = body.imageUrl;
  const referenceImages = (body as any).referenceImages;

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
    referenceImages: referenceImages || [],
    createdAt: now,
  };

  const recipes = await readAllRecipes();
  recipes.unshift(newRecipe);
  await writeAllRecipes(recipes);

  const res: CreateRecipeResponse = { recipe: newRecipe };
  return NextResponse.json(res, { status: 201 });
}
