import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { StickerName } from "../data/stickers";
import { Sticker } from "./Sticker";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "light" | "danger";
type Size = "sm" | "md" | "lg";

type SharedProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: StickerName;
  iconSide?: "left" | "right";
  full?: boolean;
  className?: string;
};

function classNames({
  variant = "primary",
  size = "md",
  full,
  className,
}: Pick<SharedProps, "variant" | "size" | "full" | "className">) {
  return `btn btn--${variant} btn--${size}${full ? " btn--full" : ""}${className ? ` ${className}` : ""}`;
}

function Icon({ name, side }: { name?: StickerName; side: "left" | "right" }) {
  if (!name) return null;
  return (
    <Sticker
      name={name}
      size={22}
      rotate={side === "left" ? -6 : 6}
      flat
      decorative
      className="btn__icon"
    />
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconSide = "left",
  full,
  className,
  ...rest
}: SharedProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={classNames({ variant, size, full, className })} {...rest}>
      <Icon name={icon} side={iconSide} />
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({
  children,
  to,
  variant = "primary",
  size = "md",
  icon,
  iconSide = "left",
  full,
  className,
  ...rest
}: SharedProps & ComponentPropsWithoutRef<typeof Link> & { to: string }) {
  return (
    <Link to={to} className={classNames({ variant, size, full, className })} {...rest}>
      <Icon name={icon} side={iconSide} />
      <span>{children}</span>
    </Link>
  );
}

export function ExternalButtonLink({
  children,
  href,
  variant = "secondary",
  size = "md",
  icon,
  iconSide = "right",
  full,
  className,
  ...rest
}: SharedProps & ComponentPropsWithoutRef<"a"> & { href: string }) {
  return (
    <a
      href={href}
      className={classNames({ variant, size, full, className })}
      target="_blank"
      rel="noreferrer"
      {...rest}
    >
      <Icon name={icon} side={iconSide} />
      <span>{children}</span>
    </a>
  );
}
