import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MapAnything — Correlation maps for unmatched data",
  description: "A SpeedHacks demo of application-independent data correlation mapping.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
