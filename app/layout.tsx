import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI ChatBot",
  description: "Created By Ashar Ullah Khan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-inter`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
