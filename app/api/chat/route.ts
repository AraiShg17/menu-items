import { NextRequest, NextResponse } from "next/server";
import { tryGenerateRecipeDraft, tryProposeDishTitles } from "@/lib/ai";
import { generateThumbnailSvg } from "@/lib/thumbnail";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { prompt, action, dish } = (await req.json().catch(() => ({}))) as {
    prompt?: string;
    action?: "propose" | "draft";
    dish?: string;
  };

  console.log(
    `[chat] Request: prompt="${prompt}", action="${action}", dish="${dish}"`
  );

  // actionが"draft"でdishが指定されている場合は、dishをpromptとして使用
  const effectivePrompt =
    action === "draft" && dish && dish.trim() ? dish.trim() : prompt;

  if (!effectivePrompt || !effectivePrompt.trim()) {
    console.log(
      `[chat] Error: prompt is required but got: prompt="${prompt}", dish="${dish}"`
    );
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  const hasKey = Boolean(
    process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY
  );
  console.log(`[chat] OPENAI_API_KEY(any) ${hasKey ? "present" : "missing"}`);
  if (action === "propose") {
    const dishes = await tryProposeDishTitles(effectivePrompt);

    // SVGサムネイルを生成（高速レスポンス、後でAI画像に差し替え）
    const thumbs = dishes.map((title) => {
      const { svgDataUrl } = generateThumbnailSvg(title, effectivePrompt);
      return { title, thumbnailPath: svgDataUrl };
    });

    return NextResponse.json({
      dishes: thumbs,
      source: hasKey ? "openai" : "fallback",
    });
  }
  const target = dish && dish.trim() ? `${dish} のレシピ` : effectivePrompt;
  console.log(`[chat] Generating draft for target: "${target}"`);

  try {
    const draft = await tryGenerateRecipeDraft(target);
    if (!draft) {
      console.log(
        `[chat] Error: failed to generate draft for target: "${target}"`
      );
      return NextResponse.json(
        { error: "failed to generate" },
        { status: 500 }
      );
    }
    console.log(`[chat] Successfully generated draft: title="${draft.title}"`);
    return NextResponse.json({ draft, source: hasKey ? "openai" : "fallback" });
  } catch (error) {
    console.error(`[chat] Error generating draft:`, error);
    return NextResponse.json({ error: "failed to generate" }, { status: 500 });
  }
}
