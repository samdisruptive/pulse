import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse",
  description: "Internal client intelligence for Digitally Disruptive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
