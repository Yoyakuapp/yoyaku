import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";

import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";

const appSans = M_PLUS_Rounded_1c({
  variable: "--font-app-sans",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yoyaku",
  description: "Massage booking platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`h-full antialiased ${appSans.variable}`}>
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
