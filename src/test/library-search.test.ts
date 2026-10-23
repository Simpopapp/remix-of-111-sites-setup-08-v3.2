// F2 (PRD project3 §8.2): motivo da relevância, correspondência fraca
// rotulada, filtros de tipo/profundidade, cobertura honesta e vazio orientado.

import { describe, expect, it } from "vitest";
import { CONCEPTS } from "@/lib/concepts";
import { LESSON_COVERAGE } from "@/lib/lessons/coverage";
import { MISSIONS } from "@/lib/missions";
import { LABS } from "@/lib/labs";
import {
  emptyAdvice,
  searchLibrary,
  type LibraryResult,
} from "@/lib/library-search";

const deepId = LESSON_COVERAGE[0]!;
const referenceId = CONCEPTS.find((c) => !LESSON_COVERAGE.includes(c.id))!.id;

describe("searchLibrary — motivo da relevância (F2)", () => {
  it("com consulta ativa, todo resultado tem motivo não vazio", () => {
    const results = searchLibrary({ q: "queue growing" });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.reason, `resultado ${r.key} sem motivo`).not.toBe("");
    }
  });

  it("correspondência por sintoma cita o lead e aponta o banco de ensaio", () => {
    const results = searchLibrary({ q: "queue growing" });
    const concept = results.find((r) => r.kind === "concept" && r.reasonSource === "sintoma");
    expect(concept).toBeDefined();
    expect(concept!.reason).toContain("Corresponde por sintoma");
    expect(concept!.reason).toContain("Compare arrival and processing rates");
    const lab = results.find((r) => r.kind === "lab");
    expect(lab?.key).toBe("lab-pubsub");
  });

  it("correspondência fraca é rotulada e vem depois das fortes", () => {
    const results = searchLibrary({ q: "traffic" });
    const weakResults = results.filter((r) => r.weak);
    expect(weakResults.length).toBeGreaterThan(0);
    for (const r of weakResults) {
      expect(r.reason).toContain("Correspondência fraca");
    }
    const firstWeak = results.findIndex((r) => r.weak);
    const lastStrong = results.reduce(
      (acc, r, i) => (!r.weak ? i : acc),
      -1,
    );
    expect(lastStrong).toBeLessThan(firstWeak);
  });

  it("correspondência por tema não é apresentada como diagnóstico", () => {
    const results = searchLibrary({ q: "traffic" });
    const weak = results.filter((r) => r.weak) as LibraryResult[];
    for (const r of weak) {
      expect(r.reason).toMatch(/só o tema/);
    }
  });
});

describe("searchLibrary — filtros (F2)", () => {
  it("filtro de tipo devolve só a experiência pedida", () => {
    for (const r of searchLibrary({ q: "", type: "lab" })) {
      expect(r.kind).toBe("lab");
    }
    for (const r of searchLibrary({ q: "", type: "mission" })) {
      expect(r.kind).toBe("mission");
    }
  });

  it("filtro de profundidade restringe a conceitos com a profundidade pedida", () => {
    const deep = searchLibrary({ q: "", depth: "deep" });
    expect(deep.length).toBeGreaterThan(0);
    for (const r of deep) {
      expect(r.kind).toBe("concept");
      expect(r.coverageTone === "deep" || r.coverageTone === "unreviewed").toBe(true);
    }
    const quick = searchLibrary({ q: "", depth: "quick" });
    for (const r of quick) {
      expect(r.coverageTone).toBe("reference");
    }
  });

  it("filtro por tema respeita a categoria do conceito", () => {
    for (const r of searchLibrary({ q: "", cat: "Database" })) {
      if (r.kind === "concept") expect(r.theme).toBe("Database");
      else expect(r.kind).not.toBe("concept");
    }
  });
});

describe("searchLibrary — cobertura honesta (F2)", () => {
  it("conceito com lição revisada é aula estruturada; sem lição é referência rápida", () => {
    const deep = searchLibrary({ q: String(deepId) }).find((r) => r.key === `concept-${deepId}`);
    expect(deep?.coverage).toMatch(/Aula/);
    const reference = searchLibrary({ q: String(referenceId) }).find(
      (r) => r.key === `concept-${referenceId}`,
    );
    expect(reference?.coverage).toBe("Referência rápida");
  });

  it("labs e missões declaram a experiência que entregam", () => {
    const all = searchLibrary({ q: "" });
    for (const r of all) {
      if (r.kind === "lab") expect(r.coverage).toBe("Laboratório");
      if (r.kind === "mission") expect(r.coverage).toBe("Missão investigativa");
    }
  });

  it("o acervo completo lista conceitos, labs e missões juntos", () => {
    const all = searchLibrary({ q: "" });
    expect(all.filter((r) => r.kind === "concept")).toHaveLength(CONCEPTS.length);
    expect(all.filter((r) => r.kind === "lab")).toHaveLength(Object.keys(LABS).length);
    expect(all.filter((r) => r.kind === "mission")).toHaveLength(MISSIONS.length);
  });

  it("card de missão usa o problema, sem revelar o padrão-resposta", () => {
    const mission = MISSIONS[0]!;
    const result = searchLibrary({ q: mission.problem.slice(0, 20) }).find(
      (r) => r.key === `mission-${mission.slug}`,
    );
    expect(result?.problem).toBe(mission.problem);
  });
});

describe("emptyAdvice — vazio orientado (F2)", () => {
  it("consulta parecida com sintoma sugere o sintoma mais próximo", () => {
    const advice = emptyAdvice("slow");
    expect(advice.symptomHint).toBeDefined();
    expect(advice.message).toContain("sintoma");
  });

  it("consulta sem correspondência orienta reformular e oferece temas", () => {
    const advice = emptyAdvice("zzzzqqq");
    expect(advice.message.length).toBeGreaterThan(0);
    expect(advice.categories.length).toBeGreaterThan(0);
  });

  it("sem consulta, orienta explorar por tema ou sintoma", () => {
    const advice = emptyAdvice("");
    expect(advice.message).toContain("tema");
  });
});
