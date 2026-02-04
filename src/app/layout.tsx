import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"], // Elegant weights
});

const sansFont = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"], // Clean, minimal
});

export const metadata: Metadata = {
  title: "Happy Rose Day",
  description: "A digital rose, gifted with intention.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${serifFont.variable} ${sansFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
