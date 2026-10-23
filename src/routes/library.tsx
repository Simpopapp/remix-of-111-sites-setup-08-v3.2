import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CONCEPTS } from "@/lib/concepts";
import { LESSONS } from "@/lib/lessons";
import { CatalogSection, type CatalogSearch } from "@/components/library/catalog";

/**
 * Biblioteca (PRD project3 F2): dona do acervo. Busca unificada sobre
 * conceitos, laboratórios e missões com motivo da relevância explícito,
 * filtros por tema/tipo/profundidade, categorias editoriais, visão
 * editorial/compacta e cobertura honesta no cabeçalho.
 */

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
    type: typeof search["type"] === "string" ? search["type"] : undefined,
    depth: typeof search["depth"] === "string" ? search["depth"] : undefined,
    view: typeof search["view"] === "string" ? search["view"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Biblioteca — VibeCoder Academy" },
      {
        name: "description",
        content:
          "O acervo completo: 111 conceitos, laboratórios e missões — cada resultado explica por que corresponde à sua busca, com cobertura honesta.",
      },
      { property: "og:title", content: "Biblioteca — VibeCoder Academy" },
      {
        property: "og:description",
        content:
          "111 conceitos, laboratórios e missões — busque por nome, sintoma ou tema, com o motivo da correspondência explícito.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { q, cat, type, depth, view } = Route.useSearch();
  const navigate = Route.useNavigate();

  const deepCount = useMemo(
    () => CONCEPTS.filter((c) => LESSONS.some((l) => l.id === c.id)).length,
    [],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <section className="mx-auto w-full max-w-7xl px-4 pb-2 pt-10 sm:px-6">
        <div className="max-w-3xl border-b border-border/60 pb-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Biblioteca
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Consulte pelo nome, investigue por sintoma ou explore por tema —
            conceitos, laboratórios e missões na mesma busca. A cobertura é
            honesta: {deepCount} dos {CONCEPTS.length} conceitos têm aula
            estruturada; o restante abre como referência rápida, claramente
            indicada.
          </p>
        </div>
      </section>

      <CatalogSection
        q={q}
        cat={cat}
        type={type}
        depth={depth}
        view={view}
        onSync={(search) => void navigate({ search, replace: true })}
      />

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        VibeCoder Academy — acervo consultável, sem cobertura fingida.
      </footer>
    </div>
  );
}
