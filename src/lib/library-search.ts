// Busca da biblioteca (PRD project3 F2 / §8.2). Módulo puro, testável sem DOM:
// cada resultado explica POR QUE corresponde à consulta (motivo da
// relevância) e que tipo de experiência entrega. Correspondência fraca (só
// tema ou número) é rotulada e nunca apresentada como diagnóstico.

import type { Category } from "@/lib/concepts";
import { CONCEPTS } from "@/lib/concepts";
import { LABS } from "@/lib/labs";
import { MISSIONS } from "@/lib/missions";
import { hasLesson } from "@/lib/lessons";
import type { Lesson } from "@/lib/lessons/types";
import { matchSymptoms, type SymptomEntry } from "@/lib/symptoms";

export type LibraryKind = "concept" | "lab" | "mission";
export type CoverageTone = "deep" | "unreviewed" | "reference" | "lab" | "mission";
export type ReasonSource =
  | "sintoma"
  | "nome"
  | "problema"
  | "ação"
  | "conteúdo"
  | "número"
  | "tema";

export interface LibraryResult {
  key: string;
  kind: LibraryKind;
  href: string;
  title: string;
  /** Tema canônico (só conceitos têm categoria no catálogo). */
  theme?: Category | undefined;
  /** Problema reconhecível — primeira linha do card (analogia sai do resumo). */
  problem: string;
  /** O que o aluno aprende a fazer / o que pratica. */
  action: string;
  /** Representação real disponível (aula ou bancada), quando existe. */
  representation?: { kind: string; label: string; caption: string } | undefined;
  /** Rótulo honesto de cobertura (aula estruturada vs. referência vs. não revisado). */
  coverage: string;
  coverageTone: CoverageTone;
  /** Por que o item corresponde à consulta (vazio quando só navegando). */
  reason: string;
  reasonSource: ReasonSource;
  /** Correspondência fraca (só tema/número) — vai para o fim e é rotulada. */
  weak: boolean;
}

export interface LibraryFilters {
  q: string;
  cat?: Category | undefined;
  /** Tipo de experiência: conceitos, laboratórios ou missões. */
  type?: LibraryKind | undefined;
  /** Profundidade disponível; quando definido, restringe a conceitos. */
  depth?: "deep" | "quick" | undefined;
}

const INSTRUMENT_LABELS: Record<string, string> = {
  "request-flow": "fluxo de requisições",
  "latency-histogram": "histograma de latência",
  "state-machine": "máquina de estados",
  "event-track": "trilha de eventos",
  "query-explainer": "explicador de consulta",
  timeline: "linha do tempo",
  table: "tabela",
};

/** Pergunta editorial de cada categoria (§14.3 — não faixa de pills solta). */
export const CATEGORY_QUESTIONS: Record<Category, { question: string; blurb: string }> = {
  Traffic: {
    question: "Quando o volume de pedidos vira o problema — e quem decide quem passa?",
    blurb: "Entrada, filtro e roteamento: o sistema aceita, adia ou recusa — e essa decisão tem dono.",
  },
  Performance: {
    question: "Onde o tempo está indo — e o que você mediu antes de otimizar?",
    blurb: "Latência, custo por chamada e o que se repete sem necessidade.",
  },
  DevOps: {
    question: "Como o código chega à produção sem surpresa?",
    blurb: "Do commit ao deploy: empacotamento, orquestração e descoberta de serviços.",
  },
  Resilience: {
    question: "Quando uma dependência falha, o que o seu sistema faz?",
    blurb: "Falhar rápido, degradar com controle e se recuperar sem cobrar o dobro.",
  },
  Async: {
    question: "O que pode esperar — e o que acontece enquanto espera?",
    blurb: "Filas, eventos e o contrato entre quem produz e quem consome.",
  },
  Streaming: {
    question: "Como processar um fluxo contínuo sem estagnar?",
    blurb: "Janelas, ordenação e pressão contrária quando os dados não terminam.",
  },
  Database: {
    question: "Onde os dados moram — e quanto custa cada ida até eles?",
    blurb: "Consultas, índices, transações e o preço invisível do acesso repetido.",
  },
  Distributed: {
    question: "Várias máquinas, uma verdade: quem decide qual?",
    blurb: "Consenso, relógios e o que pode divergir sem ninguém perceber.",
  },
  Scaling: {
    question: "O que muda quando o dobro de clientes chega?",
    blurb: "Crescer não é multiplicar: gargalos mudam de lugar.",
  },
  Reliability: {
    question: "Como dizer “confiável” com números, não com intenção?",
    blurb: "Disponibilidade, SLOs e o que falha quando ninguém está olhando.",
  },
  Observability: {
    question: "O que você consegue responder sobre o sistema sem adivinhar?",
    blurb: "Métricas, logs e traces que respondem perguntas novas, não só as previstas.",
  },
  Security: {
    question: "Onde a entrada do usuário vira código ou decisão?",
    blurb: "Fronteiras de confiança, injeção e o menor privilégio que funciona.",
  },
  Networking: {
    question: "O que acontece entre o cliente e o seu servidor?",
    blurb: "DNS, TLS e cada salto onde a requisição pode se perder.",
  },
  Protocols: {
    question: "Como duas partes concordam em conversar?",
    blurb: "HTTP, WebSocket e o contrato que os dois lados assumem.",
  },
  SRE: {
    question: "Como operar o sistema no dia a dia sem apagar incêndio eterno?",
    blurb: "Alertas que valem acordar, postmortems sem culpados e capacidade medida.",
  },
};

