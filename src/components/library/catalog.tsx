import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CONCEPTS, type Category } from "@/lib/concepts";
import { LABS } from "@/lib/labs";
import { MISSIONS } from "@/lib/missions";
import {
  CATEGORY_QUESTIONS,
  emptyAdvice,
  searchLibrary,
  type LibraryKind,
} from "@/lib/library-search";
import { matchSymptoms } from "@/lib/symptoms";
import { ResultCard, ResultRow } from "@/components/library/result-card";

/**
 * Catálogo da biblioteca (PRD project3 F2): busca unificada sobre conceitos,
 * laboratórios e missões, cada resultado explicando por que corresponde.
 * Filtros por tema/tipo/profundidade; categorias com apresentação editorial
 * própria (§14.3); visão editorial vs. compacta; vazio orientado.
 * Sincronização ?q= na URL com debounce de 250ms (contrato do Project 1).
 */

export interface CatalogSearch {
  q?: string | undefined;
  cat?: string | undefined;
  type?: string | undefined;
  depth?: string | undefined;
  view?: string | undefined;
}

export const LIBRARY_TYPES: { value: LibraryKind; label: string }[] = [
  { value: "concept", label: "Conceitos e aulas" },
  { value: "lab", label: "Laboratórios" },
  { value: "mission", label: "Missões" },
];

interface CatalogSectionProps {
  /** Valores vindos da URL da rota. */
  q: string | undefined;
  cat: string | undefined;
  type: string | undefined;
  depth: string | undefined;
  view: string | undefined;
  /** Sincroniza {q, cat, type, depth, view} na URL da rota (replace). */
  onSync: (search: CatalogSearch) => void;
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
        (active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/60 bg-secondary/60 text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

export function CatalogSection({ q, cat, type, depth, view, onSync }: CatalogSectionProps) {
  const [query, setQuery] = useState(q ?? "");
  const lastSynced = useRef("");

  const compact = view === "compacta";

  const results = useMemo(
    () =>
      searchLibrary({
        q: query,
        cat: cat as Category | undefined,
        type: (LIBRARY_TYPES.some((t) => t.value === type) ? type : undefined) as
          | LibraryKind
          | undefined,
        depth: depth === "deep" || depth === "quick" ? depth : undefined,
      }),
    [query, cat, type, depth],
  );

  const symptoms = useMemo(() => matchSymptoms(query), [query]);
  const advice = useMemo(() => emptyAdvice(query), [query]);

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
        onSync({ q: query || undefined, cat, type, depth, view });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, cat, type, depth, view, onSync]);

  const totalItems = CONCEPTS.length + Object.keys(LABS).length + MISSIONS.length;
  const categoryQuestion = cat && cat in CATEGORY_QUESTIONS ? CATEGORY_QUESTIONS[cat as Category] : undefined;

  return (
    <>
      {/* BUSCA E FILTROS */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6" aria-label="Busca e filtros do acervo">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busque por nome, sintoma, tema ou número..."
              aria-label="Buscar no acervo"
              className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Tipo de experiência">
            {LIBRARY_TYPES.map((t) => (
              <Pill
                key={t.value}
                active={type === t.value}
                onClick={() => onSync({ q: query || undefined, cat, type: type === t.value ? undefined : t.value, depth, view })}
              >
                {t.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Pill
            active={!cat}
            onClick={() => onSync({ q: query || undefined, cat: undefined, type, depth, view })}
          >
            Todos os temas
          </Pill>
          {(Object.keys(CATEGORY_QUESTIONS) as Category[]).map((label) => (
            <Pill
              key={label}
              active={cat === label}
              onClick={() =>
                onSync({
                  q: query || undefined,
                  cat: cat === label ? undefined : label,
                  type,
                  depth,
                  view,
                })
              }
            >
              {label}
            </Pill>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Profundidade disponível">
          <Pill active={!depth} onClick={() => onSync({ q: query || undefined, cat, type, depth: undefined, view })}>
            Toda profundidade
          </Pill>
          <Pill active={depth === "deep"} onClick={() => onSync({ q: query || undefined, cat, type, depth: "deep", view })}>
            Com aula estruturada
          </Pill>
          <Pill active={depth === "quick"} onClick={() => onSync({ q: query || undefined, cat, type, depth: "quick", view })}>
            Só referência rápida
          </Pill>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            {compact ? "Visão compacta" : "Visão editorial"}
            <button
              type="button"
              onClick={() => onSync({ q: query || undefined, cat, type, depth, view: compact ? undefined : "compacta" })}
              aria-pressed={compact}
              className="rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {compact ? "Ver editorial" : "Ver compacta"}
            </button>
          </span>
        </div>

        {/* Correspondência por sintoma: explica o motivo (§8.2). */}
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

        {/* Categoria com apresentação editorial própria (§14.3). */}
        {categoryQuestion ? (
          <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{cat}</p>
            <h2 className="mt-1 font-serif text-xl font-bold text-foreground">
              {categoryQuestion.question}
            </h2>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {categoryQuestion.blurb}{" "}
              <span className="text-xs">
                ({CONCEPTS.filter((c) => c.cat === cat).length} conceitos neste tema)
              </span>
            </p>
          </div>
        ) : null}
      </section>

      {/* RESULTADOS */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            Mostrando {results.length} de {totalItems} itens ({CONCEPTS.length} conceitos,{" "}
            {Object.keys(LABS).length} laboratórios, {MISSIONS.length} missões)
          </span>
          <span className="hidden sm:inline">
            Cada resultado explica por que corresponde à sua busca.
          </span>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card/40 py-12 text-center" role="status">
            <Compass className="mx-auto mb-3 size-10 opacity-50" />
            <p className="mx-auto max-w-xl px-4 text-sm leading-relaxed text-foreground">
              {advice.message}
            </p>
            {advice.symptomHint ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Talvez você esteja descrevendo um sintoma: “{advice.symptomHint.lead}”
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onSync({ cat: undefined, type: undefined, depth: undefined });
                }}
                className="rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Limpar a busca
              </button>
              {advice.categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSync({ q: undefined, cat: c })}
                  className="rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  Explorar {c}
                </button>
              ))}
              <Link
                to="/sandboxes"
                search={{}}
                className="rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Tentar um laboratório
              </Link>
            </div>
          </div>
        ) : compact ? (
          <div className="flex flex-col gap-1.5" aria-label="Resultados em visão compacta">
            {results.map((r) => (
              <ResultRow key={r.key} result={r} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <ResultCard key={r.key} result={r} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
