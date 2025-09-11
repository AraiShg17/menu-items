export type ParsedRecipe = {
  title: string;
  ingredients: string[];
  steps: string[];
};

export function parseRecipeText(text: string): ParsedRecipe {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let title = "";
  let ingredients: string[] = [];
  let steps: string[] = [];

  let currentSection: "title" | "ingredients" | "steps" | null = null;

  for (const line of lines) {
    // タイトル行の検出（最初の行、または「タイトル:」で始まる行）
    if (
      currentSection === null &&
      (line.includes("タイトル:") || line.includes("タイトル："))
    ) {
      title = line.replace(/^タイトル[:：]\s*/, "");
      currentSection = "title";
      continue;
    }

    // 材料セクションの検出
    if (line === "材料" || line.includes("材料")) {
      currentSection = "ingredients";
      continue;
    }

    // 手順セクションの検出
    if (line === "手順" || line.includes("手順")) {
      currentSection = "steps";
      continue;
    }

    // セクションに応じてデータを追加
    if (currentSection === "ingredients") {
      // 材料行（- で始まる行）
      if (line.startsWith("- ")) {
        ingredients.push(line.substring(2));
      } else if (line.startsWith("・")) {
        ingredients.push(line.substring(1));
      } else if (line.length > 0 && !line.includes("手順")) {
        ingredients.push(line);
      }
    } else if (currentSection === "steps") {
      // 手順行（数字)で始まる行）
      if (/^\d+\)/.test(line)) {
        steps.push(line);
      } else if (line.length > 0 && !line.includes("材料")) {
        steps.push(line);
      }
    } else if (currentSection === null && title === "") {
      // 最初の行をタイトルとして扱う
      title = line;
    }
  }

  // フォールバック：材料と手順が空の場合、テキストを分割
  if (ingredients.length === 0 && steps.length === 0) {
    const parts = text.split("\n\n");
    if (parts.length >= 2) {
      const ingredientsText = parts[0];
      const stepsText = parts[1];

      ingredients = ingredientsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line !== "材料")
        .map((line) => (line.startsWith("- ") ? line.substring(2) : line));

      steps = stepsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line !== "手順");
    }
  }

  return {
    title: title || "レシピ",
    ingredients:
      ingredients.length > 0 ? ingredients : ["材料が記載されていません"],
    steps: steps.length > 0 ? steps : ["手順が記載されていません"],
  };
}