const REASON_PRIORITY: ReasonSource[] = [
  "sintoma",
  "nome",
  "problema",
  "ação",
  "conteúdo",
  "número",
  "tema",
];

interface Match {
  source: ReasonSource;
  reason: string;
}

function combineReasons(matches: Match[]): { reason: string; source: ReasonSource; weak: boolean } {
  const sorted = [...matches].sort(
    (a, b) => REASON_PRIORITY.indexOf(a.source) - REASON_PRIORITY.indexOf(b.source),
  );
  const primary = sorted[0]!;
  let reason = primary.reason;
  if (sorted.length > 1) {
    const secondary = sorted[1]!;
    reason += `; também por ${secondary.source}`;
  }
  const weak = sorted.every((m) => m.source === "tema" || m.source === "número");
  return { reason, source: primary.source, weak };
}

function firstSentence(text: string): string {
  const m = text.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

function lessonFor(id: number): Lesson | undefined {
  return hasLesson(id) ? (LESSONS_BY_ID.get(id) ?? undefined) : undefined;
}

import { LESSONS } from "@/lib/lessons";
const LESSONS_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

function conceptResult(
  c: (typeof CONCEPTS)[number],
  matches: Match[],
): LibraryResult {
  const lesson = lessonFor(c.id);
  const coverageTone: CoverageTone = lesson
    ? lesson.provenance.reviewed
      ? "deep"
      : "unreviewed"
    : "reference";
  const coverage =
    coverageTone === "deep"
      ? "Aula estruturada"
      : coverageTone === "unreviewed"
        ? "Aula não revisada"
        : "Referência rápida";
  const combined = combineReasons(matches);
  return {
    key: `concept-${c.id}`,
    kind: "concept",
    href: `/concepts/${c.id}`,
    title: c.name,
    theme: c.cat,
    problem: firstSentence(c.risk),
    action: c.fix,
    representation: lesson
      ? {
          kind: lesson.representation.kind,
          label: INSTRUMENT_LABELS[lesson.representation.kind] ?? lesson.representation.kind,
          caption: lesson.representation.caption,
        }
      : undefined,
    coverage,
    coverageTone,
    reason: combined.reason,
    reasonSource: combined.source,
    weak: combined.weak,
  };
}

/**
 * Busca unificada do acervo (conceitos + laboratórios + missões). Quando
 * `depth` é definido, restringe a conceitos — a pergunta passa a ser sobre
 * profundidade de aula, não sobre experiência de bancada.
 */
export function searchLibrary(filters: LibraryFilters): LibraryResult[] {
  const needle = filters.q.toLowerCase().trim();
  const symptoms: SymptomEntry[] = needle ? matchSymptoms(filters.q) : [];
  const byConcept = new Map<number, SymptomEntry>();
  for (const s of symptoms) for (const id of s.conceptIds) byConcept.set(id, s);
  const symptomLabIds = new Set(symptoms.map((s) => s.labId).filter((id) => id != null));

  const includeKind = (k: LibraryKind) => !filters.type || filters.type === k;
  const restrictDepth = filters.depth != null;

  const results: { result: LibraryResult; priority: number }[] = [];
  const push = (result: LibraryResult) => {
    const priority = result.weak
      ? REASON_PRIORITY.length
      : REASON_PRIORITY.indexOf(result.reasonSource);
    results.push({ result, priority });
  };

  for (const c of CONCEPTS) {
    if (!includeKind("concept")) continue;
    if (filters.cat && c.cat !== filters.cat) continue;
    if (restrictDepth) {
      const deep = hasLesson(c.id);
      if ((filters.depth === "deep") !== deep) continue;
    }
    const matches: Match[] = [];
    if (needle) {
      if (c.name.toLowerCase().includes(needle)) {
        matches.push({ source: "nome", reason: `O nome “${c.name}” contém a busca` });
      }
      if (c.risk.toLowerCase().includes(needle)) {
        matches.push({ source: "problema", reason: "O problema descrito contém a busca" });
      }
      if (c.fix.toLowerCase().includes(needle)) {
        matches.push({ source: "ação", reason: "A ação aprendida contém a busca" });
      }
      const symptom = byConcept.get(c.id);
      if (symptom) {
        matches.push({
          source: "sintoma",
          reason: `Corresponde por sintoma: “${symptom.lead}”`,
        });
      }
      if (c.cat.toLowerCase().includes(needle)) {
        matches.push({ source: "tema", reason: `Correspondência fraca: só o tema “${c.cat}” contém a busca` });
      }
      if (String(c.id) === needle) {
        matches.push({ source: "número", reason: `Correspondência fraca: é o conceito nº ${c.id}` });
      }
      if (matches.length === 0) continue;
    }
    push(conceptResult(c, matches));
  }

  if (!restrictDepth) {
    for (const lab of Object.values(LABS)) {
      if (!includeKind("lab")) continue;
      const matches: Match[] = [];
      const symptom = symptoms.find((s) => s.labId === lab.id);
      if (symptom) {
        matches.push({ source: "sintoma", reason: `Corresponde por sintoma: “${symptom.lead}”` });
      }
      if (needle) {
        if (lab.title.toLowerCase().includes(needle)) {
          matches.push({ source: "nome", reason: `O nome “${lab.title}” contém a busca` });
        }
        if (lab.scenario.symptom.toLowerCase().includes(needle)) {
          matches.push({ source: "problema", reason: "O sintoma reproduzido na bancada contém a busca" });
        }
        if (lab.challenge.toLowerCase().includes(needle)) {
          matches.push({ source: "ação", reason: "O desafio da bancada contém a busca" });
        }
        if (matches.length === 0) continue;
      } else if (!symptom) {
        matches.push({ source: "tema", reason: "" });
      }
      const combined = combineReasons(matches.filter((m) => m.reason !== ""));
      push({
        key: `lab-${lab.id}`,
        kind: "lab",
        href: `/labs/${lab.id}`,
        title: lab.title,
        theme: undefined,
        problem: lab.scenario.symptom,
        action: lab.challenge,
        representation: {
          kind: lab.instrument.kind,
          label: INSTRUMENT_LABELS[lab.instrument.kind] ?? lab.instrument.kind,
          caption: lab.instrument.caption,
        },
        coverage: "Laboratório",
        coverageTone: "lab",
        reason: combined.reason,
        reasonSource: combined.source,
        weak: combined.weak,
      });
    }

    for (const mission of MISSIONS) {
      if (!includeKind("mission")) continue;
      const matches: Match[] = [];
      if (needle) {
        if (mission.title.toLowerCase().includes(needle)) {
          matches.push({ source: "nome", reason: `O título contém a busca` });
        }
        if (mission.problem.toLowerCase().includes(needle)) {
          matches.push({ source: "problema", reason: "O problema investigado contém a busca" });
        }
        if (mission.product.toLowerCase().includes(needle)) {
          matches.push({ source: "ação", reason: "O produto de aprendizagem contém a busca" });
        }
        if (matches.length === 0) continue;
      } else {
        matches.push({ source: "tema", reason: "" });
      }
      const combined = combineReasons(matches.filter((m) => m.reason !== ""));
      push({
        key: `mission-${mission.slug}`,
        kind: "mission",
        href: `/missions/${mission.slug}`,
        title: mission.title,
        theme: undefined,
        problem: mission.problem,
        action: mission.product,
        representation: undefined,
        coverage: "Missão investigativa",
        coverageTone: "mission",
        reason: combined.reason,
        reasonSource: combined.source,
        weak: combined.weak,
      });
    }
  }

  return results
    .sort((a, b) => a.priority - b.priority)
    .map((r) => r.result);
}

export interface EmptyAdvice {
  message: string;
  /** Sintoma próximo da consulta, quando houver (orientação, não diagnóstico). */
  symptomHint?: SymptomEntry | undefined;
  /** Temas sugeridos para explorar. */
  categories: Category[];
}

/** Vazio orientado (§8.2): ajuda a reformular em vez de culpar a busca. */
export function emptyAdvice(query: string): EmptyAdvice {
  const needle = query.toLowerCase().trim();
  const hint = needle ? matchSymptoms(query)[0] : undefined;
  return {
    message: needle
      ? "Nada corresponde a essa busca. Tente descrever o sintoma que você observa em produção (ex.: “fila cresce”, “p99”, “dependência falhando”), ou explore por tema."
      : "Escolha um tema para explorar, ou descreva um sintoma que você observou.",
    symptomHint: hint,
    categories: ["Traffic", "Database", "Resilience", "Observability"],
  };
}
