// Sticker type definitions for the canvas
// Now using OpenMoji for emojis (see openmojiData.ts)

import { StickerCategory } from "@/lib/canvas/types";

// Generic sticker interface used by canvas elements
export interface Sticker {
  id: string;
  emoji: string;
  label: string;
  category: StickerCategory;
}
