import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  FlaskConical,
  History,
  Map,
  Timer,
} from "lucide-react";
import { CONCEPTS } from "@/lib/concepts";
import { hasLesson } from "@/lib/lessons";
import { useLearning } from "@/hooks/use-learning";
import {
  recommendNext,
  objectiveRouteStatus,
  type Recommendation,
} from "@/lib/recommend";
import { missionHintsFromLearning } from "@/lib/missions";
import { computeHomeState, type HomeAction } from "@/lib/next-action";

/**
 * Início — mesa de trabalho (PRD project3 F1/§8.1). A home responde "qual é a
 * melhor atividade para eu fazer agora?": primeira visita com escolha curta de
 * intenção; retorno com a atividade interrompida em destaque único e ponto de
 * retomada real. O catálogo vive na Biblioteca (/library).
 */

export const Route = createFileRoute("/")({
  // Contrato mantido da F6 p2 (teste de ?q=/?cat= em /); o catálogo agora é
  // dono desses parâmetros em /library.
  validateSearch: (
    search: Record<string, unknown>,
  ): { q?: string | undefined; cat?: string | undefined } => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "VibeCoder Academy — decisões aplicadas, praticadas com honestidade" },
      {
        name: "description",
        content:
          "Uma mesa de trabalho de aprendizagem: continue a atividade interrompida, comece por um problema reconhecível ou explore a biblioteca — progresso medido em decisões, não em páginas visitadas.",
      },
      {
        property: "og:title",
        content: "VibeCoder Academy — decisões aplicadas, praticadas com honestidade",
      },
      {
        property: "og:description",
        content:
          "Mesa de trabalho: retomar onde parou, começar por um problema ou explorar o acervo — sem teatro de prontidão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const PROBLEM_DOORS = [
  {
    title: "A requisição não terminou",
    desc: "Timeout, incerteza, retries e o invariante que protege a cobrança.",
    conceptId: 11,
  },
  {
    title: "A página ficou lenta",
    desc: "Round-trips, N+1, cache e a distribuição que a média esconde.",
    conceptId: 27,
  },
  {
    title: "O trabalho está se acumulando",
    desc: "Fila, capacidade, retry, DLQ — e o que um consumidor lento significa de verdade.",
    conceptId: 15,
  },
] as const;

type TimeBudget = "5" | "15" | "30";

const TIME_BUDGET: Record<TimeBudget, { limit: number; note: string }> = {
  "5": { limit: 1, note: "5 minutos: uma unidade menor — seu nível não está sendo julgado." },
  "15": { limit: 2, note: "15 minutos: uma unidade de estudo com prática curta." },
  "30": { limit: 3, note: "30 minutos: uma unidade com prática e variante." },
};

const KIND_LABEL: Record<HomeAction["kind"], string> = {
  mission: "Missão em andamento",
  review: "Revisão pendente",
  lesson: "Aula em progresso",
  lab: "Laboratório",
  progress: "Progresso",
};

function ActionCard({ action, variant }: { action: HomeAction; variant: "primary" | "secondary" }) {
  const base =
    variant === "primary"
      ? "rounded-2xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:border-primary/50"
      : "rounded-xl border border-border/60 bg-card/50 p-4 transition-colors hover:border-primary/40";
  return (
    <Link
      to={action.to}
      params={action.params as never}
      search={{}}
      className={`block ${base}`}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-primary">
        {KIND_LABEL[action.kind]}
      </div>
      <div className={variant === "primary" ? "mt-1.5 font-serif text-xl font-semibold text-foreground" : "mt-1 text-sm font-bold text-foreground"}>
        {action.title}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.context}</p>
    </Link>
  );
}

function RecCard({ rec }: { rec: Recommendation }) {
  return (
    <a
      href={rec.href}
      className="block rounded-xl border border-border/60 bg-card/50 p-3 transition-colors hover:border-primary/40"
    >
      <div className="text-xs font-bold text-foreground">{rec.label}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rec.reason}</p>
    </a>
  );
}

