import { Link } from "@tanstack/react-router";

/**
 * Header global v3 (PRD project3 D3/F0): organizado pelo trabalho do aluno —
 * Início · Biblioteca · Laboratórios · Missões · Progresso · Meu app.
 * Sem badge de autodeclaração na barra (planejamento §6): o registro de
 * aplicação continua em /readiness com seu significado intacto.
 */

const NAV = [
  { to: "/", label: "Início" },
  { to: "/library", label: "Biblioteca" },
  { to: "/sandboxes", label: "Laboratórios" },
  { to: "/missions", label: "Missões" },
  { to: "/progress", label: "Progresso" },
  { to: "/readiness", label: "Meu app" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" search={{}} className="flex items-baseline gap-2.5" aria-label="VibeCoder Academy — início">
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            VibeCoder Academy
          </span>
          <span className="hidden text-[0.68rem] font-semibold uppercase tracking-widest text-primary sm:inline">
            Estúdio de aprendizagem
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={{}}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-primary/10 text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/readiness"
          search={{}}
          className="shrink-0 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 md:hidden"
        >
          Meu app
        </Link>
      </div>
      {/* Mobile: a navegação não some — barra rolável abaixo da marca (D13 p2). */}
      <nav
        aria-label="Navegação principal (mobile)"
        className="border-t border-border/40 md:hidden"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 sm:px-6">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={{}}
              className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-primary/10 text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
