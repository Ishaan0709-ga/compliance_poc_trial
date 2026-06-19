import { ReactNode } from "react";
import { Card, Btn } from "./ui-kit";

export function EmptyState({
  icon,
  title,
  description,
  primary,
  secondary,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  primary?: { label: string; onClick?: () => void; href?: string };
  secondary?: { label: string; onClick?: () => void; href?: string };
}) {
  const renderCta = (cta?: { label: string; onClick?: () => void; href?: string }, variant: "p" | "o" = "p") => {
    if (!cta) return null;
    if (cta.href) {
      return (
        <a href={cta.href}>
          <Btn variant={variant}>{cta.label}</Btn>
        </a>
      );
    }
    return (
      <Btn variant={variant} onClick={cta.onClick}>
        {cta.label}
      </Btn>
    );
  };
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted/60 text-primary">
          {icon}
        </div>
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        <p className="max-w-md text-[12.5px] text-ink-3">{description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {renderCta(primary, "p")}
          {renderCta(secondary, "o")}
        </div>
      </div>
    </Card>
  );
}
