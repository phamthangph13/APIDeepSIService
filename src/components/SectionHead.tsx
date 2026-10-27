import type { ReactNode } from "react";
import type { StickerName } from "../data/stickers";
import { Sticker } from "./Sticker";

type SectionHeadProps = {
  number: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  sticker?: StickerName;
  id?: string;
};

export function SectionHead({ number, eyebrow, title, lede, sticker, id }: SectionHeadProps) {
  return (
    <header className="section-head" id={id}>
      <div className="section-head__number" data-reveal>
        <span className="mono">{number}</span>
        <span className="section-head__rule" />
      </div>
      <div className="section-head__main">
        <span className="eyebrow" data-reveal>
          {eyebrow}
        </span>
        <h2 className="section-head__title" data-reveal>
          {title}
        </h2>
      </div>
      {lede ? (
        <div className="section-head__lede" data-reveal>
          <p>{lede}</p>
        </div>
      ) : null}
      {sticker ? (
        <div className="section-head__sticker" data-reveal>
          <Sticker name={sticker} size={96} rotate={7} decorative />
        </div>
      ) : null}
    </header>
  );
}
