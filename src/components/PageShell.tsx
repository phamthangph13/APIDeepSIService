import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AccountCorner } from "./AccountCorner";

gsap.registerPlugin(ScrollTrigger);

type PageShellProps = {
  children: ReactNode;
  title: string;
  className?: string;
};

export function PageShell({ children, title, className = "" }: PageShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} — DeepSI Agent`;
  }, [title]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 90);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [location.pathname, location.hash, location.key]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const heroLines = gsap.utils.toArray<HTMLElement>("[data-hero-line]", root);
      const heroFades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]", root);
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);

      if (reduced) {
        gsap.set([...heroLines, ...heroFades, ...reveals], { opacity: 1, y: 0, yPercent: 0 });
        return;
      }

      if (heroLines.length > 0) {
        gsap.from(heroLines, {
          yPercent: 112,
          duration: 1.15,
          stagger: 0.09,
          ease: "power4.out",
          delay: 0.08,
        });
      }
      if (heroFades.length > 0) {
        gsap.from(heroFades, {
          y: 18,
          opacity: 0,
          duration: 0.8,
          stagger: 0.075,
          ease: "power3.out",
          delay: 0.34,
        });
      }

      reveals.forEach((element) => {
        gsap.fromTo(
          element,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className={`page${className ? ` ${className}` : ""}`}>
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng
      </a>
      <AccountCorner />
      <main className="page__main" id="main" ref={rootRef}>
        {children}
      </main>
    </div>
  );
}
