import type { Metadata } from "next";
import { Caveat, Nunito, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lily's 32nd Birthday Scrapbook",
  description: "A collaborative scrapbook of memories for Lily's 32nd birthday",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${caveat.variable} ${nunito.variable} ${ibmPlexMono.variable} font-body antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
