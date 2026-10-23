import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { matchSymptoms } from "@/lib/symptoms";
import { CONCEPTS } from "@/lib/concepts";
import { LESSONS } from "@/lib/lessons";
import { CatalogSection, type CatalogSearch } from "@/components/library/catalog";

/**
 * Biblioteca (PRD project3 D3/F0): o acervo completo com busca por nome,
 * sintoma e categoria — dono do catálogo a partir da F0; a home (F1) passa a
 * ser mesa de trabalho. Cobertura honesta visível no cabeçalho.
 */

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Biblioteca — VibeCoder Academy" },
      {
        name: "description",
        content:
          "O acervo completo: 111 conceitos com aulas profundas, referências rápidas e cobertura honesta — busque por nome, sintoma ou tema.",
      },
      { property: "og:title", content: "Biblioteca — VibeCoder Academy" },
      {
        property: "og:description",
        content:
          "111 conceitos com aulas profundas, referências rápidas e cobertura honesta — busque por nome, sintoma ou tema.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { q, cat } = Route.useSearch();
  const navigate = Route.useNavigate();

  const symptoms = useMemo(() => matchSymptoms(q ?? ""), [q]);
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
            Consulte pelo nome, investigue por sintoma ou explore por tema. A
            cobertura é honesta: {deepCount} dos {CONCEPTS.length} conceitos
            têm aula estruturada; o restante abre como referência rápida,
            claramente indicada.
          </p>
        </div>
      </section>

      <CatalogSection
        q={q}
        cat={cat}
        symptoms={symptoms}
        onSync={(search) => void navigate({ search, replace: true })}
      />

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        VibeCoder Academy — acervo consultável, sem cobertura fingida.
      </footer>
    </div>
  );
}
