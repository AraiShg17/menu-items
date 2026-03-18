import { NextRequest, NextResponse } from "next/server";
import { ensureStorage, readAllRecipes, updateRecipe } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { imageUrl, imageUrls } = await req.json();
    const recipeId = params.id;

    // 単一画像または複数画像のどちらかが必要
    if (!imageUrl && !imageUrls) {
      return NextResponse.json(
        { error: "Image URL(s) is required" },
        { status: 400 }
      );
    }

    await ensureStorage();
    const recipes = await readAllRecipes();
    const recipeIndex = recipes.findIndex((r) => r.id === recipeId);

    if (recipeIndex === -1) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const recipe = recipes[recipeIndex];
    const currentImages = recipe.referenceImages || [];

    // 複数画像の場合は一括処理
    if (imageUrls && Array.isArray(imageUrls)) {
      console.log(
        `[Reference Images] Adding ${imageUrls.length} images to recipe ${recipeId}`
      );
      console.log(
        `[Reference Images] Current images count: ${currentImages.length}`
      );

      const newImages = imageUrls.filter((url) => !currentImages.includes(url));
      console.log(`[Reference Images] New images count: ${newImages.length}`);

      const updatedRecipe = {
        ...recipe,
        referenceImages: [...currentImages, ...newImages],
      };

      console.log(
        `[Reference Images] Updated recipe referenceImages count: ${updatedRecipe.referenceImages.length}`
      );
      await updateRecipe(updatedRecipe);

      return NextResponse.json({
        recipe: updatedRecipe,
        message: `${newImages.length} reference images added successfully`,
      });
    }

    // 単一画像の処理
    if (currentImages.includes(imageUrl)) {
      return NextResponse.json(
        { error: "Image already exists" },
        { status: 400 }
      );
    }

    const updatedRecipe = {
      ...recipe,
      referenceImages: [...currentImages, imageUrl],
    };

    await updateRecipe(updatedRecipe);

    return NextResponse.json({
      recipe: updatedRecipe,
      message: "Reference image added successfully",
    });
  } catch (error) {
    console.error("Error adding reference image:", error);
    return NextResponse.json(
      { error: "Failed to add reference image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { imageIndex } = await req.json();
    const recipeId = params.id;

    if (typeof imageIndex !== "number" || imageIndex < 0) {
      return NextResponse.json(
        { error: "Valid image index is required" },
        { status: 400 }
      );
    }

    await ensureStorage();
    const recipes = await readAllRecipes();
    const recipeIndex = recipes.findIndex((r) => r.id === recipeId);

    if (recipeIndex === -1) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const recipe = recipes[recipeIndex];
    const currentImages = recipe.referenceImages || [];

    if (imageIndex >= currentImages.length) {
      return NextResponse.json(
        { error: "Image index out of range" },
        { status: 400 }
      );
    }

    const updatedImages = currentImages.filter(
      (_, index) => index !== imageIndex
    );
    const updatedRecipe = {
      ...recipe,
      referenceImages: updatedImages,
    };

    await updateRecipe(updatedRecipe);

    return NextResponse.json({
      recipe: updatedRecipe,
      message: "Reference image removed successfully",
    });
  } catch (error) {
    console.error("Error removing reference image:", error);
    return NextResponse.json(
      { error: "Failed to remove reference image" },
      { status: 500 }
    );
  }
}
