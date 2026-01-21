// Font definitions for the canvas text editor

export type FontCategory = "clean" | "handwritten" | "playful" | "display" | "elegant" | "mono";

export interface FontDefinition {
  id: string;
  name: string;
  family: string;
  category: FontCategory;
}

export const fonts: FontDefinition[] = [
  // Clean/Modern (3)
  { id: "nunito", name: "Nunito", family: "Nunito", category: "clean" },
  { id: "poppins", name: "Poppins", family: "Poppins", category: "clean" },
  { id: "montserrat", name: "Montserrat", family: "Montserrat", category: "clean" },

  // Handwritten/Script (5)
  { id: "caveat", name: "Caveat", family: "Caveat", category: "handwritten" },
  { id: "indie-flower", name: "Indie Flower", family: "Indie Flower", category: "handwritten" },
  { id: "dancing-script", name: "Dancing Script", family: "Dancing Script", category: "handwritten" },
  { id: "sacramento", name: "Sacramento", family: "Sacramento", category: "handwritten" },
  { id: "pacifico", name: "Pacifico", family: "Pacifico", category: "handwritten" },

  // Playful/Fun (3)
  { id: "fredoka", name: "Fredoka", family: "Fredoka", category: "playful" },
  { id: "baloo-2", name: "Baloo 2", family: "Baloo 2", category: "playful" },
  { id: "bangers", name: "Bangers", family: "Bangers", category: "playful" },

  // Bold/Display (3)
  { id: "bebas-neue", name: "Bebas Neue", family: "Bebas Neue", category: "display" },
  { id: "lobster", name: "Lobster", family: "Lobster", category: "display" },
  { id: "righteous", name: "Righteous", family: "Righteous", category: "display" },

  // Serif/Elegant (3)
  { id: "playfair-display", name: "Playfair Display", family: "Playfair Display", category: "elegant" },
  { id: "lora", name: "Lora", family: "Lora", category: "elegant" },
  { id: "cormorant-garamond", name: "Cormorant Garamond", family: "Cormorant Garamond", category: "elegant" },

  // Monospace (1)
  { id: "ibm-plex-mono", name: "IBM Plex Mono", family: "IBM Plex Mono", category: "mono" },
];

export const categoryLabels: Record<FontCategory, string> = {
  clean: "Clean / Modern",
  handwritten: "Handwritten",
  playful: "Playful / Fun",
  display: "Bold / Display",
  elegant: "Serif / Elegant",
  mono: "Monospace",
};

export const categoryOrder: FontCategory[] = [
  "clean",
  "handwritten",
  "playful",
  "display",
  "elegant",
  "mono",
];

export function getFontById(id: string): FontDefinition | undefined {
  return fonts.find((f) => f.id === id);
}

export function getFontByFamily(family: string): FontDefinition | undefined {
  return fonts.find((f) => f.family === family);
}

export function getFontsByCategory(category: FontCategory): FontDefinition[] {
  return fonts.filter((f) => f.category === category);
}

export function getGroupedFonts(): Record<FontCategory, FontDefinition[]> {
  return categoryOrder.reduce((acc, category) => {
    acc[category] = getFontsByCategory(category);
    return acc;
  }, {} as Record<FontCategory, FontDefinition[]>);
}
