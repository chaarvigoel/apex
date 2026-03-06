import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apex — Performance Engine for Elite Female Athletes",
  description:
    "Cycle-aware physiological data and neuromuscular training adjustments to mitigate ACL injury risk and maximize power output.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-apex-black font-sans text-gray-200">
        {children}
      </body>
    </html>
  );
}
