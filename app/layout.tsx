import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teleprompt",
  description:
    "Private teleprompter for scripts, reading, and presentation mode.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
