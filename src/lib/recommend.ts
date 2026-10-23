// Personalização leve e explicável (PRD project2 D9/D11). Função pura:
// recomendações com motivo OBRIGATÓRIO, ordenadas por prioridade contratada:
// 1) revisão pendente → 2) lacuna de pré-requisito de missão ativa →
// 3) próxima etapa do percurso → 4) desafio sem tentativa. Máximo 3 itens.

import type { LearningState } from "@/lib/learning";
import { CONCEPTS } from "@/lib/concepts";
import { TASKS, getTask } from "@/lib/exercises-data";

/** Dica de missão ativa, fornecida pela camada de missões (D10). */
export interface MissionHint {
  slug: string;
  title: string;
  stepTitle: string;
  /** Conceitos pré-requisito ainda sem demonstração para seguir a missão. */
  pendingConceptIds: number[];
}

export type RecommendationKind =
  | "review"
  | "mission-gap"
  | "route-step"
  | "challenge";

export interface Recommendation {
  kind: RecommendationKind;
  /** O que fazer — ação concreta, curta. */
  label: string;
  /** Motivo curto e específico (obrigatório — planejamento §13). */
  reason: string;
  href: string;
  conceptId?: number;
  taskId?: string;
}

/** Percursos exemplares do planejamento §8.3, limitados ao que já tem aulas. */
const ROUTES: { id: string; title: string; keywords: string[]; conceptIds: number[] }[] = [
  {
    id: "request-lost",
    title: "The request didn't finish",
    keywords: ["lost", "timeout", "retry", "idempotency", "uncertain", "cobran", "perdida"],
    conceptIds: [11, 12, 13, 14, 10],
  },
  {
    id: "page-slow",
    title: "The page got slow",
    keywords: ["slow", "lento", "latency", "n+1", "cache", "performance"],
    conceptIds: [27, 25, 26, 2, 91, 93],
  },
  {
    id: "work-accumulating",
    title: "Work is accumulating",
    keywords: ["queue", "fila", "backlog", "accumul", "dlq", "worker"],
    conceptIds: [15, 16, 17, 20],
  },
];

const conceptName = new Map(CONCEPTS.map((c) => [c.id, c.name]));

function routeFor(objective?: string) {
  const needle = (objective ?? "").toLowerCase();
  return (
    ROUTES.find((r) => r.keywords.some((k) => needle.includes(k))) ?? ROUTES[0]!
  );
}

/**
 * Status do objetivo contra os percursos (D9/F1): a home deve ADMITIR quando
 * não há correspondência — nunca encaminhar silenciosamente para o primeiro
 * percurso. "none" = sem objetivo declarado.
 */
export function objectiveRouteStatus(
  objective?: string,
): "none" | "matched" | "unmatched" {
  const needle = (objective ?? "").trim().toLowerCase();
  if (!needle) return "none";
  return ROUTES.some((r) => r.keywords.some((k) => needle.includes(k)))
    ? "matched"
    : "unmatched";
}


/**
 * Recomendações ordenadas por prioridade (D9). Cada item traz motivo curto;
 * a UI pode exibi-lo e o aluno pode ignorá-lo (planejamento §13).
 */
export function recommendNext(
  state: LearningState,
  objective?: string,
  opts?: { now?: number; missionHints?: MissionHint[]; limit?: number },
): Recommendation[] {
  const now = opts?.now ?? Date.now();
  const limit = opts?.limit ?? 3;
  const out: Recommendation[] = [];

  // 1) Revisão pendente (retenção — planejamento §14.4). Sem fila punitiva.
  const due = state.reviews
    .filter((rv) => rv.doneTs === undefined && rv.dueTs <= now)
    .sort((a, b) => a.dueTs - b.dueTs);
  for (const rv of due) {
    if (out.length >= limit) break;
    const task = getTask(rv.taskId);
    if (!task) continue;
    out.push({
      kind: "review",
      taskId: task.id,
      conceptId: task.conceptId,
      label: `Retomar a variante de transferência de ${conceptName.get(task.conceptId) ?? `#${task.conceptId}`}`,
      reason:
        "Recuperação agendada: recontar o raciocínio depois do intervalo é a evidência de retenção — não reler o texto.",
      href: `/concepts/${task.conceptId}`,
    });
  }

  // 2) Lacuna de pré-requisito de missão ativa (D10).
  for (const hint of opts?.missionHints ?? []) {
    if (out.length >= limit) break;
    const gap = hint.pendingConceptIds.find(
      (id) => !state.attempts.some((a) => a.conceptId === id && a.outcome === "met"),
    );
    if (gap === undefined) continue;
    out.push({
      kind: "mission-gap",
      conceptId: gap,
      label: `Cobrir ${conceptName.get(gap) ?? `#${gap}`} antes de continuar ${hint.title}`,
      reason: `A etapa "${hint.stepTitle}" pressupõe esse mecanismo — uma lacuna aqui torna a próxima decisão chute.`,
      href: `/concepts/${gap}`,
    });
  }

  // 3) Próxima etapa do percurso (objetivo influencia qual percurso).
  const route = routeFor(objective);
  const routeGap = route.conceptIds.find((id) => {
    const attempts = state.attempts.filter((a) => a.conceptId === id);
    return !attempts.some(
      (a) => a.help <= 1 && Object.keys(a.criteria).length > 0 && Object.values(a.criteria).every(Boolean),
    );
  });
  if (routeGap !== undefined && out.length < limit) {
    out.push({
      kind: "route-step",
      conceptId: routeGap,
      label: `Continuar o percurso "${route.title}" em ${conceptName.get(routeGap) ?? `#${routeGap}`}`,
      reason: `Próxima etapa do percurso: cada conceito apoia o anterior — "${route.title}" se lê em ordem.`,
      href: `/concepts/${routeGap}`,
    });
  }

  // 4) Desafio sem tentativa (prática ainda não tocada).
  if (out.length < limit) {
    const untouched = TASKS.find(
      (t) => !state.attempts.some((a) => a.conceptId === t.conceptId),
    );
    if (untouched) {
      out.push({
        kind: "challenge",
        taskId: untouched.id,
        conceptId: untouched.conceptId,
        label: `Primeiro desafio em ${conceptName.get(untouched.conceptId) ?? `#${untouched.conceptId}`}`,
        reason: "Nenhuma tentativa ainda neste conceito — prever antes da explicação é onde o progresso honesto começa.",
        href: `/concepts/${untouched.conceptId}`,
      });
    }
  }

  return out.slice(0, limit);
}
