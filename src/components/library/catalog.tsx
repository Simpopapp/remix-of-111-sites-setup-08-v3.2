import { useMemo, useEffect, useRef, useState } from "react";
import { Compass, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CONCEPTS, CONCEPT_CATEGORIES } from "@/lib/concepts";
import { LABS } from "@/lib/labs";
import { matchSymptoms, type SymptomEntry } from "@/lib/symptoms";
import { ConceptCard } from "@/components/concept-card";

/**
 * Catálogo compartilhado (PRD project3 9.2): usado por /library (dono) e,
 * temporariamente, pela home até a F1 tirar o catálogo da mesa de trabalho.
 * Sincronização ?q=/?cat= na URL com debounce de 250ms vive aqui (padrão
 * contratado do Project 1), via callback `onSync` de cada rota.
 */

export interface CatalogSearch {
  q?: string | undefined;
  cat?: string | undefined;
}

interface CatalogSectionProps {
  /** Valores vindos da URL da rota. */
  q: string | undefined;
  cat: string | undefined;
  /** Sincroniza {q, cat} na URL da rota (replace). */
  onSync: (search: CatalogSearch) => void;
  /** Correspondências por sintoma já calculadas pela rota. */
  symptoms: SymptomEntry[];
}

export function CatalogSection({ q, cat, onSync, symptoms }: CatalogSectionProps) {
  const [query, setQuery] = useState(q ?? "");
  const lastSynced = useRef("");

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim();
    const symptomIds = new Set(symptoms.flatMap((s) => s.conceptIds));
    return CONCEPTS.filter((item) => {
      const matchesCategory = !cat || item.cat === cat;
      const matchesSearch =
        !needle ||
        item.name.toLowerCase().includes(needle) ||
        item.eli.toLowerCase().includes(needle) ||
        String(item.id) === needle ||
        item.cat.toLowerCase().includes(needle) ||
        symptomIds.has(item.id);
      return matchesCategory && matchesSearch;
    });
  }, [query, cat, symptoms]);

  // URL → campo (voltar/avançar, link compartilhado).
  useEffect(() => {
    const fromUrl = q ?? "";
    if (fromUrl !== lastSynced.current) {
      lastSynced.current = fromUrl;
      setQuery(fromUrl);
    }
  }, [q]);

  // Campo → URL (debounce 250ms, contrato do Project 1).
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== lastSynced.current) {
        lastSynced.current = query;
        onSync({ q: query || undefined, cat });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, cat, onSync]);

  return (
    <>
      {/* BUSCA E FILTROS */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busque por nome, sintoma ou número (ex.: 'fila cresce', 'P99', 'N+1')..."
              aria-label="Buscar conceitos e sintomas"
              className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["Todas", ...CONCEPT_CATEGORIES] as string[]).map((label) => {
              const isActive = label === "Todas" ? !cat : cat === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    onSync({
                      q: query || undefined,
                      cat: label === "Todas" ? undefined : label,
                    })
                  }
                  aria-pressed={isActive}
                  className={
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                    (isActive
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border/60 bg-secondary/60 text-muted-foreground hover:text-foreground")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Correspondência por sintoma: explica o motivo (planejamento §9.2). */}
        {symptoms.length > 0 ? (
          <div className="mt-4 rounded-xl border border-info/30 bg-info/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-info">
              Corresponde por sintoma
            </p>
            {symptoms.slice(0, 2).map((s, i) => (
              <div key={i} className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-foreground/90">{s.lead}</span>
                {s.labId ? (
                  <Link
                    to="/labs/$id"
                    params={{ id: s.labId }}
                    className="font-semibold text-info underline-offset-2 hover:underline"
                  >
                    Abra o laboratório {LABS[s.labId].title} →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* GRADE */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            Mostrando {filtered.length} de {CONCEPTS.length} itens
          </span>
          <span className="hidden sm:inline">
            Os cards abrem pelo problema — a decisão vem na aula.
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/40 py-12 text-center">
            <Compass className="mx-auto mb-3 size-10 opacity-50" />
            <p className="text-sm font-semibold text-foreground">
              Nada corresponde a “{query}”{cat ? ` em ${cat}` : ""}.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onSync({ cat: undefined });
                }}
                className="rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Limpar a busca
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("queue grows");
                }}
                className="rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Buscar por um sintoma
              </button>
              <Link
                to="/sandboxes"
                search={{}}
                className="rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Tentar um laboratório
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <ConceptCard key={item.id} concept={item} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
