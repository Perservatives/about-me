import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/experience/LenisProvider";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dustin Du · index",
  description:
    "Scroll portfolio. TypeScript side projects, Python, school code — stereo, hackaton-shi, and whatever I pushed last.",
  openGraph: {
    title: "Dustin Du · index",
    description: "Dustin Du — GitHub, email, recent repos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <head>
        <link rel="preload" as="image" href="/assets/frames/f0001.jpg" fetchPriority="high" />
        <link rel="preload" as="image" href="/assets/frames/f0002.jpg" />
        <link rel="preload" as="image" href="/assets/frames/f0003.jpg" />
      </head>
      <body className="antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
