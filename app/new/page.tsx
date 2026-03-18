"use client";
import { useState, useRef } from "react";
import BackButton from "../../components/BackButton";
import ReferenceImageGallery from "../../components/ReferenceImageGallery";
import styles from "./page.module.css";

const MAX_REFERENCE_IMAGES = 10;

export default function NewRecipePage() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceImageInputRef = useRef<HTMLInputElement>(null);

  async function handleReferenceImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 枚数制限チェック
    const currentCount = referenceImages.length;
    const newFilesCount = files.length;

    if (currentCount + newFilesCount > MAX_REFERENCE_IMAGES) {
      setMessage({
        type: "error",
        text: `参考画像は最大${MAX_REFERENCE_IMAGES}枚までです。現在${currentCount}枚、追加可能な枚数は${
          MAX_REFERENCE_IMAGES - currentCount
        }枚です。`,
      });
      return;
    }

    const fileArray = Array.from(files);
    const uploadedUrls: string[] = [];

    try {
      // 各ファイルをCloud Storageにアップロード
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("image", file);

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
        uploadedUrls.push(uploadResult.url);
      }

      setReferenceImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("参考画像のアップロードエラー:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "画像のアップロードに失敗しました",
      });
    } finally {
      if (referenceImageInputRef.current) {
        referenceImageInputRef.current.value = "";
      }
    }
  }

  function removeReferenceImage(index: number) {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
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
        body: JSON.stringify({
          title,
          details,
          imageUrl,
          referenceImages:
            referenceImages.length > 0 ? referenceImages : undefined,
        }),
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
          <BackButton />
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>
                レシピのタイトル<span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="レシピのタイトル"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                材料・手順<span className={styles.required}>*</span>
              </label>
              <textarea
                className={styles.textarea}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="材料や手順を記載してください"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>サムネイル画像</label>
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
                  {imagePreview
                    ? "サムネイル画像を変更"
                    : "サムネイル画像を選択"}
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

            <div className={styles.referenceImagesSection}>
              <h3 className={styles.sectionTitle}>
                参考画像 ({referenceImages.length}/{MAX_REFERENCE_IMAGES})
              </h3>
              <div className={styles.imageUploadArea}>
                <input
                  ref={referenceImageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReferenceImageChange}
                  className={styles.fileInput}
                  id="reference-images-upload"
                />
                <label
                  htmlFor="reference-images-upload"
                  className={styles.referenceFileLabel}
                  style={{
                    opacity:
                      referenceImages.length >= MAX_REFERENCE_IMAGES ? 0.5 : 1,
                    cursor:
                      referenceImages.length >= MAX_REFERENCE_IMAGES
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {referenceImages.length >= MAX_REFERENCE_IMAGES
                    ? `最大${MAX_REFERENCE_IMAGES}枚まで`
                    : referenceImages.length > 0
                    ? "参考画像を追加"
                    : "参考画像を選択（複数選択可）"}
                </label>
                {referenceImages.length > 0 && (
                  <div className={styles.referenceImageGrid}>
                    {referenceImages.map((image, index) => (
                      <div key={index} className={styles.referenceImageItem}>
                        <img src={image} alt={`参考画像 ${index + 1}`} />
                        <button
                          onClick={() => removeReferenceImage(index)}
                          className={styles.removeReferenceImage}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
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
