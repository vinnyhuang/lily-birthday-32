"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Sticker } from "./stickers";
import type { OpenmojiGroup, OpenmojiEmoji } from "./openmojiData";

interface StickerPickerProps {
  onSelect: (sticker: Sticker, src: string) => void;
}

export function StickerPicker({ onSelect }: StickerPickerProps) {
  const [selectedGroup, setSelectedGroup] = useState<OpenmojiGroup>("smileys-emotion");
  const [emojis, setEmojis] = useState<OpenmojiEmoji[]>([]);
  const [groupLabels, setGroupLabels] = useState<Record<OpenmojiGroup, string> | null>(null);
  const [groupOrder, setGroupOrder] = useState<OpenmojiGroup[]>([]);
  const [getOpenmojiSvgUrl, setGetOpenmojiSvgUrl] = useState<((hexcode: string) => string) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic import of emoji data
  useEffect(() => {
    let mounted = true;

    async function loadEmojiData() {
      const data = await import("./openmojiData");
      if (mounted) {
        setGroupLabels(data.groupLabels);
        setGroupOrder(data.groupOrder);
        setGetOpenmojiSvgUrl(() => data.getOpenmojiSvgUrl);
        setEmojis(data.getEmojisByGroup(selectedGroup));
        setIsLoading(false);
      }
    }

    loadEmojiData();

    return () => {
      mounted = false;
    };
  }, [selectedGroup]);

  // Update emojis when group changes
  useEffect(() => {
    if (isLoading) return;

    async function updateEmojis() {
      const data = await import("./openmojiData");
      setEmojis(data.getEmojisByGroup(selectedGroup));
    }

    updateEmojis();
  }, [selectedGroup, isLoading]);

  const handleEmojiClick = useCallback(
    (hexcode: string, emoji: string, annotation: string) => {
      if (!getOpenmojiSvgUrl) return;
      const src = getOpenmojiSvgUrl(hexcode);
      const sticker: Sticker = {
        id: `openmoji-${hexcode}`,
        emoji: emoji,
        label: annotation,
        category: "emoji",
      };
      onSelect(sticker, src);
    },
    [getOpenmojiSvgUrl, onSelect]
  );

  if (isLoading || !getOpenmojiSvgUrl) {
    return (
      <div className="flex items-center justify-center h-[320px]">
        <div className="text-muted-foreground text-sm">Loading emojis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category dropdown */}
      <div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value as OpenmojiGroup)}
          className="w-full px-3 py-2 rounded-lg border border-[#E8DFD6] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {groupOrder.map((group) => (
            <option key={group} value={group}>
              {groupLabels?.[group] ?? group}
            </option>
          ))}
        </select>
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-6 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {emojis.map((emoji) => (
          <button
            key={emoji.hexcode}
            onClick={() => handleEmojiClick(emoji.hexcode, emoji.emoji, emoji.annotation)}
            className="aspect-square flex items-center justify-center rounded-lg border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all p-1"
            title={emoji.annotation}
          >
            <Image
              src={getOpenmojiSvgUrl(emoji.hexcode)}
              alt={emoji.annotation}
              width={36}
              height={36}
              className="w-9 h-9"
              loading="lazy"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Attribution */}
      <p className="text-xs text-muted-foreground text-center">
        Emojis by{" "}
        <a
          href="https://openmoji.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          OpenMoji
        </a>
        {" "}(CC BY-SA 4.0)
      </p>
    </div>
  );
}
