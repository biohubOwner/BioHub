import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claim Your Username - Modern Profile Platform",
  description: "Claim your username and create a stunning profile page - 100% free, no sign-up required",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
