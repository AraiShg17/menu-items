"use client";

import { useState, useCallback } from "react";
import Toast from "./Toast";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // グローバルにアクセスできるようにする
  if (typeof window !== "undefined") {
    (window as any).showToast = showToast;
  }

  return (
    <>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

export function useToast() {
  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      if (typeof window !== "undefined" && (window as any).showToast) {
        (window as any).showToast(message, type);
      }
    },
    []
  );

  return { showToast };
}


