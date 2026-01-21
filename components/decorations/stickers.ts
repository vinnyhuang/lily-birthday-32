// Sticker definitions for the canvas
// Using emoji and text-based stickers that can be rendered as data URLs

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
  category: "emoji" | "stamp" | "washi";
}

export const stickers: Sticker[] = [
  // Birthday/Celebration emojis
  { id: "cake", emoji: "🎂", label: "Cake", category: "emoji" },
  { id: "party", emoji: "🎉", label: "Party", category: "emoji" },
  { id: "balloon", emoji: "🎈", label: "Balloon", category: "emoji" },
  { id: "gift", emoji: "🎁", label: "Gift", category: "emoji" },
  { id: "confetti", emoji: "🎊", label: "Confetti", category: "emoji" },
  { id: "crown", emoji: "👑", label: "Crown", category: "emoji" },
  { id: "star", emoji: "⭐", label: "Star", category: "emoji" },
  { id: "sparkles", emoji: "✨", label: "Sparkles", category: "emoji" },

  // Hearts & Love
  { id: "heart-red", emoji: "❤️", label: "Red Heart", category: "emoji" },
  { id: "heart-pink", emoji: "💕", label: "Pink Hearts", category: "emoji" },
  { id: "heart-sparkle", emoji: "💖", label: "Sparkle Heart", category: "emoji" },
  { id: "kiss", emoji: "😘", label: "Kiss", category: "emoji" },
  { id: "hug", emoji: "🤗", label: "Hug", category: "emoji" },
  { id: "love", emoji: "🥰", label: "Love", category: "emoji" },

  // Fun expressions
  { id: "joy", emoji: "😂", label: "Joy", category: "emoji" },
  { id: "cool", emoji: "😎", label: "Cool", category: "emoji" },
  { id: "party-face", emoji: "🥳", label: "Party Face", category: "emoji" },
  { id: "wink", emoji: "😜", label: "Wink", category: "emoji" },

  // Nature & Extras
  { id: "flower", emoji: "🌸", label: "Flower", category: "emoji" },
  { id: "sun", emoji: "☀️", label: "Sun", category: "emoji" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow", category: "emoji" },
  { id: "butterfly", emoji: "🦋", label: "Butterfly", category: "emoji" },
  { id: "camera", emoji: "📸", label: "Camera", category: "emoji" },
  { id: "music", emoji: "🎵", label: "Music", category: "emoji" },

  // Stamps (text-based)
  { id: "stamp-best-day", emoji: "BEST DAY!", label: "Best Day", category: "stamp" },
  { id: "stamp-love-this", emoji: "LOVE THIS!", label: "Love This", category: "stamp" },
  { id: "stamp-memories", emoji: "MEMORIES", label: "Memories", category: "stamp" },
  { id: "stamp-forever", emoji: "FOREVER", label: "Forever", category: "stamp" },
  { id: "stamp-cheers", emoji: "CHEERS!", label: "Cheers", category: "stamp" },
  { id: "stamp-xoxo", emoji: "XOXO", label: "XOXO", category: "stamp" },
];

// Generate a data URL for an emoji sticker
export function generateEmojiDataUrl(emoji: string, size: number = 128): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.font = `${size * 0.8}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2);

  return canvas.toDataURL("image/png");
}

// Generate a data URL for a stamp sticker
export function generateStampDataUrl(text: string, size: number = 160): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size * 0.5;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = "#F97066";
  ctx.beginPath();
  const radius = 8;
  ctx.roundRect(4, 4, size - 8, size * 0.5 - 8, radius);
  ctx.fill();

  // Border
  ctx.strokeStyle = "#DC2626";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${size * 0.18}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, size * 0.25);

  return canvas.toDataURL("image/png");
}

// Get sticker source based on type
export function getStickerSrc(sticker: Sticker): string {
  if (sticker.category === "stamp") {
    return generateStampDataUrl(sticker.emoji);
  }
  return generateEmojiDataUrl(sticker.emoji);
}

// Group stickers by category
export function getStickersByCategory() {
  return {
    emoji: stickers.filter((s) => s.category === "emoji"),
    stamp: stickers.filter((s) => s.category === "stamp"),
  };
}
