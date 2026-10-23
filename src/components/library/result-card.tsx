import { ArrowRight, BookOpen, FlaskConical, Map } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LibraryResult } from "@/lib/library-search";

/**
 * Cards de resultado da biblioteca (PRD project3 F2): problema em 1ª linha +
 * ação aprendida + representação real. A analogia deixa de ser o resumo
 * principal; o motivo da relevância é explícito e correspondência fraca é
 * rotulada (nunca apresentada como diagnóstico). Overlay de link z-10 acima
 * de todo o conteúdo (contrato de clique do card).
 */

const KIND_META = {
  concept: { label: "Conceito", icon: BookOpen },
  lab: { label: "Laboratório", icon: FlaskConical },
  mission: { label: "Missão", icon: Map },
} as const;

function coverageClass(tone: LibraryResult["coverageTone"]): string {
  switch (tone) {
    case "deep":
      return "bg-primary/10 text-primary";
    case "unreviewed":
      return "bg-warning/10 text-warning";
    case "lab":
    case "mission":
      return "bg-info/10 text-info";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function ResultCard({ result }: { result: LibraryResult }) {
  const kind = KIND_META[result.kind];
  const Icon = kind.icon;
  return (
    <div className="group relative flex flex-col rounded-xl border border-border/70 bg-card/50 p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-card">
      <Link
        to={result.href}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Abrir ${kind.label.toLowerCase()}: ${result.title}`}
      />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Icon className="size-3.5" />
            {kind.label}
          </span>
          <span
            className={
              "rounded-full px-2 py-0.5 text-xs font-semibold " +
              coverageClass(result.coverageTone)
            }
          >
            {result.coverage}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
          {result.title}
        </h3>

        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Problema
        </p>
        <p className="mt-0.5 line-clamp-3 text-sm leading-relaxed text-foreground/90">
          {result.problem}
        </p>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Você pratica
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {result.action}
        </p>

        {result.representation ? (
          <p className="mt-3 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">
              Representação: {result.representation.label}.
            </span>{" "}
            <span className="line-clamp-1">{result.representation.caption}</span>
          </p>
        ) : null}

        {result.reason ? (
          <p
            className={
              "mt-3 text-xs leading-relaxed " +
              (result.weak ? "italic text-muted-foreground/80" : "text-foreground/70")
            }
          >
            Por que corresponde: {result.reason}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-3 text-xs">
        <span className="flex items-center gap-1 font-mono text-muted-foreground transition-colors group-hover:text-foreground">
          Abrir
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );
}

/** Visão compacta (§8.2): uma linha por item, para varredura rápida. */
export function ResultRow({ result }: { result: LibraryResult }) {
  const kind = KIND_META[result.kind];
  const Icon = kind.icon;
  return (
    <div className="group relative flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-card">
      <Link
        to={result.href}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`Abrir ${kind.label.toLowerCase()}: ${result.title}`}
      />
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {result.title}
      </span>
      <span className="hidden min-w-0 flex-[2] truncate text-xs text-muted-foreground md:block">
        {result.problem}
      </span>
      <span
        className={
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold " +
          coverageClass(result.coverageTone)
        }
      >
        {result.coverage}
      </span>
    </div>
  );
}
