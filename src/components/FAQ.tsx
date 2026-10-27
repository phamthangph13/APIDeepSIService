import { useState } from "react";
import { FAQS } from "../data/site";
import { Sticker } from "./Sticker";

type FAQItem = { q: string; a: string };

export function FAQ({ items = FAQS }: { items?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <article className={`faq__item${isOpen ? " is-open" : ""}`} key={item.q}>
            <button
              type="button"
              className="faq__question"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span className="faq__number mono">{String(index + 1).padStart(2, "0")}</span>
              <span className="faq__text">{item.q}</span>
              <span className="faq__toggle" aria-hidden="true">
                <Sticker name="plus" size={22} rotate={isOpen ? 45 : 0} flat decorative />
              </span>
            </button>
            <div className="faq__answer" id={`faq-answer-${index}`} role="region">
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
