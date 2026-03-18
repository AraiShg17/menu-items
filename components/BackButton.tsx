import { useRouter } from "next/navigation";
import styles from "./BackButton.module.css";

interface BackButtonProps {
  children?: React.ReactNode;
}

export default function BackButton({ children }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    const pathname = window.location.pathname;

    // 第3階層（/recipe/[id]）の場合、親の第2階層（/gallery）へ
    if (pathname.startsWith("/recipe/")) {
      router.push("/gallery");
    }
    // 第2階層（/chat, /gallery, /new, /extract）の場合、ルートへ
    else if (["/chat", "/gallery", "/new", "/extract"].includes(pathname)) {
      router.push("/");
    }
    // その他の場合は履歴で戻る
    else {
      window.history.back();
    }
  };

  return (
    <div className={styles.nav}>
      <button className={styles.backBtn} onClick={handleBack}>
        ← 戻る
      </button>
      {children}
    </div>
  );
}
