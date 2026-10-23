import { describe, expect, it } from "vitest";
import { MISSIONS, getMission } from "@/lib/missions";
import { getTask } from "@/lib/exercises-data";
import { SANDBOXES } from "@/lib/simulators";

const words = (s: string) => s.trim().split(/\s+/).length;
const SPOILER = /idempoten|idempotency/i;
const LABS = SANDBOXES.map((s) => s.id);

describe("missions — contrato e etapas", () => {
  it("5 missões com os slugs esperados (D10/D16)", () => {
    expect(MISSIONS.map((m) => m.slug)).toEqual([
      "charged-but-lost",
      "slow-catalog",
      "orders-pile-up",
      "breaking-change",
      "metric-moved",
    ]);
  });

  it("charged-but-lost: ordem briefing, predict, experiment, decide, transfer, dossier", () => {
    expect(getMission("charged-but-lost")!.steps.map((s) => s.kind)).toEqual([
      "briefing",
      "predict",
      "experiment",
      "decide",
      "transfer",
      "dossier",
    ]);
  });

  it("slow-catalog: ordem briefing, experiment, decide, experiment, transfer, dossier", () => {
    expect(getMission("slow-catalog")!.steps.map((s) => s.kind)).toEqual([
      "briefing",
      "experiment",
      "decide",
      "experiment",
      "transfer",
      "dossier",
    ]);
  });

  it("slow-catalog usa as bancadas nplusone e tail", () => {
    const labs = getMission("slow-catalog")!
      .steps.filter((s) => s.kind === "experiment")
      .map((s) => s.labId);
    expect(labs).toEqual(["nplusone", "tail"]);
  });

  it("orders-pile-up: ordem briefing, predict, experiment, decide, transfer, dossier", () => {
    expect(getMission("orders-pile-up")!.steps.map((s) => s.kind)).toEqual([
      "briefing",
      "predict",
      "experiment",
      "decide",
      "transfer",
      "dossier",
    ]);
  });

  it("orders-pile-up usa a bancada pubsub no experimento", () => {
    const labs = getMission("orders-pile-up")!
      .steps.filter((s) => s.kind === "experiment")
      .map((s) => s.labId);
    expect(labs).toEqual(["pubsub"]);
  });

  it("breaking-change e metric-moved: 6 steps, experiment sem bancada (§12.4/§12.5)", () => {
    for (const slug of ["breaking-change", "metric-moved"]) {
      const m = getMission(slug)!;
      expect(m.steps.map((s) => s.kind)).toEqual([
        "briefing",
        "predict",
        "experiment",
        "decide",
        "transfer",
        "dossier",
      ]);
      for (const s of m.steps.filter((x) => x.kind === "experiment")) {
        expect(s.labId, `${slug}: experimento sem bancada`).toBeUndefined();
      }
    }
  });

  it.each(MISSIONS)("$slug: ids únicos, body ≤ 120 palavras, evidência textual", (m) => {
    const ids = m.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of m.steps) {
      expect(s.title.trim()).not.toBe("");
      expect(words(s.body)).toBeLessThanOrEqual(120);
      expect(s.needsEvidence ?? "").not.toMatch(/screenshot/i);
    }
  });

  it.each(MISSIONS)("$slug: taskId e labId referenciados existem", (m) => {
    for (const s of m.steps) {
      if (s.taskId) expect(getTask(s.taskId), s.taskId).toBeDefined();
      if (s.labId) expect(LABS).toContain(s.labId);
      if (["predict", "decide", "transfer"].includes(s.kind)) expect(s.taskId).toBeDefined();
      if (s.kind === "experiment" && s.labId) expect(LABS).toContain(s.labId);
    }
  });

  it("tipos das tarefas casam com o kind", () => {
    const type = (slug: string, kind: string) =>
      getTask(getMission(slug)!.steps.find((s) => s.kind === kind)!.taskId!)!.type;
    expect(type("charged-but-lost", "predict")).toBe("predict");
    expect(type("charged-but-lost", "decide")).toBe("compare");
    expect(type("charged-but-lost", "transfer")).toBe("variant");
    expect(type("slow-catalog", "decide")).toBe("compare");
    expect(type("slow-catalog", "transfer")).toBe("variant");
    expect(type("orders-pile-up", "predict")).toBe("predict");
    expect(type("orders-pile-up", "decide")).toBe("compare");
    expect(type("orders-pile-up", "transfer")).toBe("variant");
    expect(type("breaking-change", "predict")).toBe("predict");
    expect(type("breaking-change", "decide")).toBe("compare");
    expect(type("breaking-change", "transfer")).toBe("variant");
    expect(type("metric-moved", "predict")).toBe("predict");
    expect(type("metric-moved", "decide")).toBe("choose-info");
    expect(type("metric-moved", "transfer")).toBe("variant");
  });
});

