import type { CSSProperties } from "react";
import { STICKERS, type StickerName } from "../data/stickers";

type StickerProps = {
  name: StickerName;
  size?: number;
  rotate?: number;
  className?: string;
  flat?: boolean;
  decorative?: boolean;
  alt?: string;
  loading?: "lazy" | "eager";
  style?: CSSProperties;
};

type StickerStyle = CSSProperties & {
  "--sticker-size": string;
  "--sticker-rotate": string;
};

export function Sticker({
  name,
  size = 64,
  rotate = 0,
  className = "",
  flat = false,
  decorative = false,
  alt,
  loading = "lazy",
  style,
}: StickerProps) {
  const sticker = STICKERS[name];
  const mergedStyle: StickerStyle = {
    "--sticker-size": `${size}px`,
    "--sticker-rotate": `${rotate}deg`,
    ...style,
  };

  return (
    <img
      src={sticker.src}
      alt={decorative ? "" : (alt ?? sticker.alt)}
      aria-hidden={decorative ? true : undefined}
      width={size}
      height={size}
      className={`sticker${flat ? " sticker--flat" : ""}${className ? ` ${className}` : ""}`}
      style={mergedStyle}
      loading={loading}
      draggable={false}
      decoding="async"
    />
  );
}
