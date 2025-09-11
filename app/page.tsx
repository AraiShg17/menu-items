import styles from "./page.module.css";

export default function Page() {
  return (
    <div className="container">
      <section className="section">
        <div className="sectionInner">
          <nav className={styles.nav}>
            <a
              className={`${styles.navCard} ${styles.cardAccent}`}
              href="/chat"
            >
              <img
                src="/images/button-03.png"
                alt=""
                className={styles.cardImage}
              />
              <h2 className={styles.cardTitle}>レシピの考案</h2>
              <p className={styles.cardDesc}>AIと一緒にレシピ作成</p>
            </a>

            <a
              className={`${styles.navCard} ${styles.cardSecondary}`}
              href="/gallery"
            >
              <img
                src="/images/button-02.png"
                alt=""
                className={styles.cardImage}
              />
              <h2 className={styles.cardTitle}>レシピの一覧</h2>
              <p className={styles.cardDesc}>登録済みレシピを確認</p>
            </a>

            <a
              className={`${styles.navCard} ${styles.cardPrimary}`}
              href="/new"
            >
              <img
                src="/images/button-01.png"
                alt=""
                className={styles.cardImage}
              />
              <h2 className={styles.cardTitle}>レシピを登録</h2>
              <p className={styles.cardDesc}>手動でレシピを登録</p>
            </a>
          </nav>
        </div>
      </section>
    </div>
  );
}
