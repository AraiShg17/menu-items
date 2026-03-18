import "./globals.css";
import { ToastProvider } from "../components/ToastContainer";

export const metadata = {
  title: "レシピブック",
  description: "AIでレシピを考案・管理し、画像からレシピを抽出できる料理アプリ",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
