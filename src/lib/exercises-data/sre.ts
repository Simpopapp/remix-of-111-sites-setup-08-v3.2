import type { Answer, Task } from "@/lib/exercises";

function exactlyOne(answer: Answer, key: string): boolean {
  return answer.picked?.length === 1 && answer.picked[0] === key;
}

function completeOrder(answer: Answer, expected: string[]): boolean {
  return (
    answer.order?.length === expected.length &&
    expected.every((key, index) => answer.order?.[index] === key)
  );
}

export const TASKS_SRE: Task[] = [
  {
    id: "t-109-order",
    conceptId: 109,
    type: "order",
    prompt:
      "Order all five investigation records. Use the evidence dependencies in the records, not alphabetical order. Identify the point where the initial database hypothesis loses support.",
    context:
      "Export failures are harming users. Safe read-only checks are available immediately, so this short teaching sequence can inspect them before a tested mitigation. The initial hypothesis is database saturation. Recovery must be verified with user downloads, not just worker health. This is not a rule that mitigation must always wait for diagnosis.",
    options: [
      {
        key: "d",
        label:
          "Apply the tested optional-formatting switch selected from the preceding evidence; record expected queue drainage, basic-CSV preservation, and reversal criteria.",
      },
      {
        key: "b",
        label:
          "Request synchronized database-capacity and worker-stage evidence to test the recorded database hypothesis.",
      },
      {
        key: "e",
        label:
          "After the switch, verify five minutes of eligible download outcomes and queue drainage; report remaining uncertainty.",
      },
      {
        key: "a",
        label:
          "Record the failure signal and user impact, assign coordination, and label database saturation as an unconfirmed hypothesis.",
      },
      {
        key: "c",
        label:
          "Read the requested evidence: database latency and saturation are normal, while formatting-stage wait rises; revise the hypothesis before selecting the switch.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "sequence-evidence-action",
          label:
            "Place impact and hypothesis before evidence, revision before action, and verification after action.",
          cause:
            "The sequence acts before the evidence specified by this scenario, interprets evidence before requesting it, or declares recovery before measuring the action's user-facing result.",
          check: (a) =>
            completeOrder(a, ["a", "b", "c", "d", "e"]),
        },
        {
          key: "hypothesis-boundary",
          label:
            "Place the contradictory observation between the database evidence request and the revised mitigation.",
          cause:
            "The sequence fails to revise the database assumption when the requested observations weaken it, or applies the new hypothesis before that observation is available.",
          check: (a) => {
            const order = a.order ?? [];
            if (
              order.length !== 5 ||
              new Set(order).size !== 5 ||
              !["a", "b", "c", "d", "e"].every((key) =>
                order.includes(key),
              )
            ) {
              return false;
            }
            return (
              order.indexOf("b") < order.indexOf("c") &&
              order.indexOf("c") < order.indexOf("d")
            );
          },
        },
      ],
      expected:
        "The dependency order is a, b, c, d, e. Record impact and an explicitly uncertain hypothesis; request discriminating evidence; revise at c when normal database measurements and increased formatting wait weaken database saturation; apply the bounded switch; then verify user outcomes and queue drainage. Normal database measurements weaken the stated hypothesis but do not prove the database can have no involvement.",
      nextStep:
        "For a more urgent variant with a known safe mitigation already available, explain why mitigation may precede deeper investigation while verification remains necessary.",
    },
    helpLevels: [
      "Find which records refer to evidence or actions that must already exist.",
      "The database hypothesis must be recorded before it is tested; the formatting action follows the observation that motivates it.",
      "Use a → b → c → d → e. Record c is where the database-saturation assumption loses support; verification follows the mitigation.",
    ],
  },
  {
    id: "t-109-compare",
    conceptId: 109,
    type: "compare",
    prompt:
      "Compare immediate mitigation with causal investigation and choose the best response plan.",
    context:
      "An export incident is active. Disabling optional formatting is tested, reversible, and preserves basic CSV. A suspected shared-lock flaw may require hours to reproduce and a code change. The switch reduces expensive work under several plausible causes, so success would not uniquely identify the flaw.",
    options: [
      {
        key: "a",
        label:
          "Use the bounded switch, verify user downloads and queue drainage, and investigate the suspected lock mechanism separately.",
      },
      {
        key: "b",
        label:
          "Wait for the lock flaw to be reproduced and patched before taking any action, so recovery and diagnosis happen together.",
      },
      {
        key: "c",
        label:
          "Use the switch and close the causal investigation if errors fall, because mitigation success confirms the suspected lock flaw.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-mitigation-causality",
          label:
            "Reduce active harm with verification while keeping causal claims proportional to evidence.",
          cause:
            "The plan delays a tested mitigation during user harm or treats recovery after a broad load-reduction action as proof of one specific mechanism.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "The switch is an immediate mitigation, not necessarily a repair of the initiating mechanism. Define and inspect user-facing recovery signals, retain reversal criteria, and continue a separate causal investigation of the lock hypothesis. A useful action can work under multiple causes.",
      nextStep:
        "Specify an observation or reproduction that would distinguish the suspected lock flaw from simple demand overload.",
    },
    helpLevels: [
      "Ask which action limits current harm and which establishes or changes a mechanism.",
      "Reducing expensive work can help both overload and a regression; improvement alone does not distinguish them.",
      "Choose a: mitigate reversibly, verify user outcomes, and investigate the lock hypothesis separately.",
    ],
  },
  {
    id: "t-111-variant",
    conceptId: 111,
    type: "variant",
    prompt:
      "Transfer postmortem reasoning to library reservation notices. Choose the dossier that preserves evidence limits and makes improvement testable.",
    context:
      "Reservation notices arrived 40 minutes late. Dispatch records establish lateness; scheduler internals were not recorded. A staff member restarted the dispatch tool before notices resumed. A scheduling defect and an overloaded upstream queue remain plausible. The next review can fund one small improvement.",
    options: [
      {
        key: "a",
        label:
          "Record lateness as fact, keep both mechanisms as hypotheses, record restart as an action, assign queue-age visibility to the library systems team by day 10, and replay a delayed notice to verify detection within two minutes.",
      },
      {
        key: "b",
        label:
          "Record a scheduling defect as fact because restart preceded recovery, assign a scheduler replacement, and verify success when the replacement is installed.",
      },
      {
        key: "c",
        label:
          "Record lateness and uncertainty accurately, ask staff to monitor more carefully, and close the review once the reminder is circulated.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-transfer-dossier",
          label:
            "Transfer fact/hypothesis/action/verification reasoning with an owner, deadline, and observable test.",
          cause:
            "The dossier either turns temporal association into proven mechanism or replaces a testable system improvement with an unverified reminder.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "Choose a. The dispatch records establish late notices, not the scheduler's internal failure mechanism. Restart is a recorded intervention associated with recovery. The owned visibility change and delayed-notice replay provide a checkable improvement; they do not retroactively prove either historical hypothesis. Learning can include recognizing and reducing the visibility gap.",
      nextStep:
        "Apply the same dossier categories to a missed laboratory sample handoff, choosing a different safeguard and acceptance test.",
    },
    helpLevels: [
      "Ignore the domain nouns and recover the categories: fact, hypothesis, action, verification, and learning.",
      "A completed installation or circulated reminder is not the same as a demonstrated safeguard.",
      "Choose a: retain both hypotheses, record the restart without causal certainty, and assign a dated visibility action with a replay test.",
    ],
  },
  {
    id: "t-111-compare",
    conceptId: 111,
    type: "compare",
    prompt:
      "Choose one defensible review format for this incident. Two formats are valid; compare their scope and cost rather than selecting by meeting length.",
    context:
      "A low-impact export delay affected one internal team. Timestamps and configuration history are available, and no cross-team disagreement is known. The review must explain what information was visible, retain uncertainties, and produce owned, dated, verified follow-up. A cross-team discussion is feasible but not mandatory.",
    options: [
      {
        key: "a",
        label:
          "Use a short asynchronous blameless review with a factual timeline, contributing conditions, uncertainties, and one owned safeguard test.",
      },
      {
        key: "b",
        label:
          "Use a facilitated blameless discussion with the same evidence and testable follow-up, accepting more coordination time to invite additional perspectives.",
      },
      {
        key: "c",
        label:
          "Center the report on the operator who applied the configuration and close with retraining, without examining the information and safeguards available at the time.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-blameless-format",
          label:
            "Choose a proportionate evidence-based review that preserves accountability for verified improvement without substituting personal blame for explanation.",
          cause:
            "The review makes the operator's identity the explanation and omits the information, constraints, and safeguards needed to understand and reduce recurrence.",
          check: (a) =>
            exactlyOne(a, "a") || exactlyOne(a, "b"),
        },
      ],
      validAlternatives: [
        {
          picks: ["a"],
          tradeoff:
            "The asynchronous review costs less coordination time and fits the limited impact and available evidence. It must still invite corrections and track verification rather than becoming an unreviewed note.",
        },
        {
          picks: ["b"],
          tradeoff:
            "The facilitated discussion may reveal perspectives missing from the records but costs more coordination time. Its value depends on new learning and verified actions, not attendance.",
        },
      ],
      expected:
        "Both a and b preserve the required analytical categories and accountable follow-up. Review format is proportional to impact, uncertainty, and coordination needs. Blamelessness does not prohibit recording relevant human actions or assigning action owners; it rejects treating a person's identity as a sufficient causal explanation.",
      nextStep:
        "Increase the scenario to a recurring cross-team failure and reconsider whether the asynchronous format still provides enough shared understanding.",
    },
    helpLevels: [
      "Evaluate the report's reasoning and follow-up, not whether it holds a meeting.",
      "Both valid formats examine available information and require testable actions; the blame-centered format stops before system analysis.",
      "Choose a or b, not both. The trade-off is coordination cost versus additional perspectives; neither format removes ownership or verification.",
    ],
  },
];
