import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Manrope, Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${plusJakartaSans.variable} ${syne.variable} antialiased`}
      >
        <Script
          src="https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js"
          strategy="beforeInteractive"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
