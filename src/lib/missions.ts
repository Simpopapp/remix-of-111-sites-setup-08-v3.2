// Contrato de missões integradas (PRD project2 D10). O contrato (tipos,
// slugs, pré-requisitos, derivação de hints) é fixado ANTES da onda de
// produção (F7/s7-missoes): esta onda preenche os steps e as rotas contra
// este contrato — sem mudar nomes, slugs ou a assinatura das funções.

import type { SandboxId } from "@/lib/simulators";
import type { MissionHint } from "@/lib/recommend";
import type { LearningState } from "@/lib/learning";

export type MissionStepKind =
  | "briefing"
  | "predict"
  | "experiment"
  | "decide"
  | "transfer"
  | "dossier";

export interface MissionStep {
  id: string;
  kind: MissionStepKind;
  title: string;
  body: string;
  /** Etapa de experimento reusa a bancada do /labs/$id. */
  labId?: SandboxId;
  /** Etapa de prática usa o motor de tarefas (D8). */
  taskId?: string;
  /** Evidência exigida para avançar (critério, nunca screenshot). */
  needsEvidence?: string;
}

export interface Mission {
  slug: string;
  title: string;
  /** Problema reconhecível (planejamento §9.1) — nunca revela o padrão. */
  problem: string;
  /** Produto de aprendizagem (planejamento §12). */
  product: string;
  /** Pré-requisitos canônicos; lacunas alimentam recommendNext (D11). */
  prereqConceptIds: number[];
  /** Variante de transferência com domínio trocado. */
  transferVariant: string;
  steps: MissionStep[];
}

