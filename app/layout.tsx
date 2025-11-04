import type { Metadata } from "next";
import "@/app/ui/globals.css";
import { Inter } from 'next/font/google';
import { AlertProvider } from "./context/AlertContext";
import LayoutContent from "./layout-client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delirium Detector",
  description: "A tool for tracking patient status and detecting delirium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AlertProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AlertProvider>
      </body>
    </html>
  );
}
