import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        padded && "p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A clickable card surface. Uses a div with role="button" rather than a
 * native <button> because these cards contain their own interactive
 * children (e.g. InfoTooltip triggers) - nesting <button> inside <button>
 * is invalid HTML and causes React hydration mismatches.
 */
export function CardButton({
  onClick,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { onClick?: () => void; children: ReactNode }) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-ink-400)]">
            {eyebrow}
          </div>
        )}
        <h2 className="text-[15px] font-semibold text-[var(--color-ink-900)]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-[var(--color-ink-500)]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function PageSection({
  id,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-8">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-[var(--color-ink-400)]">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