/** Cenário recorrente: Loja Digital (planejamento §12). */
export const MISSIONS: Mission[] = [
  {
    slug: "charged-but-lost",
    title: "The charge went through, but the answer got lost",
    problem:
      "Digital Store: checkout calls the payment processor, the response is lost after the charge. What does the customer see — and what would you do?",
    product:
      "Annotated timeline, retry policy and the justified invariant that repeating the same operation never bills twice.",
    prereqConceptIds: [11, 12, 13, 14],
    transferVariant:
      "Apply the same reasoning to creating a document or order — the statement never mentions payment.",
    steps: [
      {
        id: "cbl-briefing",
        kind: "briefing",
        title: "The answer never arrived",
        body: "Digital Store: at checkout the app calls the payment processor. The customer's card may have been billed, but the app's wait ended before any response came back. The screen shows an error. Before reading any theory, write down two things: what the customer believes happened, and what you would do next as the store. Keep your answer; you will compare it with the evidence at the end.",
        needsEvidence:
          "A written first hypothesis covering what the customer sees and the action you would take.",
      },
      {
        id: "cbl-predict",
        kind: "predict",
        title: "Predict before you look",
        body: "Commit to a prediction about the timeout scenario before any experiment shows what happens. Consider who stopped waiting, who kept working, and what each side can know at that moment. You cannot change the answer after submitting it.",
        taskId: "t-11-predict",
        needsEvidence: "The prediction submitted, with the help level recorded.",
      },
      {
        id: "cbl-experiment",
        kind: "experiment",
        title: "Run the same operation twice",
        body: "Open the bench and trigger a failing dependency, then repeat the same customer action several times. Trace each attempt on a timeline: what the caller saw, what the processor may have done. Then redo the trace once with every repeat carrying the same operation identifier and once with a fresh identifier each time. Count how many times the customer could be billed in each trace.",
        labId: "circuit",
        needsEvidence:
          "A timeline of at least three attempts with the number of possible billings in each of the two traces.",
      },
      {
        id: "cbl-decide",
        kind: "decide",
        title: "Choose a repeat policy",
        body: "Pick the policy for repeating the checkout call. Your justification must protect this invariant: one purchase never produces an additional charge. More than one policy can satisfy it; the feedback explains what each one gives up.",
        taskId: "t-14-compare",
        needsEvidence:
          "A decision plus a sentence stating which invariant it preserves and why.",
      },
      {
        id: "cbl-transfer",
        kind: "transfer",
        title: "Same reasoning, new domain",
        body: "A collaborative editor lets users create a new document. The request times out, the user presses the button again. Apply what you concluded earlier to this situation without any hint about which mechanism matters. The nouns have changed; the question is whether your decision survives.",
        taskId: "t-14-variant",
        needsEvidence: "The variant answered independently, with the help level recorded.",
      },
      {
        id: "cbl-dossier",
        kind: "dossier",
        title: "Write the dossier",
        body: "Write the dossier: an annotated timeline of the lost response, the repeat policy you chose, and the invariant it preserves, plus one thing you got wrong or changed your mind about. Saving it records the mission. Because the transfer task was completed, a review of that variant is scheduled automatically about 72 hours later; answering it then shows whether the reasoning was retained.",
        needsEvidence:
          "Dossier text covering timeline, chosen policy, invariant and one change of mind.",
      },
    ],
  },
  {
    slug: "slow-catalog",
    title: "The catalog got slow — and sometimes shows stale data",
    problem:
      "Digital Store: the catalog page is slow and occasionally stale. The first hypothesis may be incomplete; the evidence separates slowness from staleness.",
    product:
      "Before/after comparison, a data-access decision and an update strategy proportional to the case.",
    prereqConceptIds: [27, 25, 26, 2, 91, 93],
    transferVariant:
      "A feed or directory with a different update pattern — the reasoning must survive the domain change.",
    steps: [
      {
        id: "sc-briefing",
        kind: "briefing",
        title: "Slow, and sometimes wrong",
        body: "Digital Store: the catalog page takes seconds to load, and a few customers report seeing an old price or a product that was already removed. Write your first hypothesis for the cause. It will be collected as is, not graded. Then say which complaint, slow or outdated, your hypothesis would fix, and whether it could fix both.",
        needsEvidence:
          "A written first hypothesis and which complaint(s) it would address.",
      },
      {
        id: "sc-experiment-access",
        kind: "experiment",
        title: "Compare how data is fetched",
        body: "In the bench, run the same page with one query per item, one batched query, and one JOIN. Vary the list size, the number of related rows per item and the round-trip cost. Record round trips and rows returned for each. The numbers are a didactic model, not a benchmark. Note what this evidence says about slowness and what it cannot say about outdated data.",
        labId: "nplusone",
        needsEvidence:
          "A table of three strategies with round trips and rows, and one sentence separating slowness from outdated data.",
      },
      {
        id: "sc-decide",
        kind: "decide",
        title: "Decide access and update",
        body: "Choose both how the page reads its data and how it keeps what it shows up to date. Treat the two as separate decisions and size them to this case. Several combinations are defensible; the feedback names what each one costs.",
        taskId: "t-27-compare",
        needsEvidence:
          "A decision for access and one for updates, each with a stated cost.",
      },
      {
        id: "sc-experiment-measure",
        kind: "experiment",
        title: "Which number answers the complaint?",
        body: "In the latency bench, compare the average with the highest percentiles for the same sample. Decide whether the improvement you expect would show up in the average, in the tail, or in both, and which measure answers the customer who says the page is sometimes slow. State the sample size limits of your conclusion.",
        labId: "tail",
        needsEvidence:
          "The chosen measure with a reason tied to the complaint and one stated limit of the sample.",
      },
      {
        id: "sc-transfer",
        kind: "transfer",
        title: "A different list",
        body: "A social feed shows posts with their authors. Posts arrive constantly, while author profiles rarely change. It also feels slow and occasionally shows outdated information. Decide what to do. The pattern of change differs from the page you studied, so a copied answer may not hold.",
        taskId: "t-27-variant",
        needsEvidence: "The variant answered independently, with the help level recorded.",
      },
      {
        id: "sc-dossier",
        kind: "dossier",
        title: "Write the before/after dossier",
        body: "Write the dossier: a before and after comparison, your data-access decision, your update strategy, and the measure you chose with its justification. Say whether your first hypothesis was incomplete and how. Saving records the mission, and a review of the transfer variant is scheduled automatically about 72 hours later.",
        needsEvidence:
          "Dossier text covering comparison, access decision, update strategy, chosen measure and the first hypothesis revisited.",
      },
    ],
  },
  {
    slug: "orders-pile-up",
    title: "The orders keep piling up",
    problem:
      "Digital Store: orders arrive faster than they finish, and the waiting queue keeps growing. What does the customer see, and what evidence would explain the delay?",
    product:
      "An evidence-backed explanation of the accumulation, a recovery plan, and a justified distinction between notifying subscribers and distributing work.",
    prereqConceptIds: [15, 16, 20, 44, 12],
    transferVariant:
      "Apply the reasoning to file processing when repeated delivery can produce duplicate results.",
    steps: [
      {
        id: "opu-briefing",
        kind: "briefing",
        title: "Accepted, but still waiting",
        body: "Digital Store: orders are accepted faster than they finish, and the waiting queue keeps growing. Customers see an order confirmation, but fulfillment status stays pending. Write your first hypothesis and what you would tell a waiting customer. Name one observation that would challenge your hypothesis. Your answer is collected as is, not graded; keep it to compare with the experiment.",
        needsEvidence:
          "A written first hypothesis, the customer-visible consequence, and one observation that could challenge the hypothesis.",
      },
      {
        id: "opu-predict",
        kind: "predict",
        title: "Predict the next queue state",
        body: "Submit your prediction before opening the bench. Track arrivals and completed work over the same interval, and say what you expect to happen to the waiting queue. Keep the original prediction so you can explain any difference between what you expected and what you observe.",
        taskId: "t-15-predict",
        needsEvidence:
          "The prediction submitted before experimentation, with the help level recorded.",
      },
      {
        id: "opu-experiment",
        kind: "experiment",
        title: "Same events, different causes",
        body: "Now compare the two delivery modes using the same published events and number of processing steps. Record who receives each event. In separate runs, apply a temporary failure, an invalid message, and a slow consumer. Record pending work, attempts, acknowledgements, and DLQ entries for each cause. Preserve each run's evidence before restarting. Compare the observations with your prediction. Which observations distinguish the causes, and which leave more than one explanation possible? These are model runs, not measurements of a real store.",
        labId: "pubsub",
        needsEvidence:
          "A comparison of recipients in both modes and a three-cause record of pending work, attempts, acknowledgements and DLQ entries, with one remaining uncertainty.",
      },
      {
        id: "opu-decide",
        kind: "decide",
        title: "Choose delivery and recovery",
        body: "Decide which recipients need an independent notification and which workers should share fulfillment work. Use the comparison task, then write a recovery plan tied to your observed cause: what to change, when to retry or replay held work, and how to check the result. Defend one alternative and its cost. Explain what would make you stop the recovery rather than keep adding attempts.",
        taskId: "t-16-compare",
        needsEvidence:
          "A delivery decision distinguishing notifications from shared work, plus a cause-specific recovery plan, verification, stop condition and alternative with a trade-off.",
      },
      {
        id: "opu-transfer",
        kind: "transfer",
        title: "Different files, same uncertainty",
        body: "A file-processing service receives repeated deliveries, and some deliveries overlap after a worker loses its acknowledgement. Choose how the service should behave without copying the store's delivery arrangement. Explain what counts as one file's completed work and what a repeat must not change.",
        taskId: "t-14-variant-2",
        needsEvidence:
          "The file-processing variant answered independently, with the help level recorded.",
      },
      {
        id: "opu-dossier",
        kind: "dossier",
        title: "Write the recovery dossier",
        body: "Write the dossier: your initial hypothesis, the observations supporting the cause, the recovery plan and its verification, and why notifying subscribers differs from distributing work. Include one alternative, its cost, and one uncertainty the bench cannot settle. Saving records the mission on this device. Completing the transfer variant with all criteria met automatically schedules a review about 72 hours later. That interval is an initial calibration hypothesis, not proof of retention.",
        needsEvidence:
          "Dossier text covering hypothesis, causal evidence, recovery and verification, notification versus work distribution, an alternative and a remaining uncertainty.",
      },
    ],
  },
  {
    slug: "breaking-change",
    title: "A change worked alone, but broke older clients",
    problem:
      "Digital Store: a new release passed its tests, but older app clients now fail. Which combinations still work, and in what order could the system change safely?",
    product:
      "A compatibility matrix, an argued sequence of changes, and an observable rollback condition.",
    prereqConceptIds: [102, 103, 81, 82],
    transferVariant:
      "Apply the compatibility and rollout decision to a database schema used by old and new application instances.",
    steps: [
      {
        id: "bc-briefing",
        kind: "briefing",
        title: "The tests passed",
        body: "Digital Store: the new release passed its tests with the newest app, but customers using an older app can no longer open their orders. Those customers cannot all update today. Write your first hypothesis and one assumption the successful tests may have left unchecked. Keep the hypothesis; it is collected, not graded.",
        needsEvidence:
          "A written first hypothesis and one compatibility assumption the successful tests may not have checked.",
      },
      {
        id: "bc-predict",
        kind: "predict",
        title: "Predict who can still connect",
        body: "Before inspecting the mission's contract examples, submit your prediction about how a contract change affects older clients. State which client assumptions matter and which combinations you would test. Do not treat a successful test with one client as evidence for every client.",
        taskId: "t-102-predict",
        needsEvidence:
          "The compatibility prediction submitted before inspecting the contract examples, with the help level recorded.",
      },
      {
        id: "bc-experiment",
        kind: "experiment",
        title: "Build the compatibility matrix",
        body: 'Now inspect two server contracts for GET /orders/7. Contract A returns {"id":7,"totalCents":1250}. Contract B returns {"id":7,"total":{"amount":1250,"currency":"USD"}}. The old client requires numeric totalCents and ignores other fields. The new client requires total.amount and total.currency and ignores other fields. Neither client has a fallback. Each server returns only its stated payload. Build a matrix with both clients as rows and both contracts as columns. Mark each combination as usable or broken and identify the exact requirement it satisfies or violates. These examples describe payload compatibility, not every possible release failure.',
        needsEvidence:
          "All four client-contract combinations marked usable or broken, with the exact required field and type explaining each result.",
      },
      {
        id: "bc-decide",
        kind: "decide",
        title: "Choose the order of change",
        body: "Choose a release approach that accounts for clients that cannot update today. Use your matrix to justify the order of server and client changes. State what evidence would allow an older contract to be retired, and an observable condition that would trigger rollback. Compare a defensible alternative and its maintenance or coordination cost. Check that rolling back the server would still serve clients already released.",
        taskId: "t-102-compare",
        needsEvidence:
          "A release decision, justified change order, retirement evidence, observable rollback condition and compatibility check for clients already released, plus an alternative's cost.",
      },
      {
        id: "bc-transfer",
        kind: "transfer",
        title: "The contract is now a schema",
        body: "A database schema must change while older and newer application instances coexist. Apply your reasoning to the schema variant. Decide what each instance can read or write during the transition, and what must remain true if the application release is rolled back. The storage contract has changed; copying the endpoint answer is not enough.",
        taskId: "t-82-variant",
        needsEvidence:
          "The schema variant answered independently, with the help level recorded.",
      },
      {
        id: "bc-dossier",
        kind: "dossier",
        title: "Write the compatibility dossier",
        body: "Write the dossier: the four-cell compatibility matrix, your argued order of changes, the evidence needed before retiring old behavior, and the condition for rollback. Explain whether rollback remains compatible with clients already released. Revisit the assumption in your first hypothesis. Saving records the mission on this device. Completing the transfer variant with all criteria met automatically schedules a review about 72 hours later; this interval is an initial calibration hypothesis.",
        needsEvidence:
          "Dossier text containing the matrix, justified change order, retirement evidence, rollback condition and compatibility, and the first hypothesis revisited.",
      },
    ],
  },
  {
    slug: "metric-moved",
    title: "The metric changed; we do not yet know why",
    problem:
      "Digital Store: checkout completion fell yesterday, apparently without a code change. Which hypotheses do the available signals support, and what should be checked before acting?",
    product:
      "A short investigation dossier connecting facts, competing hypotheses, selected evidence, action, verification and learning without hiding uncertainty.",
    prereqConceptIds: [58, 60, 61, 63, 109, 111],
    transferVariant:
      "Apply the investigation and post-incident reasoning to a content pipeline rather than checkout.",
    steps: [
      {
        id: "mm-briefing",
        kind: "briefing",
        title: "A change without a release",
        body: "Digital Store: yesterday's checkout completion rate fell, although nobody reports changing the code. Customers may be abandoning checkout or encountering failures; the headline number does not say which. Write two competing hypotheses and one observation that would help distinguish them. Treat the claim about code changes as unverified context, not proof that the system stayed unchanged.",
        needsEvidence:
          "Two competing hypotheses and an observation that could distinguish them, without treating the reported absence of a release as established fact.",
      },
      {
        id: "mm-predict",
        kind: "predict",
        title: "Predict what the summary hides",
        body: "Before inspecting the evidence bundle, predict what a time window or aggregation could hide. Say which groups or intervals you would want to compare and why the overall number might differ from their individual behavior. Submit the prediction before looking for a cause.",
        taskId: "t-61-predict",
        needsEvidence:
          "The aggregation prediction submitted before inspecting the evidence bundle, with the help level recorded.",
      },
      {
        id: "mm-experiment",
        kind: "experiment",
        title: "Three signals, different limits",
        body: "Now inspect this synthetic evidence bundle. Metric chart, daily completions/starts: Monday 900/1000 (90%); Tuesday 1600/2000 (80%). Hourly and client breakdowns are unavailable. Error log: Tuesday 14:03 UTC, order o-731, inventory lookup timed out; retry outcome absent. No baseline error count is supplied. Trace: order o-844 at 14:04 UTC completed in 620 ms, including a 410 ms inventory span; sampling policy unknown. Map each signal to your competing hypotheses. Which observation supports a hypothesis, which could challenge it, and what does neither establish? Distinguish a rate change from a change in completed-order count.",
        needsEvidence:
          "Competing hypotheses mapped to the metric, log and trace, with what each supports or challenges, what each cannot prove, and the rate-versus-count distinction.",
      },
      {
        id: "mm-decide",
        kind: "decide",
        title: "Ask before acting",
        body: "Choose the next information to request before changing the system. Explain which competing hypotheses it would separate, what result would change your next action, and what you would do if it remained inconclusive. Use the information-choice task, then state a proportionate provisional action and a verification measure. Do not promote a single order's outcome into a claim about every customer.",
        taskId: "t-58-choose-info",
        needsEvidence:
          "An information request tied to competing hypotheses, a result-dependent next action, an inconclusive-result plan and a verification measure.",
      },
      {
        id: "mm-transfer",
        kind: "transfer",
        title: "Investigate a different pipeline",
        body: "Move to a content pipeline where items pass through submission, processing and publication. Complete the post-incident variant using evidence rather than a familiar checkout story. Separate what happened from why you think it happened, choose a follow-up that can be checked, and name what remains unknown without assigning blame.",
        taskId: "t-111-variant",
        needsEvidence:
          "The post-incident variant in a different domain answered independently, with the help level recorded.",
      },
      {
        id: "mm-dossier",
        kind: "dossier",
        title: "Write the investigation dossier",
        body: "Write a short dossier: fact → competing hypotheses → chosen evidence → action → verification → learning. Explain why the evidence supports your next step without proving more than it shows. State what uncertainty remains and which finding would change your mind. Revisit your initial hypotheses without assigning blame. Saving records the mission on this device. Completing the transfer variant with all criteria met automatically schedules a review about 72 hours later; this interval is an initial calibration hypothesis, not a guarantee of retention.",
        needsEvidence:
          "Dossier text connecting fact, competing hypotheses, evidence, action, verification and learning, including remaining uncertainty and a finding that would change the decision.",
      },
    ],
  },
];

const bySlug = new Map(MISSIONS.map((m) => [m.slug, m]));

export function getMission(slug: string): Mission | undefined {
  return bySlug.get(slug);
}

/**
 * Missões ativas (com progresso registrado) como hints para recommendNext
 * (D9/D11). Apenas missões iniciadas geram recomendação — nada de empurrar
 * conteúdo não solicitado (planejamento §13).
 */
export function missionHintsFromLearning(state: LearningState): MissionHint[] {
  const hints: MissionHint[] = [];
  for (const [slug, progress] of Object.entries(state.missions)) {
    const mission = bySlug.get(slug);
    if (!mission) continue;
    hints.push({
      slug,
      title: mission.title,
      stepTitle: progress.step,
      pendingConceptIds: [...mission.prereqConceptIds],
    });
  }
  return hints;
}
