import type { Metadata } from "next";
import {
  // Clean/Modern
  Nunito,
  Poppins,
  Montserrat,
  // Handwritten/Script
  Caveat,
  Indie_Flower,
  Dancing_Script,
  Sacramento,
  Pacifico,
  // Playful/Fun
  Fredoka,
  Baloo_2,
  Bangers,
  // Bold/Display
  Bebas_Neue,
  Lobster,
  Righteous,
  // Serif/Elegant
  Playfair_Display,
  Lora,
  Cormorant_Garamond,
  // Monospace
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

// Clean/Modern fonts
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Handwritten/Script fonts
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const indieFlower = Indie_Flower({
  variable: "--font-indie-flower",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Playful/Fun fonts
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin"],
  display: "swap",
});

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Bold/Display fonts
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const lobster = Lobster({
  variable: "--font-lobster",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const righteous = Righteous({
  variable: "--font-righteous",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Serif/Elegant fonts
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Monospace
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

// Combine all font variables for body className
const fontVariables = [
  nunito.variable,
  poppins.variable,
  montserrat.variable,
  caveat.variable,
  indieFlower.variable,
  dancingScript.variable,
  sacramento.variable,
  pacifico.variable,
  fredoka.variable,
  baloo2.variable,
  bangers.variable,
  bebasNeue.variable,
  lobster.variable,
  righteous.variable,
  playfairDisplay.variable,
  lora.variable,
  cormorantGaramond.variable,
  ibmPlexMono.variable,
].join(" ");

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
        className={`${fontVariables} font-body antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
