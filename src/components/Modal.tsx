import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Sticker } from "./Sticker";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      const first = cardRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? cardRef.current)?.focus();
    }, 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !cardRef.current) return;
      const nodes = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-card modal-card--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={cardRef}
        tabIndex={-1}
      >
        <div className="modal-card__top">
          <div>
            {eyebrow ? <span className="eyebrow eyebrow--plain">{eyebrow}</span> : null}
            <h2 id={titleId} className="modal-card__title">
              {title}
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng">
            <Sticker name="plus" size={20} rotate={45} flat decorative />
          </button>
        </div>
        <div className="modal-card__body">{children}</div>
        {footer ? <div className="modal-card__foot">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
