import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAiDesk - 의료기기 인허가 어시스턴트",
  description: "의료기기 인허가 컨설팅 AI 어시스턴트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#f8f9fa] relative">
          {/* Subtle background pattern - Apple style */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl" />
          </div>

          {/* Main content */}
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
