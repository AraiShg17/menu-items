import React, { useState, useRef } from "react";
import ImageModal from "./ImageModal";
import { useToast } from "./ToastContainer";
import styles from "./ReferenceImageGallery.module.css";

interface ReferenceImageGalleryProps {
  recipeId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const MAX_REFERENCE_IMAGES = 10;

export default function ReferenceImageGallery({
  recipeId,
  images,
  onImagesChange,
}: ReferenceImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 枚数制限チェック
    const currentCount = images.length;
    const newFilesCount = files.length;

    if (currentCount + newFilesCount > MAX_REFERENCE_IMAGES) {
      showToast(
        `参考画像は最大${MAX_REFERENCE_IMAGES}枚までです。現在${currentCount}枚、追加可能な枚数は${
          MAX_REFERENCE_IMAGES - currentCount
        }枚です。`,
        "error"
      );
      return;
    }

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const uploadedUrls: string[] = [];

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

      // 複数画像を一括でアップロード
      const response = await fetch(
        `/api/recipes/${recipeId}/reference-images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrls: uploadedUrls }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "画像のアップロードに失敗しました");
      }

      const data = await response.json();
      onImagesChange(data.recipe.referenceImages || []);
      showToast(
        `${uploadedUrls.length}枚の参考画像を追加しました！`,
        "success"
      );
    } catch (error: any) {
      showToast(error.message || "エラーが発生しました", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageRemove = async (imageIndex: number) => {
    setRemoving(imageIndex);
    try {
      const response = await fetch(
        `/api/recipes/${recipeId}/reference-images`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageIndex }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "画像の削除に失敗しました");
      }

      const data = await response.json();
      onImagesChange(data.recipe.referenceImages || []);
      showToast("参考画像を削除しました", "success");
    } catch (error: any) {
      showToast(error.message || "エラーが発生しました", "error");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          参考画像 ({images.length}/{MAX_REFERENCE_IMAGES})
        </h3>
        <button
          className={styles.addBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= MAX_REFERENCE_IMAGES}
        >
          {uploading ? "アップロード中..." : "画像を追加"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className={styles.fileInput}
      />

      {images.length > 0 ? (
        <div className={styles.imageGrid}>
          {images.map((image, index) => (
            <div key={index} className={styles.imageItem}>
              <img
                src={image}
                alt={`参考画像 ${index + 1}`}
                className={styles.thumbnail}
                onClick={() => setSelectedImage(image)}
              />
              <button
                className={styles.removeBtn}
                onClick={() => handleImageRemove(index)}
                disabled={removing === index}
              >
                {removing === index ? (
                  <div className={styles.loadingSpinner}></div>
                ) : (
                  "✕"
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>参考画像がありません</p>
          <p className={styles.emptyDesc}>
            「画像を追加」ボタンから参考画像を追加できます（最大
            {MAX_REFERENCE_IMAGES}枚）
          </p>
        </div>
      )}

      <ImageModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
        title="参考画像"
      />
    </div>
  );
}
