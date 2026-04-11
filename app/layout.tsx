import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ScrollToTopOnReload } from "@/components/layout/ScrollToTopOnReload";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AISEP - Hệ sinh thái Khởi nghiệp Toàn diện",
  description: "Nền tảng kết nối startup với nhà đầu tư và chuyên gia. Sử dụng AI để đánh giá tiềm năng, blockchain để bảo vệ tài sản trí tuệ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head />
      <body className="antialiased">
        <Script
          src="https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js"
          strategy="beforeInteractive"
        />
        <ScrollToTopOnReload />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
