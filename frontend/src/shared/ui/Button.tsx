import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "dark" | "outline" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-lime-400 text-ink-950 hover:bg-lime-500 active:bg-lime-600 shadow-[inset_0_-2px_0_rgb(0_0_0/0.08)]",
  dark: "bg-ink-950 text-white hover:bg-ink-800",
  outline: "border border-ink-200 bg-white text-ink-900 hover:border-ink-400 hover:bg-ink-50",
  ghost: "text-ink-700 hover:bg-ink-100",
  danger: "bg-flame-500 text-white hover:bg-flame-600",
  soft: "bg-ink-100 text-ink-900 hover:bg-ink-200",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-4 text-[15px] gap-2 rounded-xl",
  lg: "h-13 px-6 text-base gap-2 rounded-2xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center font-semibold transition-colors duration-150 select-none
    disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}

export function IconButton({ label, className = "", ...props }: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-grid size-9 place-items-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950 disabled:opacity-40 ${className}`}
      {...props}
    />
  );
}
