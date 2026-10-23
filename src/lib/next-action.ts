// Estado da mesa de trabalho (PRD project3 D9/F1). Função pura: a home decide
// o MODO da sessão e a ação realmente interrompida — nunca três cards de peso
// igual competindo (planejamento §8.1). Componentes só renderizam o retorno.

import type { LearningState } from "@/lib/learning";
import { CONCEPTS } from "@/lib/concepts";
import { hasLesson } from "@/lib/lessons";
import type { MissionHint } from "@/lib/recommend";

export type HomeActionKind = "mission" | "review" | "lesson" | "lab" | "progress";

export interface HomeAction {
  kind: HomeActionKind;
  /** Rota TanStack; rotas dinâmicas usam `params`. */
  to: string;
  params?: Record<string, string>;
  /** O que fazer — ação concreta. */
  title: string;
  /** Ponto de retomada real: etapa, contexto ou último estado. */
  context: string;
}

export interface HomeState {
  mode: "first-visit" | "returning";
  /** A atividade interrompida, em destaque único (ou undefined na 1ª visita). */
  primary?: HomeAction;
  /** Apoios secundários — nunca competem com o primário. */
  secondary: HomeAction[];
  /** Recuperações agendadas e vencidas (sem fila punitiva na apresentação). */
  reviewCount: number;
  /** Nada interrompido: sugerir experimento e progresso, sem inventar tarefa. */
  allDone: boolean;
}

const conceptName = new Map(CONCEPTS.map((c) => [c.id, c.name]));

export function computeHomeState(
  state: LearningState,
  hints: MissionHint[],
  now: number = Date.now(),
): HomeState {
  const reviewCount = state.reviews.filter(
    (r) => r.doneTs === undefined && r.dueTs <= now,
  ).length;

  const firstVisit =
    Object.keys(state.contact).length === 0 &&
    state.attempts.length === 0 &&
    Object.keys(state.application).length === 0 &&
    Object.keys(state.missions).length === 0 &&
    state.objective === undefined;

  if (firstVisit) {
    return { mode: "first-visit", secondary: [], reviewCount, allDone: false };
  }

  // 1) Missão ativa: o raciocínio em curso é a interrupção mais relevante.
  const hint = hints[0];
  if (hint) {
    return {
      mode: "returning",
      primary: {
        kind: "mission",
        to: "/missions/$slug",
        params: { slug: hint.slug },
        title: hint.title,
        context: `Etapa atual: ${hint.stepTitle}`,
      },
      secondary: buildSecondary(state, { skipReview: false, reviewCount, now }),
      reviewCount,
      allDone: false,
    };
  }

  // 2) Revisão pendente antes de abrir assunto novo (retenção — §14.4).
  if (reviewCount > 0) {
    return {
      mode: "returning",
      primary: {
        kind: "review",
        to: "/progress",
        title: `Revisão pendente — ${reviewCount} ${reviewCount === 1 ? "recuperação" : "recuperações"}`,
        context: "Responder sem ver a solução é a evidência de retenção; atraso não apaga o que já foi demonstrado.",
      },
      secondary: buildSecondary(state, { skipReview: true, reviewCount, now }),
      reviewCount,
      allDone: false,
    };
  }

  // 3) Última aula aberta, com contexto honesto (aula profunda ou referência).
  const contactEntries = Object.entries(state.contact);
  if (contactEntries.length > 0) {
    const [id, ts] = contactEntries.reduce((a, b) => (Number(b[1]) > Number(a[1]) ? b : a));
    const conceptId = Number(id);
    const name = conceptName.get(conceptId) ?? `#${conceptId}`;
    const deep = hasLesson(conceptId);
    return {
      mode: "returning",
      primary: {
        kind: "lesson",
        to: "/concepts/$id",
        params: { id: String(conceptId) },
        title: `#${conceptId} ${name}`,
        context: `Aberta em ${new Date(Number(ts)).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} · ${deep ? "aula estruturada" : "referência rápida"}`,
      },
      secondary: buildSecondary(state, { skipReview: false, reviewCount, now }),
      reviewCount,
      allDone: false,
    };
  }

  // 4) Nada interrompido: experimento e progresso — sem tarefa inventada.
  return {
    mode: "returning",
    primary: {
      kind: "lab",
      to: "/sandboxes",
      title: "Fazer um experimento",
      context: "Nenhuma atividade interrompida — prever antes de observar é onde o progresso honesto começa.",
    },
    secondary: buildSecondary(state, { skipReview: false, reviewCount, now }),
    reviewCount,
    allDone: true,
  };
}

function buildSecondary(
  state: LearningState,
  opts: { skipReview: boolean; reviewCount: number; now: number },
): HomeAction[] {
  const out: HomeAction[] = [];
  if (!opts.skipReview && opts.reviewCount > 0) {
    out.push({
      kind: "review",
      to: "/progress",
      title: "Revisão pendente",
      context: `${opts.reviewCount} ${opts.reviewCount === 1 ? "recuperação" : "recuperações"} agendadas`,
    });
  }
  out.push({
    kind: "lab",
    to: "/sandboxes",
    title: "Executar um laboratório",
    context: "Comparar configurações sob a mesma condição",
  });
  out.push({
    kind: "progress",
    to: "/progress",
    title: "Ver o progresso",
    context: "Seis dimensões com denominador rotulado",
  });
  return out.slice(0, 2);
}
