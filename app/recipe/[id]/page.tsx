"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import BackButton from "../../../components/BackButton";
import ReferenceImageGallery from "../../../components/ReferenceImageGallery";
import styles from "./page.module.css";

type Recipe = {
  id: string;
  title: string;
  details: string;
  thumbnailPath: string;
  referenceImages?: string[];
  createdAt: string;
};

type ParsedRecipe = {
  ingredients: string[];
  steps: string[];
};

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [instruction, setInstruction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDetails, setManualDetails] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  async function fetchRecipe() {
    try {
      const res = await fetch("/api/recipes");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error("Invalid data format");
      }
      const foundRecipe = data.recipes.find((r: Recipe) => r.id === recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
        setReferenceImages(foundRecipe.referenceImages || []);
      } else {
        setMessage({ type: "error", text: "レシピが見つかりません" });
      }
    } catch (error) {
      console.error("Recipe fetch error:", error);
      setMessage({ type: "error", text: "レシピの取得に失敗しました" });
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // プレビュー用のURLを生成
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImageUpload() {
    if (!imageFile) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => ({}));
        throw new Error(
          uploadData?.error || "画像のアップロードに失敗しました"
        );
      }

      const uploadResult = await uploadRes.json();

      // レシピの画像を更新
      const updateRes = await fetch("/api/recipes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recipeId,
          title: recipe?.title,
          details: recipe?.details,
          imageUrl: uploadResult.url,
        }),
      });

      if (!updateRes.ok) {
        const updateData = await updateRes.json().catch(() => ({}));
        throw new Error(updateData?.error || "レシピの更新に失敗しました");
      }

      const updateResult = await updateRes.json();
      setRecipe(updateResult.recipe);
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage({
        type: "success",
        text: "画像を更新しました！",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "エラーが発生しました",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleEdit() {
    if (!instruction.trim()) {
      setMessage({ type: "error", text: "修正指示を入力してください" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/recipes/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          instruction: instruction.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "修正に失敗しました");
      }

      const data = await res.json();
      setRecipe(data.recipe);
      setInstruction("");
      setMessage({
        type: "success",
        text: "レシピを修正しました！",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "エラーが発生しました",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function startManualEdit() {
    if (!recipe) return;
    setManualTitle(recipe.title);
    setManualDetails(recipe.details);
    setMessage(null);
    setIsManualEditing(true);
  }

  function cancelManualEdit() {
    setIsManualEditing(false);
    if (!recipe) return;
    setManualTitle(recipe.title);
    setManualDetails(recipe.details);
  }

  async function handleManualSave() {
    if (!recipe) return;
    if (!manualTitle.trim() || !manualDetails.trim()) {
      setMessage({ type: "error", text: "タイトルと詳細は必須です" });
      return;
    }

    setManualSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/recipes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: recipeId,
          title: manualTitle.trim(),
          details: manualDetails.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "手動編集の保存に失敗しました");
      }

      const data = await res.json();
      setRecipe(data.recipe);
      setIsManualEditing(false);
      setMessage({ type: "success", text: "手動編集を保存しました！" });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "エラーが発生しました",
      });
    } finally {
      setManualSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("このレシピを削除しますか？")) return;

    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/recipes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recipeId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "削除に失敗しました");
      }

      // 削除成功後、ギャラリーページにリダイレクト
      window.location.href = "/gallery";
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "エラーが発生しました",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <section className="section">
          <div className="sectionInner">
            <div className={styles.skeletonContainer}>
              <div className={styles.skeletonNav}>
                <div className={styles.skeletonButton}></div>
                <div className={styles.skeletonButton}></div>
              </div>

              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonTitle}></div>
              </div>

              <div className={styles.skeletonContent}>
                <div className={styles.skeletonDetails}>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonTextShort}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container">
        <section className="section">
          <div className="sectionInner">
            <div className={styles.error}>レシピが見つかりません</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container">
      <section className="section">
        <div className="sectionInner">
          <BackButton>
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "削除中..." : "削除"}
            </button>
          </BackButton>

          <header className={styles.header}>
            {isManualEditing ? (
              <input
                className={styles.manualTitleInput}
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="レシピタイトル"
                maxLength={120}
              />
            ) : (
              <h1 className={styles.title}>{recipe.title}</h1>
            )}
          </header>

          <div className={styles.content}>
            <div
              className={styles.detailsSection}
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 200px), url(${recipe.thumbnailPath})`,
              }}
            >
              <div className={styles.imageUpload}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className={styles.fileLabel}>
                  📷 画像を変更
                </label>
                {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="プレビュー" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className={styles.removeImage}
                    >
                      ×
                    </button>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className={styles.uploadBtn}
                      disabled={uploading}
                    >
                      {uploading ? "アップロード中..." : "画像を更新"}
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.details}>
                {isManualEditing ? (
                  <textarea
                    className={styles.manualDetailsInput}
                    value={manualDetails}
                    onChange={(e) => setManualDetails(e.target.value)}
                    rows={16}
                    placeholder="レシピ詳細"
                  />
                ) : (
                  <pre className={styles.detailsText}>{recipe.details}</pre>
                )}
              </div>

              <div className={styles.manualEditSection}>
                {!isManualEditing ? (
                  <button className={styles.editBtn} onClick={startManualEdit}>
                    手動で編集する
                  </button>
                ) : (
                  <div className={styles.manualEditActions}>
                    <button
                      className={styles.saveBtn}
                      onClick={handleManualSave}
                      disabled={manualSaving}
                    >
                      {manualSaving ? "保存中..." : "手動編集を保存"}
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={cancelManualEdit}
                      disabled={manualSaving}
                    >
                      キャンセル
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.editSection}>
                <textarea
                  className={styles.instructionInput}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      if (!submitting && instruction.trim()) {
                        handleEdit();
                      }
                    }
                  }}
                  placeholder="AIでレシピを修正 - 自然言語で修正指示を入力してください（例: もっと辛くして、野菜を増やしてください）"
                  rows={3}
                />
                <button
                  className={styles.submitBtn}
                  onClick={handleEdit}
                  disabled={submitting || !instruction.trim()}
                >
                  {submitting ? "修正中..." : "AIで修正する"}
                </button>
              </div>

              {message && (
                <div
                  className={
                    message.type === "error" ? styles.error : styles.success
                  }
                >
                  {message.text}
                </div>
              )}
            </div>

            <ReferenceImageGallery
              recipeId={recipeId}
              images={referenceImages}
              onImagesChange={setReferenceImages}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
