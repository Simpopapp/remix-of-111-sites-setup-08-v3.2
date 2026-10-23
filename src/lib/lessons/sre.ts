import type { Lesson } from "./types";

export const LESSONS_SRE: Lesson[] = [
  {
    id: 109,
    rev: "2.2",
    objective:
      "Build an incident timeline from signals, competing hypotheses, a bounded mitigation, and explicit verification without attributing blame.",
    prereqIds: [58, 60, 61, 63],
    mentalModel: {
      definition:
        "A production incident is a situation requiring coordinated response to actual or credible service harm. Response combines impact assessment, explicit hypotheses, proportionate actions, communication, and verification. An alert is a signal for triage, not automatically a confirmed incident or a causal explanation.",
      analogy:
        "An emergency coordinator organizes observations, limits immediate harm, and checks whether the intervention worked before declaring the situation resolved.",
      analogyLimits:
        "Software incidents may be partial, silent, or caused by interacting conditions. A single alarm does not reveal severity, and responders act with incomplete information rather than a complete emergency script.",
      correspondence: [
        ["Incident coordination", "Keeping one shared operational picture"],
        ["Mitigation", "Limiting immediate harm"],
        ["Verification", "Checking that the affected activity actually recovered"],
      ],
    },
    scenario: {
      system:
        "An export service offers immediate CSV downloads and an optional expensive formatting mode.",
      data:
        "At minute 0, failed downloads rise from 0.1% to 4%. At minute 2, queue depth is 900 versus a baseline of 100. A recent release and a demand increase are both plausible contributors.",
      symptom:
        "Users cannot reliably download exports; responders have not established a complete causal explanation.",
      constraints: [
        "Disabling optional formatting preserves basic CSV downloads and has a tested reversal procedure.",
        "Keep user-impact communication and a decision log while investigating.",
        "Do not make several unrelated changes at once merely to appear active.",
      ],
      baseline:
        "Comparable pre-incident traffic had 0.1% failed downloads and queue depth near 100.",
    },
    representation: {
      kind: "event-track",
      caption:
        "Track observations, hypotheses, mitigation, and user-facing verification separately.",
      data: {
        unit: "min",
        lanes: [
          { id: "signals", label: "Service and user-path signals", kind: "signal" },
          { id: "coord", label: "Incident coordinator", kind: "actor" },
          { id: "operator", label: "Mitigation operator", kind: "actor" },
        ],
        events: [
          {
            ts: 0,
            lane: "signals",
            label: "Failed downloads 4%, baseline 0.1%",
            kind: "fail",
          },
          {
            ts: 1,
            lane: "coord",
            label: "Assess impact; assign response and communication roles",
            kind: "info",
          },
          {
            ts: 2,
            lane: "signals",
            label: "Queue depth 900, baseline 100",
            kind: "warn",
          },
          {
            ts: 3,
            lane: "coord",
            label: "Keep release regression and demand overload as hypotheses",
            kind: "info",
          },
          {
            ts: 4,
            lane: "operator",
            label: "Disable optional formatting; preserve basic CSV",
            kind: "info",
          },
          {
            ts: 9,
            lane: "signals",
            label: "Next 5 min: failures 0.2%; queue depth falls to 180",
            kind: "success",
          },
          {
            ts: 10,
            lane: "coord",
            label: "Report improvement; continue checks and causal investigation",
            kind: "info",
          },
        ],
        window: { from: 0, to: 10 },
        note:
          "Synthetic response sequence. Improvement after an action supports its operational usefulness but does not alone prove a unique root cause.",
      },
      textEquivalent:
        "At minute 0, failed downloads reach 4% versus a 0.1% baseline. At minute 1, the coordinator assesses impact and assigns response and communication roles. At minute 2, queue depth is 900 versus 100. At minute 3, release regression and demand overload remain hypotheses. At minute 4, the operator disables optional formatting while retaining basic CSV. At minute 9, the following five-minute window has 0.2% failures and queue depth is 180. At minute 10, the team reports improvement and continues user-path verification and causal investigation. The observations do not establish a unique cause.",
    },
    worked: {
      decision:
        "Coordinate the incident, preserve basic downloads through a reversible mitigation, and verify user outcomes while continuing the causal investigation.",
      reasoning: [
        "User-visible failures justify response even before the precise cause is known.",
        "Record facts with timestamps and scope; label regression and overload as hypotheses rather than findings.",
        "Choose the tested, limited formatting switch because it reduces expensive work without disabling the core download path.",
        "Record the expected result before acting: fewer failures and a draining queue, with basic CSV still usable.",
        "Compare the next defined interval with the baseline and check an actual download; a lower queue alone is insufficient if traffic vanished.",
        "The improvement does not establish whether the release, demand, or their interaction caused the incident.",
      ],
    },
    contrast: [
      {
        alternative: "Wait for a complete root-cause explanation",
        tradeoff:
          "It may improve diagnostic confidence but extends harm when a safe mitigation is already available.",
        whenNotToUse:
          "Do not delay proportionate mitigation of active user harm solely to obtain a perfect causal narrative.",
      },
      {
        alternative: "Restart all workers immediately",
        tradeoff:
          "It may clear some transient conditions but can destroy evidence, interrupt work, and create another load spike.",
        whenNotToUse:
          "Do not restart indiscriminately without a mechanism, bounded scope, reversal plan, and verification criteria.",
      },
    ],
    misconceptions: [
      {
        wrong: "The person who deployed last is the cause of the incident.",
        discriminant:
          "Distinguish temporal association and individual action from a supported mechanism and system conditions.",
        counterexample:
          "Failures rise after a deployment because an unrelated traffic surge saturates an unchanged dependency.",
      },
      {
        wrong: "The alert cleared, so recovery is proven.",
        discriminant:
          "Verify user outcomes, traffic coverage, and backlog rather than only the alert state.",
        counterexample:
          "The error alert clears when collection stops, while users still cannot download files.",
      },
    ],
    practiceIds: ["t-109-order", "t-109-compare"],
    evidenceCriteria: [
      "Record facts and hypotheses separately in a timeline.",
      "Choose an action proportionate to user harm and operational constraints.",
      "Define a user-facing verification interval and a failure or reversal condition.",
      "Separate successful mitigation from proof of a unique cause.",
    ],
    transfer: {
      variant:
        "Respond to delayed classroom notifications using a reversible reduction of optional enrichment; verify delivery rather than only worker health.",
      domain: "Education messaging",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 109. Roles and ordering are a bounded teaching response, not a universal runbook. Synthetic recovery does not establish causal certainty. Independent technical review is pending.",
    },
  },
  {
    id: 111,
    rev: "2.2",
    objective:
      "Construct a blameless postmortem that distinguishes facts, hypotheses, actions, verification, and learning, with owned and testable follow-up.",
    prereqIds: [109],
    mentalModel: {
      definition:
        "A postmortem is a structured investigation after an incident that explains impact, contributing conditions, decisions made with the information available, and opportunities to reduce future harm. Blameless analysis examines the system around human actions without treating identity or intent as a causal explanation.",
      analogy:
        "After a missed delivery, a team reconstructs routing information, handoffs, and safeguards rather than ending with the name of the driver.",
      analogyLimits:
        "A reconstruction can remain uncertain, and a meeting does not itself improve the system. Blamelessness does not remove responsibility for evidence, corrective actions, or verifying that safeguards work.",
      correspondence: [
        ["Factual timeline", "Reconstructed delivery checkpoints"],
        ["Contributing conditions", "Routing and handoff weaknesses"],
        ["Verified follow-up", "Testing the changed delivery safeguard"],
      ],
    },
    scenario: {
      system:
        "A scheduled analytics export was delivered 45 minutes late after a worker queue stalled.",
      data:
        "Worker restarts preceded recovery, but detailed queue-wait telemetry was absent. An operator saw no backlog warning because the dashboard showed only completed jobs.",
      symptom:
        "A draft report says 'operator error; remind everyone to be careful' and treats restart success as a proven causal explanation.",
      constraints: [
        "Do not manufacture missing evidence or claim the restart proved the initial failure mechanism.",
        "Describe actions and roles when relevant without making personal blame the explanation.",
        "Each accepted follow-up needs an owner, due date, and observable verification.",
      ],
      baseline:
        "The scheduled export normally arrives within ten minutes; this event arrived 45 minutes after its deadline.",
    },
    representation: {
      kind: "table",
      caption:
        "A useful dossier separates what happened from what is inferred and what will be tested.",
      data: {
        columns: [
          { key: "category", label: "Dossier category", emphasis: true },
          { key: "record", label: "Record" },
          { key: "limit", label: "Evidence or acceptance condition" },
        ],
        rows: [
          {
            cells: {
              category: "FACT",
              record: "Export delivered 45 min after deadline",
              limit: "Delivery and schedule timestamps",
            },
          },
          {
            cells: {
              category: "HYPOTHESIS — unconfirmed",
              record: "Queue wait contributed to lateness",
              limit: "Historical queue-wait telemetry unavailable",
            },
            tone: "warn",
          },
          {
            cells: {
              category: "ACTION — incident",
              record: "Workers restarted before recovery",
              limit: "Sequence is recorded; unique cause is not proven",
            },
          },
          {
            cells: {
              category: "ACTION — follow-up",
              record: "Queue-wait measurement and warning; owner: export team; due: day 14",
              limit: "Synthetic stalled-job test must trigger the warning",
            },
          },
          {
            cells: {
              category: "VERIFICATION — planned",
              record: "Run stalled-job test by day 14",
              limit: "Warning appears within 2 min; a responder can locate the waiting job",
            },
          },
          {
            cells: {
              category: "LEARNING",
              record: "Completed-job counts did not reveal waiting-job delay",
              limit: "A visibility gap was identified; the original mechanism remains uncertain",
            },
          },
        ],
        note:
          "Synthetic dossier. Category labels remain meaningful without color. Proposed tests are not recorded as already passed.",
      },
      textEquivalent:
        "FACT: delivery and schedule timestamps establish that the export arrived 45 minutes after its deadline. HYPOTHESIS, unconfirmed: queue wait contributed, but historical queue-wait telemetry is missing. INCIDENT ACTION: workers restarted before recovery; this sequence does not establish a unique cause. FOLLOW-UP ACTION: the export team owns queue-wait measurement and a warning, due on day 14. PLANNED VERIFICATION: by day 14, a synthetic stalled-job test must produce a warning within two minutes and let a responder locate the waiting job. LEARNING: completed-job counts did not expose waiting-job delay; the original mechanism remains uncertain.",
    },
    worked: {
      decision:
        "Replace the blame statement with an evidence-limited account and one prioritized, owned, testable improvement.",
      reasoning: [
        "Start with user impact and timestamped observations, not a person's name.",
        "Explain what the operator could see: completed jobs, not queue waiting time.",
        "Keep queue contention as a hypothesis because historical telemetry cannot establish it.",
        "Record restart as a mitigation associated with recovery, not proof of the initiating mechanism.",
        "Assign a concrete visibility improvement and a test with a deadline; record verification as pending until executed.",
        "Review whether the test and later incidents demonstrate reduced detection delay; an action being closed is not itself evidence of reduced risk.",
      ],
    },
    contrast: [
      {
        alternative: "Write a reminder to be more careful",
        tradeoff:
          "It is quick to publish but does not change the conditions that made the error possible or the incident hard to detect.",
        whenNotToUse:
          "Do not use a generic reminder as the only corrective action for a recurring system weakness.",
      },
      {
        alternative: "Require a long meeting for every minor event",
        tradeoff:
          "It may gather perspectives but can consume attention without producing new learning.",
        whenNotToUse:
          "Do not hold a full ritual when a short factual review and tracked action address the learning need; choose depth according to impact, novelty, and recurrence.",
      },
    ],
    misconceptions: [
      {
        wrong: "Blameless means no one owns corrective work.",
        discriminant:
          "Separate accountability for improvement from assigning personal fault as the explanation.",
        counterexample:
          "The export team can own and verify a queue-warning improvement without declaring one operator the cause.",
      },
      {
        wrong: "A plausible single root cause makes missing evidence unnecessary.",
        discriminant:
          "Check whether the report distinguishes observation from inference and considers contributing conditions.",
        counterexample:
          "Recovery after restart is compatible with several mechanisms; it cannot identify an unmeasured lock or queue condition by itself.",
      },
    ],
    practiceIds: ["t-111-variant", "t-111-compare"],
    evidenceCriteria: [
      "Classify fact, hypothesis, action, verification, and learning without upgrading uncertainty into certainty.",
      "Explain the information and safeguards available to responders.",
      "Specify an owned, dated action with an observable acceptance test.",
      "Transfer the analysis to a different domain without replacing system reasoning with blame.",
    ],
    transfer: {
      variant:
        "Review late library reservation notices using dispatch timestamps, uncertain scheduling hypotheses, an owned safeguard, and a replay test.",
      domain: "Library operations",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 111 using blameless learning principles described in Google SRE materials. The dossier and acceptance test are synthetic proposals, not completed operational work. Independent technical review is pending.",
    },
  },
];
