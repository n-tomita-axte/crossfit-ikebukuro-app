import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossFit池袋",
  description: "CrossFit池袋 会員向けアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
