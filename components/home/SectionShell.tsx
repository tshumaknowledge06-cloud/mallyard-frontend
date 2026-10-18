import Link from "next/link";

interface CTA {
  label: string;
  href: string;
}

interface SectionShellProps {
  eyebrow?: string;
  headline: string;
  copy?: string;
  cta?: CTA;
  secondaryCta?: CTA;
  children?: React.ReactNode;
  tone?: "ivory" | "white" | "emerald";
  fullBleed?: boolean;
  align?: "left" | "center";
  layout?: "classic" | "eyebrow-rail-headline-cta";
  /** Optional small note rendered AFTER the CTA (both layouts) */
  footerNote?: string;
  className?: string;
}

const TONE_CLASSES: Record<
  NonNullable<SectionShellProps["tone"]>,
  string
> = {
  ivory: "bg-[#F9F7F3]",
  white: "bg-white",
  emerald: "bg-[var(--emerald-main)] text-white",
};

export default function SectionShell({
  eyebrow,
  headline,
  copy,
  cta,
  secondaryCta,
  children,
  tone = "ivory",
  fullBleed = false,
  align = "left",
  layout = "classic",
  footerNote,
  className = "",
}: SectionShellProps) {
  const toneClass = TONE_CLASSES[tone];
  const isEmerald = tone === "emerald";
  const alignClass =
    align === "center" ? "text-center items-center" : "text-left items-start";
  const contentWidthClass = fullBleed ? "container-page" : "";

  const eyebrowEl = eyebrow && (
    <p className="text-xs uppercase tracking-widest font-semibold text-[var(--gold-soft)]">
      {eyebrow}
    </p>
  );

  const headlineEl = (
    <h2
      className={`
        text-2xl md:text-3xl font-semibold leading-tight
        ${isEmerald ? "text-white" : "text-[var(--emerald-main)]"}
      `}
    >
      {headline}
    </h2>
  );

  const copyEl = copy && (
    <p
      className={`
        text-base md:text-lg leading-relaxed
        ${isEmerald ? "text-white/85" : "text-gray-700"}
      `}
    >
      {copy}
    </p>
  );

  const ctaEl = (cta || secondaryCta) && (
    <div
      className={`
        flex flex-wrap gap-3 mt-4
        ${align === "center" ? "justify-center" : ""}
      `}
    >
      {cta && (
        <Link
          href={cta.href}
          className={`
            inline-flex items-center justify-center
            px-6 py-3 rounded-full
            text-sm font-semibold
            transition
            ${
              isEmerald
                ? "bg-[var(--gold-soft)] text-[var(--emerald-dark)] hover:bg-yellow-300"
                : "bg-[var(--emerald-main)] text-white hover:bg-[var(--emerald-soft)]"
            }
            ring-1 ring-[var(--gold-soft)]/40
          `}
        >
          {cta.label}
        </Link>
      )}

      {secondaryCta && (
        <Link
          href={secondaryCta.href}
          className={`
            inline-flex items-center justify-center
            px-6 py-3 rounded-full
            text-sm font-semibold
            border transition
            ${
              isEmerald
                ? "border-white/40 text-white hover:bg-white/10"
                : "border-[var(--emerald-main)] text-[var(--emerald-main)] hover:bg-emerald-50"
            }
            ring-1 ring-[var(--gold-soft)]/30
          `}
        >
          {secondaryCta.label}
        </Link>
      )}
    </div>
  );

  const footerNoteEl = footerNote && (
    <p
      className={`
        text-xs leading-relaxed max-w-2xl mx-auto text-center
        ${isEmerald ? "text-white/60" : "text-gray-500"}
      `}
    >
      {footerNote}
    </p>
  );

  return (
    <section
      className={`
        ${toneClass}
        ${fullBleed ? "full-bleed" : ""}
        py-16 md:py-24
        ${className}
      `}
    >
      <div className={`${contentWidthClass} px-4 md:px-6`}>
        <div
          className={`
            flex flex-col gap-5
            ${alignClass}
            ${align === "center" ? "mx-auto" : ""}
          `}
        >
          {layout === "classic" ? (
            <>
              <div className="max-w-3xl flex flex-col gap-4">
                {eyebrowEl}
                {headlineEl}
                {copyEl}
                {ctaEl}
              </div>
              {children && <div className="mt-10 md:mt-14">{children}</div>}
              {footerNoteEl && <div className="mt-8">{footerNoteEl}</div>}
            </>
          ) : (
            /* eyebrow-rail-headline-cta */
            <>
              {eyebrowEl}
              {children && <div className="w-full">{children}</div>}
              <div className="max-w-3xl flex flex-col gap-3 mt-4">
                {headlineEl}
                {copyEl}
                {ctaEl}
              </div>
              {footerNoteEl && <div className="mt-6">{footerNoteEl}</div>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}