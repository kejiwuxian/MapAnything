import type { Metadata } from "next";
import "./globals.css";
import PresentationCommandBridge from "../components/PresentationCommandBridge";

export const metadata: Metadata = {
  title: "MapAnything — Correlation maps for unmatched data",
  description: "The data alignment layer for startups building intelligent products before their datasets are perfectly labeled.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><PresentationCommandBridge />{children}</body>
    </html>
  );
}