function HomePage() {
  const { learning, setObjective } = useLearning();

  // Controle honesto de tempo disponível (D9): o orçamento muda QUANTAS
  // unidades e com que profundidade — nunca o nível de conhecimento presumido.
  const [timeBudget, setTimeBudget] = useState<TimeBudget>("30");
  const [objectiveDraft, setObjectiveDraft] = useState("");

  const hints = useMemo(() => missionHintsFromLearning(learning), [learning]);
  const home = useMemo(() => computeHomeState(learning, hints), [learning, hints]);
  const objectiveStatus = objectiveRouteStatus(learning.objective?.goal);
  const recs = useMemo(
    () =>
      recommendNext(learning, learning.objective?.goal, {
        missionHints: hints,
        limit: TIME_BUDGET[timeBudget].limit,
      }),
    [learning, timeBudget, hints],
  );
  // Admissão honesta (D9): sem correspondência, o recorte de percurso não é
  // apresentado como se fosse continuação do objetivo.
  const visibleRecs =
    objectiveStatus === "unmatched"
      ? recs.filter((r) => r.kind !== "route-step")
      : recs;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* ABERTURA CURTA — a ação vem antes do discurso (planejamento §4.3) */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-8 sm:px-6">
        <h1 className="max-w-3xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Aprenda a decidir como um engenheiro de sistemas{" "}
          <span className="text-primary">— com evidência, não com sorte.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          111 conceitos com aulas, laboratórios e missões. O progresso aqui é
          decisão tomada e justificada — não página visitada.
        </p>
      </section>

      {/* MESA DE TRABALHO */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {home.mode === "first-visit" ? (
          <div className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
              <Compass className="size-5 text-primary" /> Comece escolhendo um problema
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {PROBLEM_DOORS.map((door) => (
                <Link
                  key={door.conceptId}
                  to="/concepts/$id"
                  params={{ id: String(door.conceptId) }}
                  className="rounded-xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/40"
                >
                  <div className="text-sm font-bold text-foreground">{door.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{door.desc}</p>
                  <p className="mt-2 text-xs font-semibold text-primary">Abrir o problema →</p>
                </Link>
              ))}
            </div>
            <Link
              to="/missions"
              search={{}}
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary/50"
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-primary">
                  Começo guiado — missão
                </div>
                <div className="mt-1 text-sm font-bold text-foreground">
                  A cobrança passou, mas a resposta se perdeu
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Prever, experimentar, decidir e escrever o dossiê — o ciclo completo em uma missão.
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-primary" />
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <Link
                to="/library"
                search={{}}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <BookOpen className="size-4 text-primary" /> Explorar a biblioteca
              </Link>
              <Link
                to="/sandboxes"
                search={{}}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <FlaskConical className="size-4 text-primary" /> Ir direto aos laboratórios
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-card/40 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
              <History className="size-5 text-primary" /> {home.allDone ? "Nada interrompido — escolha o próximo trabalho" : "Retome onde parou"}
            </h2>
            {/* Ação interrompida em destaque único — não três cards de igual peso */}
            {home.primary ? (
              <div className="mt-4">
                <ActionCard action={home.primary} variant="primary" />
              </div>
            ) : null}
            {home.secondary.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {home.secondary.map((a, i) => (
                  <ActionCard key={i} action={a} variant="secondary" />
                ))}
              </div>
            ) : null}

            {/* Objetivo editável + orçamento de tempo (D9) */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setObjective(objectiveDraft.trim() || null);
                }}
              >
                <label htmlFor="objective" className="text-xs font-semibold text-muted-foreground">
                  Meu objetivo:
                </label>
                <input
                  id="objective"
                  type="text"
                  defaultValue={learning.objective?.goal ?? ""}
                  onChange={(e) => setObjectiveDraft(e.target.value)}
                  placeholder="ex.: parar de perder cobranças no retry"
                  className="w-64 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  Salvar
                </button>
                {learning.objective ? (
                  <button
                    type="button"
                    onClick={() => {
                      setObjective(null);
                      setObjectiveDraft("");
                    }}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    limpar
                  </button>
                ) : null}
              </form>
              <div className="flex items-center gap-1.5">
                <Timer className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Tempo disponível:</span>
                {(["5", "15", "30"] as TimeBudget[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeBudget(t)}
                    aria-pressed={timeBudget === t}
                    className={
                      "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors " +
                      (timeBudget === t
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border/60 bg-secondary/60 text-muted-foreground hover:text-foreground")
                    }
                  >
                    {t} min
                  </button>
                ))}
              </div>
            </div>

            {/* Admissão honesta de objetivo sem correspondência (D9) */}
            {objectiveStatus === "unmatched" ? (
              <p className="mt-3 rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-foreground">
                Não há um percurso correspondente a esse objetivo ainda. As
                sugestões abaixo são pontos de partida gerais — a{" "}
                <Link to="/library" search={{}} className="font-semibold underline underline-offset-2">
                  biblioteca
                </Link>{" "}
                e os{" "}
                <Link to="/sandboxes" search={{}} className="font-semibold underline underline-offset-2">
                  laboratórios
                </Link>{" "}
                podem ajudar por tema.
              </p>
            ) : null}

            {/* Próximas ações com motivo — sempre ignoráveis (D9) */}
            <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
              <p className="flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                <Map className="size-4 text-primary" /> O que fazer a seguir
              </p>
              {visibleRecs.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Faça uma tarefa ou abra um laboratório — as sugestões aparecem com atividade.
                </p>
              ) : (
                <ul className="flex flex-col gap-2 md:flex-row">
                  {visibleRecs.map((r, i) => (
                    <li key={i} className="flex-1">
                      <RecCard rec={r} />
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">{TIME_BUDGET[timeBudget].note}</p>
            </div>
          </div>
        )}
      </section>

      {/* SELEÇÃO EDITORIAL CURTA — o acervo completo mora na biblioteca.
          Na 1ª visita as portas já estão na mesa de trabalho (sem duplicar). */}
      {home.mode === "returning" ? (
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Compass className="size-4 text-primary" />
            Três problemas para começar pelo reconhecível
          </div>
          <Link
            to="/library"
            search={{}}
            className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            Biblioteca completa ({CONCEPTS.length} conceitos · {CONCEPTS.filter((c) => hasLesson(c.id)).length} com aula) →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {PROBLEM_DOORS.map((door) => (
            <Link
              key={door.conceptId}
              to="/concepts/$id"
              params={{ id: String(door.conceptId) }}
              className="rounded-xl border border-border/60 bg-card/50 p-4 transition-colors hover:border-primary/40"
            >
              <div className="text-sm font-bold text-foreground">{door.title}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{door.desc}</p>
            </Link>
          ))}
        </div>
      </section>
      ) : null}

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        VibeCoder Academy — ateliê de aprendizagem aplicada. Progresso medido em
        decisões, não em checklists.
      </footer>
    </div>
  );
}
