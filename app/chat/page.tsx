"use client";
import { useState } from "react";
import BackButton from "../../components/BackButton";
import styles from "./page.module.css";

export default function ChatRecipePage() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [dishes, setDishes] = useState<
    Array<{ title: string; thumbnailPath: string }>
  >([]);

  async function handleGenerate() {
    setMsg(null);
    setLoading(true);
    try {
      // 空の場合は季節や気温を考慮したプロンプトを生成
      const finalPrompt = prompt.trim() || (await generateSeasonalPrompt());

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, action: "propose" }),
      });
      if (!res.ok) throw new Error("生成に失敗しました");
      const data = await res.json();
      setDishes(data?.dishes || []);
    } catch (e: any) {
      setMsg(e?.message || "エラー");
    } finally {
      setLoading(false);
    }
  }

  async function generateSeasonalPrompt(): Promise<string> {
    const now = new Date();
    const month = now.getMonth() + 1; // 0-11 → 1-12
    const hour = now.getHours();

    // 季節判定
    let season = "";
    if (month >= 3 && month <= 5) season = "春";
    else if (month >= 6 && month <= 8) season = "夏";
    else if (month >= 9 && month <= 11) season = "秋";
    else season = "冬";

    // 時間帯判定
    let timeOfDay = "";
    if (hour >= 5 && hour < 11) timeOfDay = "朝食";
    else if (hour >= 11 && hour < 15) timeOfDay = "昼食";
    else if (hour >= 15 && hour < 18) timeOfDay = "おやつ";
    else timeOfDay = "夕食";

    // 気温の推定（簡易版）
    let temperature = "";
    if (month >= 6 && month <= 8) temperature = "暑い季節";
    else if (month >= 12 || month <= 2) temperature = "寒い季節";
    else temperature = "過ごしやすい季節";

    return `${season}の${temperature}にぴったりの${timeOfDay}メニューを提案してください。季節の食材や体調を考慮した料理でお願いします。`;
  }

  async function handlePick(dish: string) {
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, action: "draft", dish }),
      });
      if (!res.ok) throw new Error("詳細生成に失敗しました");
      const data = await res.json();
      setTitle(data?.draft?.title || "");
      setDetails(data?.draft?.details || "");
    } catch (e: any) {
      setMsg(e?.message || "エラー");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit() {
    if (!instruction.trim()) return;

    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch("/api/recipes/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: "temp", // 一時的なID
          instruction: instruction.trim(),
          currentTitle: title,
          currentDetails: details,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "修正に失敗しました");
      }

      const data = await res.json();
      setTitle(data.recipe.title);
      setDetails(data.recipe.details);
      setInstruction("");
      setMsg("レシピを修正しました！");
    } catch (error: any) {
      setMsg(error?.message || "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave() {
    setMsg(null);
    if (!title.trim() || !details.trim()) {
      setMsg("タイトルと詳細は必須です");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, details }),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setMsg("保存しました！ギャラリーで確認できます。");
    } catch (e: any) {
      setMsg(e?.message || "エラー");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <section className="section">
        <div className="sectionInner">
          <BackButton />

          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="料理のリクエストを入力（空でもOK！季節に合わせて提案します）"
            />
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "生成中…" : "送信"}
            </button>
          </div>

          {loading && dishes.length === 0 && (
            <div className={styles.loadingSection}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>料理を考えています...</p>
            </div>
          )}

          {dishes.length > 0 && (
            <div className={styles.dishGrid}>
              {dishes.map((d) => (
                <button
                  key={d.title}
                  className={styles.dishCard}
                  onClick={() => handlePick(d.title)}
                  disabled={loading}
                >
                  <img
                    src={d.thumbnailPath}
                    alt={d.title}
                    className={styles.dishImage}
                  />
                </button>
              ))}
            </div>
          )}

          {loading && title && details && (
            <div className={styles.loadingSection}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>レシピを生成しています...</p>
            </div>
          )}

          {submitting && title && details && (
            <div className={styles.loadingSection}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>レシピを修正しています...</p>
            </div>
          )}

          {title && details && !loading && !submitting && (
            <div className={styles.recipeSection}>
              <div className={styles.recipeContent}>
                <pre className={styles.recipeText}>{details}</pre>
              </div>

              <div className={styles.editRow}>
                <input
                  className={styles.editInput}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (!submitting && instruction.trim()) {
                        handleEdit();
                      }
                    }
                  }}
                  placeholder="レシピを修正したい場合は指示を入力..."
                />
                <button
                  className={styles.editBtn}
                  onClick={handleEdit}
                  disabled={submitting || !instruction.trim()}
                >
                  {submitting ? "修正中..." : "修正"}
                </button>
              </div>

              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "保存中…" : "保存する"}
              </button>
            </div>
          )}

          {msg && <div className={styles.message}>{msg}</div>}
        </div>
      </section>
    </div>
  );
}
