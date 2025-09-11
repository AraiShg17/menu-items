"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Recipe = {
  id: string;
  title: string;
  details: string;
  thumbnailPath: string;
  createdAt: string;
};

export default function GalleryPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((data) => setRecipes(data.recipes || []))
      .catch(() => setRecipes([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) || r.details.toLowerCase().includes(q)
    );
  }, [recipes, query]);

  return (
    <div className="container">
      <section className="section">
        <div className="sectionInner">
          <div className={styles.nav}>
            <a href="/" className={styles.backBtn}>
              ← 戻る
            </a>
          </div>
          <div className={styles.filters}>
            <input
              className={styles.input}
              placeholder="レシピを検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.grid}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>空</div>
                <h3 className={styles.emptyTitle}>
                  {query
                    ? "検索結果が見つかりません"
                    : "まだレシピがありません"}
                </h3>
                <p className={styles.emptyDesc}>
                  {query
                    ? "別のキーワードで検索してみてください"
                    : "新しいレシピを登録してみましょう"}
                </p>
              </div>
            ) : (
              filtered.map((r) => (
                <a href={`/recipe/${r.id}`} className={styles.card} key={r.id}>
                  <div className={styles.imageContainer}>
                    <img
                      className={styles.thumb}
                      src={r.thumbnailPath}
                      alt={r.title}
                      width={800}
                      height={450}
                    />
                  </div>
                  <div className={styles.meta}>
                    <h3 className={styles.name}>{r.title}</h3>
                    <div className={styles.date}>
                      {new Date(r.createdAt).toLocaleString("ja-JP")}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
