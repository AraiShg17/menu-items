import OpenAI from "openai";

export type AiImageResult = {
  contentType: string;
  bytes: Buffer;
};

function getClient(): OpenAI | null {
  const apiKey = process.env.OPEN_AI_API_KEY;
  console.log(`[AI] API Key available: ${apiKey ? "YES" : "NO"}`);
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function tryGenerateThumbnailWithAI(
  prompt: string
): Promise<AiImageResult | null> {
  // 画像生成を無効化（コスト削減のため）
  console.log("[ai] Image generation disabled to save costs");
  return null;

  // 以下は無効化されたコード
  /*
  const client = getClient();
  if (!client) return null;
  try {
    // Using "gpt-image-1" for simple thumbnail-like generation
    const res = await client.images.generate({
      model: "gpt-image-1",
      size: "1536x1024",
      prompt,
    });
    const b64 = res.data?.[0]?.b64_json;
    if (!b64) return null;
    return { contentType: "image/png", bytes: Buffer.from(b64, "base64") };
  } catch (e: any) {
    if (e?.status === 429) {
      console.log("[ai] Rate limit reached, will retry later");
    } else if (e?.status === 403) {
      console.log("[ai] Organization verification required");
    } else {
      console.error("[ai] image generation failed:", e?.message || e);
    }
    return null;
  }
  */
}

export async function tryGenerateRecipeDraft(
  userPrompt: string
): Promise<{ title: string; details: string; source?: string } | null> {
  const client = getClient();
  console.log(
    `[AI] tryGenerateRecipeDraft called with prompt: "${userPrompt}"`
  );
  console.log(`[AI] OpenAI client available: ${client ? "YES" : "NO"}`);

  if (!client) {
    console.log(`[AI] No OpenAI client, using local fallback`);
    return draftFromPromptLocally(userPrompt);
  }
  try {
    console.log(`[AI] Calling OpenAI API for recipe generation`);
    const system = `あなたは家庭料理のレシピ作成アシスタントです。日本語で厳密なフォーマットに従って、詳細で間違いのないレシピを出力してください。

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

禁止: Markdownのコードブロック、箇条書きの *、不要な英語、余計な説明。
`;
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `要望: ${userPrompt}\n想定人数: 2人分\n制約: 家庭にある調味料で再現可能。\n\n重要: 分量、時間、温度、火加減を具体的に記載し、初心者でも失敗しないよう丁寧に説明してください。`,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });
    const text = res.choices?.[0]?.message?.content?.trim() || "";
    console.log(`[AI] OpenAI response length: ${text.length}`);
    if (!text) {
      console.log(`[AI] Empty response from OpenAI, using local fallback`);
      return draftFromPromptLocally(userPrompt);
    }
    const lines = text.split(/\r?\n/).filter(Boolean);
    const title = lines[0]?.replace(/^タイトル[:：]\s*/, "") || "新規レシピ";
    const details = lines.slice(1).join("\n").trim() || text;
    console.log(`[AI] Generated recipe title: "${title}"`);
    return { title, details, source: "openai" };
  } catch (error) {
    console.error(`[AI] OpenAI API error:`, error);
    return draftFromPromptLocally(userPrompt);
  }
}

export async function tryProposeDishTitles(
  userPrompt: string
): Promise<string[]> {
  const client = getClient();
  if (!client) {
    return proposeLocally(userPrompt);
  }
  try {
    const system = `あなたは献立プランナーです。日本語で料理名のみを1行ずつ、5案出してください。余計な説明や番号は不要。`;
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `条件: ${userPrompt}\n制約: 家庭で作りやすい一般的な料理名。`,
        },
      ],
      temperature: 0.6,
      max_tokens: 200,
    });
    const text = res.choices?.[0]?.message?.content?.trim() || "";
    if (!text) return proposeLocally(userPrompt);
    const lines = text
      .split(/\r?\n/)
      .map((s) => s.replace(/^[-*\d).\s]+/, "").trim())
      .filter(Boolean);
    return Array.from(new Set(lines)).slice(0, 6);
  } catch {
    return proposeLocally(userPrompt);
  }
}

function draftFromPromptLocally(prompt: string): {
  title: string;
  details: string;
  source: string;
} {
  const baseTitle =
    prompt.replace(/\s+/g, " ").trim().slice(0, 30) || "かんたんレシピ";
  const title = baseTitle;
  const ingredients = [
    "材料",
    "- 塩 小さじ1/2",
    "- 胡椒 少々",
    "- オリーブオイル 大さじ1",
    "- にんにく 1片",
    "- 玉ねぎ 1/2個",
  ];
  const steps = [
    "手順",
    "1) フライパンを中火で2分間熱する",
    "2) オリーブオイルを加え、にんにくを香りが出るまで30秒炒める",
    "3) 玉ねぎを加えて中火で3分間炒める",
    "4) 塩、胡椒で味を整えて盛り付け",
  ];
  const time = ["調理時間", "準備5分、調理6分、合計11分"];
  const details = `${ingredients.join("\n")}\n\n${steps.join(
    "\n"
  )}\n\n${time.join("\n")}`;
  return { title, details, source: "fallback" };
}

function proposeLocally(prompt: string): string[] {
  const base = [
    "和風オムレツ",
    "じゃがいもガレット",
    "オニオンスープ",
    "スペイン風オムレツ",
    "ポテトサラダ",
  ];
  return base;
}
