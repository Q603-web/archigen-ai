import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ArchiGen AI — The #1 Directory of AI Tools for Architects & Designers",
  description:
    "Discover and compare 20+ AI tools for architecture. Curated reviews, workflow guides, and tutorials from practitioners — not marketers.",
  openGraph: {
    title: "ArchiGen AI — AI Tools for Architects Who Actually Build",
    description:
      "20+ curated AI tools tested on real architecture projects. No sponsored placements.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchiGen AI — AI Tools for Architects Who Actually Build",
    description:
      "20+ curated AI tools tested on real architecture projects. No sponsored placements.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
