import { describe, expect, it } from "vitest";
import type { LearningState } from "@/lib/learning";
import { computeHomeState } from "@/lib/next-action";
import { objectiveRouteStatus } from "@/lib/recommend";
import { getTask } from "@/lib/exercises-data";

// Contratos da mesa de trabalho (PRD project3 F1/D9). Um teste por regra,
// valores concretos — nunca snapshot de apresentação.

const NEUTRAL_NOW = 1_800_000_000_000;

function emptyState(): LearningState {
  return {
    contact: {},
    attempts: [],
    reviews: [],
    application: {},
    missions: {},
    objective: undefined,
  } as unknown as LearningState;
}

describe("computeHomeState (mesa de trabalho)", () => {
  it("primeira visita: sem nenhum dado, modo first-visit sem ação primária", () => {
    const s = computeHomeState(emptyState(), []);
    expect(s.mode).toBe("first-visit");
    expect(s.primary).toBeUndefined();
  });

  it("missão ativa é a ação primária, com a etapa atual como ponto de retomada", () => {
    const state = emptyState();
    state.contact = { "15": NEUTRAL_NOW - 1000 };
    const home = computeHomeState(
      state,
      [{ slug: "charged-but-lost", title: "The charge went through", stepTitle: "Form a hypothesis", pendingConceptIds: [] }],
      NEUTRAL_NOW,
    );
    expect(home.mode).toBe("returning");
    expect(home.primary?.kind).toBe("mission");
    expect(home.primary?.to).toBe("/missions/$slug");
    expect(home.primary?.params?.["slug"]).toBe("charged-but-lost");
    expect(home.primary?.context).toContain("Form a hypothesis");
  });

  it("sem missão, revisão vencida tem prioridade sobre a última aula", () => {
    const state = emptyState();
    state.contact = { "15": NEUTRAL_NOW - 1000 };
    const task = getTask("t-11-predict")!;
    state.reviews = [{ taskId: task.id, dueTs: NEUTRAL_NOW - 100, doneTs: undefined } as never];
    const home = computeHomeState(state, [], NEUTRAL_NOW);
    expect(home.primary?.kind).toBe("review");
    expect(home.reviewCount).toBe(1);
  });

  it("apenas contato: ação primária é a última aula, com rótulo honesto de cobertura", () => {
    const state = emptyState();
    state.contact = { "6": NEUTRAL_NOW - 5000, "11": NEUTRAL_NOW - 1000 };
    const home = computeHomeState(state, [], NEUTRAL_NOW);
    expect(home.primary?.kind).toBe("lesson");
    expect(home.primary?.params?.["id"]).toBe("11");
    expect(home.primary?.context).toMatch(/aula estruturada|referência rápida/);
  });

  it("nada interrompido com prática anterior: allDone, sugere experimento", () => {
    const state = emptyState();
    state.attempts = [{ conceptId: 11, outcome: "met" } as never];
    const home = computeHomeState(state, [], NEUTRAL_NOW);
    expect(home.allDone).toBe(true);
    expect(home.primary?.kind).toBe("lab");
  });

  it("secundários nunca competem: no máximo 2, sem duplicar o primário", () => {
    const state = emptyState();
    state.contact = { "11": NEUTRAL_NOW - 1000 };
    state.reviews = [
      { taskId: "t-11-predict", dueTs: NEUTRAL_NOW - 100, doneTs: undefined } as never,
    ];
    const home = computeHomeState(state, [], NEUTRAL_NOW);
    expect(home.primary?.kind).toBe("review");
    expect(home.secondary.length).toBeLessThanOrEqual(2);
    expect(home.secondary.some((a) => a.kind === "review")).toBe(false);
  });
});

describe("objectiveRouteStatus (D9 — admissão honesta)", () => {
  it("sem objetivo: status none (a home não inventa correspondência)", () => {
    expect(objectiveRouteStatus(undefined)).toBe("none");
    expect(objectiveRouteStatus("   ")).toBe("none");
  });

  it("objetivo com palavra-chave de percurso: matched", () => {
    expect(objectiveRouteStatus("stop losing charges on retry")).toBe("matched");
  });

  it("objetivo sem correspondência: unmatched — a home deve admitir, não cair no 1º percurso", () => {
    expect(objectiveRouteStatus("melhorar o onboarding do meu app")).toBe("unmatched");
  });
});
