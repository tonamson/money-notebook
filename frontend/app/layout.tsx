import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AntdProvider from "./context/AntdProvider";
import I18nProvider from "./context/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Money Notebook - Ứng dụng quản lý thu chi cá nhân miễn phí",
    template: "%s | Money Notebook",
  },
  description:
    "Ghi chép thu chi hàng ngày đơn giản, theo dõi tài chính cá nhân hiệu quả. Quản lý ngân sách, phân loại chi tiêu, thống kê thu nhập miễn phí.",
  keywords: [
    "quản lý thu chi",
    "ghi chép chi tiêu",
    "quản lý tài chính cá nhân",
    "ứng dụng thu chi",
    "money notebook",
    "sổ thu chi",
    "theo dõi chi tiêu",
    "quản lý ngân sách",
    "tiết kiệm tiền",
    "ghi chép tài chính",
    "expense tracker",
    "budget app",
    "personal finance",
  ],
  authors: [{ name: "Money Notebook Team" }],
  creator: "Money Notebook",
  publisher: "Money Notebook",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://moneynote.store",
    siteName: "Money Notebook",
    title: "Money Notebook - Quản lý thu chi cá nhân miễn phí",
    description:
      "Ghi chép thu chi đơn giản, theo dõi tài chính hiệu quả. Phân loại chi tiêu, thống kê thu nhập, quản lý ngân sách dễ dàng.",
    images: [
      {
        url: "https://moneynote.store/og-image.png",
        width: 1200,
        height: 630,
        alt: "Money Notebook - Ứng dụng quản lý thu chi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Money Notebook - Quản lý thu chi cá nhân miễn phí",
    description:
      "Ghi chép thu chi đơn giản, theo dõi tài chính hiệu quả. Miễn phí 100%.",
    images: ["https://moneynote.store/og-image.png"],
  },
  alternates: {
    canonical: "https://moneynote.store",
  },
  category: "Finance",
  classification: "Personal Finance Application",
  other: {
    "google-site-verification": "", // Thêm mã xác thực Google Search Console
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-16YREP69D1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-16YREP69D1');
          `}
        </Script>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Money Notebook" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdProvider>
          <I18nProvider>{children}</I18nProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
