import type { ReactNode } from "react";
import type { StickerName } from "../data/stickers";
import { Sticker } from "./Sticker";

type PageIntroProps = {
  number: string;
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  sticker: StickerName;
  meta?: string;
  children?: ReactNode;
};

export function PageIntro({
  number,
  eyebrow,
  title,
  lede,
  sticker,
  meta,
  children,
}: PageIntroProps) {
  return (
    <header className="page-intro">
      <div className="container page-intro__grid">
        <div className="page-intro__index" data-hero-fade>
          <span className="mono">{number}</span>
          <span className="page-intro__rule" />
        </div>

        <div className="page-intro__copy">
          <span className="eyebrow" data-hero-fade>
            {eyebrow}
          </span>
          <h1 className="page-intro__title">
            <span className="line">
              <span data-hero-line>{title}</span>
            </span>
          </h1>
          <p className="page-intro__lede" data-hero-fade>
            {lede}
          </p>
          {children ? (
            <div className="page-intro__actions" data-hero-fade>
              {children}
            </div>
          ) : null}
        </div>

        <div className="page-intro__aside" data-hero-fade>
          <Sticker name={sticker} size={148} rotate={-7} loading="eager" />
          {meta ? <span className="mono page-intro__meta">{meta}</span> : null}
        </div>
      </div>
      <span className="reg-mark page-intro__reg" aria-hidden="true" />
    </header>
  );
}
