"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/ToastContainer";
import BackButton from "../../components/BackButton";
import styles from "./page.module.css";

export default function ExtractRecipePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractedRecipe, setExtractedRecipe] = useState<{
    title: string;
    details: string;
  } | null>(null);
  const [instruction, setInstruction] = useState("");
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 最大5枚まで
    const selectedFiles = files.slice(0, 5);

    selectedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function extractRecipe() {
    if (images.length === 0) {
      showToast("画像を選択してください", "error");
      return;
    }

    setExtracting(true);

    try {
      const res = await fetch("/api/recipes/extract-from-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "レシピの抽出に失敗しました");
      }

      const data = await res.json();

      // 料理が認識されなかった場合のチェック
      if (data.recipe.details.includes("料理画像を認識できませんでした")) {
        showToast(
          "料理画像を認識できませんでした。別の画像をお試しください。",
          "error"
        );
        return;
      }

      setExtractedRecipe(data.recipe);
      showToast("レシピを抽出しました！", "success");
    } catch (error: any) {
      showToast(error?.message || "エラーが発生しました", "error");
    } finally {
      setExtracting(false);
    }
  }

  async function editRecipe() {
    if (!extractedRecipe || !instruction.trim()) {
      showToast("修正指示を入力してください", "error");
      return;
    }

    setEditing(true);

    try {
      const res = await fetch("/api/recipes/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: "temp",
          instruction: instruction.trim(),
          currentTitle: extractedRecipe.title,
          currentDetails: extractedRecipe.details,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "修正に失敗しました");
      }

      const data = await res.json();
      setExtractedRecipe(data.recipe);
      setInstruction("");
      showToast("レシピを修正しました！", "success");
    } catch (error: any) {
      showToast(error?.message || "エラーが発生しました", "error");
    } finally {
      setEditing(false);
    }
  }

  async function saveRecipe() {
    if (!extractedRecipe) return;

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: extractedRecipe.title,
          details: extractedRecipe.details,
        }),
      });

      if (!res.ok) {
        throw new Error("レシピの保存に失敗しました");
      }

      showToast("レシピを保存しました！", "success");
    } catch (error: any) {
      showToast(error?.message || "エラーが発生しました", "error");
    }
  }

  return (
    <div className="container">
      <section className="section">
        <div className="sectionInner">
          <BackButton />

          <h1 className={styles.title}>画像からレシピを抽出</h1>

          <div className={styles.uploadSection}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={styles.uploadBtn}
              disabled={extracting}
            >
              画像を選択（最大5枚）
            </button>
          </div>

          {images.length > 0 && (
            <div className={styles.imagePreview}>
              <h3>選択された画像</h3>
              <div className={styles.imageGrid}>
                {images.map((image, index) => (
                  <div key={index} className={styles.imageItem}>
                    <img src={image} alt={`Upload ${index + 1}`} />
                    <button
                      onClick={() => removeImage(index)}
                      className={styles.removeBtn}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={extractRecipe}
                className={styles.extractBtn}
                disabled={extracting}
              >
                {extracting ? "解析中..." : "レシピを抽出"}
              </button>
            </div>
          )}

          {extractedRecipe && (
            <div className={styles.resultSection}>
              <h3>抽出されたレシピ</h3>
              <div className={styles.recipeContent}>
                <h4>{extractedRecipe.title}</h4>
                <pre className={styles.recipeDetails}>
                  {extractedRecipe.details}
                </pre>
              </div>

              <div className={styles.editSection}>
                <textarea
                  className={styles.instructionInput}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      if (!editing && instruction.trim()) {
                        editRecipe();
                      }
                    }
                  }}
                  placeholder="AIでレシピを修正 - 自然言語で修正指示を入力してください（例: もっと辛くして、野菜を増やしてください）"
                  rows={3}
                />
                <button
                  className={styles.editBtn}
                  onClick={editRecipe}
                  disabled={editing || !instruction.trim()}
                >
                  {editing ? "修正中..." : "AIで修正する"}
                </button>
              </div>

              <div className={styles.actionButtons}>
                <button onClick={saveRecipe} className={styles.saveBtn}>
                  レシピを保存
                </button>
                <button
                  onClick={() => {
                    setExtractedRecipe(null);
                    setImages([]);
                    setInstruction("");
                  }}
                  className={styles.resetBtn}
                >
                  新しい画像を選択
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
