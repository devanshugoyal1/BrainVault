import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrainVault",
  description: "Your personal knowledge management system",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/logo.png", type: "image/png" },
    ],
    apple: "/brand/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Belt-and-suspenders: direct link tags as fallback */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/brand/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}