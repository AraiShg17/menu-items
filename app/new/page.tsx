"use client";
import { useState, useRef } from "react";
import styles from "./page.module.css";

export default function NewRecipePage() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!title.trim() || !details.trim()) {
      setMessage({ type: "error", text: "タイトルと詳細は必須です" });
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = null;

      // 画像がアップロードされている場合は先にアップロード
      if (imageFile) {
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
        imageUrl = uploadResult.url;
      }

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, details, imageUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "登録に失敗しました");
      }
      setTitle("");
      setDetails("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage({
        type: "success",
        text: "登録しました！一覧で確認できます。",
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "エラーが発生しました",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <section className="section">
        <div className="sectionInner">
          <div className={styles.nav}>
            <a href="/" className={styles.backBtn}>
              ← 戻る
            </a>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="レシピのタイトル"
                required
              />
            </div>

            <div className={styles.field}>
              <textarea
                className={styles.textarea}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="材料や手順を記載してください"
                required
              />
            </div>

            <div className={styles.field}>
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
                  {imagePreview ? "画像を変更" : "画像を選択"}
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
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.button}
                type="submit"
                disabled={submitting}
              >
                {submitting ? "送信中…" : "登録する"}
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
          </form>
        </div>
      </section>
    </div>
  );
}
