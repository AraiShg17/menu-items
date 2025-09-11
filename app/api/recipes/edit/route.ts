import { NextRequest, NextResponse } from "next/server";
import { ensureStorage, readAllRecipes, writeAllRecipes } from "@/lib/storage";
import { tryGenerateRecipeDraft } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  await ensureStorage();
  const body = await req.json();
  const { recipeId, instruction } = body;

  if (!recipeId || !instruction?.trim()) {
    return NextResponse.json(
      { error: "recipeId and instruction are required" },
      { status: 400 }
    );
  }

  // 一時的なレシピの場合は、現在のレシピデータを直接使用
  let currentRecipe;
  if (recipeId === "temp") {
    // 一時的なレシピの場合は、リクエストボディから現在のレシピデータを取得
    const { currentTitle, currentDetails } = body;
    if (!currentTitle || !currentDetails) {
      return NextResponse.json(
        {
          error: "currentTitle and currentDetails are required for temp recipe",
        },
        { status: 400 }
      );
    }
    currentRecipe = { title: currentTitle, details: currentDetails };
  } else {
    const recipes = await readAllRecipes();
    const recipeIndex = recipes.findIndex((r) => r.id === recipeId);

    if (recipeIndex === -1) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    currentRecipe = recipes[recipeIndex];
  }

  try {
    // AIに修正指示を送信
    const prompt = `既存のレシピを修正してください。分量、時間、温度、火加減を具体的に記載し、初心者でも失敗しないよう丁寧に説明してください。

現在のレシピ:
タイトル: ${currentRecipe.title}
詳細: ${currentRecipe.details}

修正指示: ${instruction.trim()}

上記の指示に従って、レシピを修正してください。必ず以下の要素を含めてください：
- 材料の具体的な分量（大さじ、小さじ、g、ml等）
- 各手順の具体的な時間（分、秒）
- 火加減（強火、中火、弱火）
- 温度（℃、沸騰等）
- 調理のポイントや注意点
- 調理時間（準備時間、調理時間、合計時間）`;

    const draft = await tryGenerateRecipeDraft(prompt);

    if (!draft) {
      return NextResponse.json(
        { error: "Failed to generate recipe edit" },
        { status: 500 }
      );
    }

    // 一時的なレシピの場合は更新せずに結果のみ返す
    if (recipeId === "temp") {
      return NextResponse.json(
        {
          recipe: { title: draft.title, details: draft.details },
          source: draft.source || "ai",
        },
        { status: 200 }
      );
    }

    // 既存レシピの場合は更新
    const recipes = await readAllRecipes();
    const recipeIndex = recipes.findIndex((r) => r.id === recipeId);
    if (recipeIndex !== -1) {
      recipes[recipeIndex].title = draft.title;
      recipes[recipeIndex].details = draft.details;
      await writeAllRecipes(recipes);
    }

    return NextResponse.json(
      {
        recipe: { title: draft.title, details: draft.details },
        source: draft.source || "ai",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[edit] Failed to edit recipe:", error);
    return NextResponse.json(
      { error: "Failed to edit recipe" },
      { status: 500 }
    );
  }
}
