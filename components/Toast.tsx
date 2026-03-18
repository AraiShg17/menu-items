"use client";

import { useEffect, useState } from "react";
import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // アニメーション用に少し遅延して表示
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // 自動で消えるタイマー
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      // アニメーション完了後にコールバックを実行
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${
        isVisible ? styles.visible : ""
      }`}
    >
      <div className={styles.content}>
        <div className={styles.icon}>{type === "success" ? "✓" : "✕"}</div>
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
}


