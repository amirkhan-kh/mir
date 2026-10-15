import Image from "next/image";
import Link from "next/link";

/** Mir mark: power glyph above the lime→leaf swoosh from the brand logo. */
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="mir-swoosh" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#d4ef6e" />
          <stop offset="0.5" stopColor="#a2d42b" />
          <stop offset="1" stopColor="#3e8a1b" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="#0b0d0a" />
      <path d="M17.2 14.6a10 10 0 1 0 13.6 0" fill="none" stroke="#bde33f" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 9.5v10" stroke="#bde33f" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M5 36c9 6.5 29 6.5 38-3.5-9 7.2-28 7.4-38 3.5Z" fill="url(#mir-swoosh)" />
    </svg>
  );
}

export function Logo({ href = "/", inverted = false }: { href?: string; inverted?: boolean }) {
  return (
    <Link href={href} aria-label="Mir — bosh sahifa" className="inline-flex shrink-0 items-center">
      <Image
        src={inverted ? "/brand/logo-light.webp" : "/brand/logo.webp"}
        alt="МИР — maishiy texnika va elektronika"
        width={558}
        height={293}
        loading={inverted ? "lazy" : "eager"}
        sizes="96px"
        className="h-12 w-auto"
      />
    </Link>
  );
}