describe("missions — sem spoiler e transferência com domínio trocado", () => {
  it("nenhum body antes do step decide cita idempotência", () => {
    const steps = getMission("charged-but-lost")!.steps;
    const cut = steps.findIndex((s) => s.kind === "decide");
    for (const s of steps.slice(0, cut)) expect(s.body + s.title).not.toMatch(SPOILER);
  });

  it("slow-catalog não revela invalidação/TTL antes do decide", () => {
    const steps = getMission("slow-catalog")!.steps;
    const cut = steps.findIndex((s) => s.kind === "decide");
    for (const s of steps.slice(0, cut)) expect(s.body).not.toMatch(/invalidat|ttl/i);
  });

  it("orders-pile-up não revela backpressure antes do decide", () => {
    const steps = getMission("orders-pile-up")!.steps;
    const cut = steps.findIndex((s) => s.kind === "decide");
    for (const s of steps.slice(0, cut)) expect(s.body).not.toMatch(/backpressure/i);
  });

  it("breaking-change não revela compatibilidade retroativa antes do decide", () => {
    const steps = getMission("breaking-change")!.steps;
    const cut = steps.findIndex((s) => s.kind === "decide");
    for (const s of steps.slice(0, cut)) expect(s.body).not.toMatch(/backward|forward compat|expand.?and.?contract/i);
  });

  it("metric-moved não revela SLI/SLO antes do decide", () => {
    const steps = getMission("metric-moved")!.steps;
    const cut = steps.findIndex((s) => s.kind === "decide");
    for (const s of steps.slice(0, cut)) expect(s.body).not.toMatch(/\bsli\b|\bslo\b|error budget/i);
  });

  it("predict vem antes do experimento (perturbação só após a previsão)", () => {
    for (const m of MISSIONS) {
      const k = m.steps.map((s) => s.kind);
      expect(k.indexOf("predict"), m.slug).toBeLessThan(k.indexOf("experiment"));
    }
  });

  it("transfer da missão 1 não usa vocabulário de pagamento", () => {
    const s = getMission("charged-but-lost")!.steps.find((x) => x.kind === "transfer")!;
    const task = getTask(s.taskId!)!;
    const text = `${s.title} ${s.body} ${task.prompt} ${task.context ?? ""}`;
    expect(text).not.toMatch(/pay|pagament|charge|bill|card|checkout/i);
  });

  it("transfer da missão 2 troca o domínio (feed, sem 'catalog')", () => {
    const s = getMission("slow-catalog")!.steps.find((x) => x.kind === "transfer")!;
    expect(`${s.body} ${getTask(s.taskId!)!.context}`).not.toMatch(/catalog/i);
    expect(s.body).toMatch(/feed/i);
  });

  it("transfer da missão 3 troca o domínio (arquivos, sem fila da loja como cenário)", () => {
    const s = getMission("orders-pile-up")!.steps.find((x) => x.kind === "transfer")!;
    expect(`${s.body} ${getTask(s.taskId!)!.context}`).not.toMatch(/order/i);
    expect(s.body).toMatch(/file/i);
  });

  it("transfer da missão 4 troca o domínio (cenário da tarefa é schema, não API)", () => {
    const s = getMission("breaking-change")!.steps.find((x) => x.kind === "transfer")!;
    expect(getTask(s.taskId!)!.context).not.toMatch(/\bapi\b|endpoint|client/i);
    expect(s.body).toMatch(/schema/i);
  });

  it("transfer da missão 5 troca o domínio (cenário da tarefa é pipeline de conteúdo)", () => {
    const s = getMission("metric-moved")!.steps.find((x) => x.kind === "transfer")!;
    expect(getTask(s.taskId!)!.context).not.toMatch(/checkout|store/i);
    expect(s.body).toMatch(/pipeline/i);
  });

  it("dossiês mencionam a revisão de 72h", () => {
    for (const m of MISSIONS) {
      expect(m.steps.at(-1)!.kind).toBe("dossier");
      expect(m.steps.at(-1)!.body).toMatch(/72 hours/);
    }
  });
});
