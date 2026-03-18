import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

function getClient(): OpenAI | null {
  const apiKey = process.env.OPEN_AI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Images are required" },
        { status: 400 }
      );
    }

    const client = getClient();
    if (!client) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    console.log(`[Image Extract] Processing ${images.length} images`);

    // 画像をbase64形式に変換（既にbase64の場合はそのまま使用）
    const imageContents = images.map((image: string) => {
      // data:image/jpeg;base64, の形式でない場合は追加
      if (image.startsWith("data:")) {
        return image;
      }
      return `data:image/jpeg;base64,${image}`;
    });

    const systemPrompt = `あなたは料理写真の専門家です。提供された料理の画像を分析して、詳細なレシピを作成してください。

出力要件（必ず順守）:
1) 1行目に「タイトル: ◯◯」の形式で短い和文タイトル
2) 空行を1行
3) 見出し「材料」
4) 5〜10個の材料行（「- 材料名 分量」の形式、行頭にハイフン）
   - 分量は具体的に記載（例：大さじ2、小さじ1、1/2個、200g、300ml等）
   - 調味料も正確な分量を記載
5) 空行を1行
6) 見出し「手順」
7) 4〜8個の手順行（「1) 〜」の番号付き）
   - 各手順に具体的な時間を記載（例：2分間、中火で5分、弱火で10分等）
   - 火加減を明確に記載（強火、中火、弱火）
   - 温度がある場合は具体的な温度を記載（例：180℃、沸騰するまで等）
   - 調理のポイントや注意点も含める
8) 空行を1行
9) 見出し「調理時間」
10) 準備時間と調理時間を分けて記載（例：準備15分、調理20分、合計35分）

画像から判断できる材料や調理方法を基に、実用的で再現可能なレシピを作成してください。
推測が必要な部分は「お好みで」や「適量」と記載してください。

料理が認識できない場合は「料理画像を認識できませんでした」と簡潔に返してください。

禁止: Markdownのコードブロック、箇条書きの *、不要な英語、余計な説明。`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "これらの料理画像を分析して、詳細なレシピを作成してください。画像に写っている料理の材料、調理方法、手順を具体的に記載してください。",
          },
          ...imageContents.map((image: string) => ({
            type: "image_url",
            image_url: {
              url: image,
              detail: "high",
            },
          })),
        ],
      },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const text = response.choices?.[0]?.message?.content?.trim() || "";

    if (!text) {
      return NextResponse.json(
        { error: "Failed to extract recipe from images" },
        { status: 500 }
      );
    }

    console.log(`[Image Extract] Successfully extracted recipe`);

    // レスポンスを解析
    const lines = text.split(/\r?\n/).filter(Boolean);
    const title =
      lines[0]?.replace(/^タイトル[:：]\s*/, "") || "画像から抽出したレシピ";
    const details = lines.slice(1).join("\n").trim() || text;

    return NextResponse.json({
      recipe: {
        title,
        details,
        source: "image-extraction",
      },
    });
  } catch (error) {
    console.error("[Image Extract] Error:", error);
    return NextResponse.json(
      { error: "Failed to extract recipe from images" },
      { status: 500 }
    );
  }
}
