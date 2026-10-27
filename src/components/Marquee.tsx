import type { CSSProperties } from "react";
import { Sticker } from "./Sticker";

type MarqueeProps = {
  items: string[];
  speed?: number;
  className?: string;
};

export function Marquee({ items, speed = 34, className = "" }: MarqueeProps) {
  const row = (duplicate: boolean) => (
    <div className="marquee__row" aria-hidden={duplicate ? true : undefined}>
      {items.map((item, index) => (
        <span className="marquee__item" key={`${item}-${index}`}>
          <span>{item}</span>
          <Sticker
            name={index % 3 === 0 ? "star" : index % 3 === 1 ? "spark" : "bolt"}
            size={22}
            rotate={index % 2 === 0 ? -8 : 6}
            flat
            decorative
          />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`marquee ${className}`}
      style={{ "--marquee-speed": `${speed}s` } as CSSProperties}
    >
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
