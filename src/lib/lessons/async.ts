import type { Lesson } from "./types";

export const LESSONS_ASYNC: Lesson[] = [
  {
    id: 15,
    rev: "2.1",
    objective:
      "Predict unfinished work from arrivals and completions, and choose whether the caller can receive acceptance before processing finishes.",
    prereqIds: [11],
    mentalModel: {
      definition:
        "A message queue buffers work between producers and consumers. Competing consumers share that work: one consumer handles each delivery, but an unacknowledged message can be delivered again. Persistence and retention depend on the broker configuration.",
      analogy:
        "A grading tray lets students submit papers without waiting for the teacher to grade them.",
      analogyLimits:
        "A broker can redeliver a paper after an uncertain acknowledgement. A real queue also has capacity, retention, and failure limits; it does not create processing capacity.",
      correspondence: [
        ["Producer", "Student submitting a paper"],
        ["Pending work", "Papers awaiting grading"],
        ["Consumer", "Teacher grading a paper"],
        ["Acknowledgement", "Recording that grading is complete"],
      ],
    },
    scenario: {
      system: "A media service accepts requests to create previews.",
      data:
        "In each one-second interval, three jobs arrive and two finish. Initially no work is unfinished. Measure at interval boundaries after both counts are recorded.",
      symptom: "Accepted work increasingly waits before completion.",
      constraints: [
        "The upload response may return a job identifier before its preview exists.",
        "There are no retries, drops, or failures in this arithmetic model.",
        "Unfinished work includes both waiting and in-flight jobs.",
      ],
      baseline:
        "Without buffering, callers wait for processing or are rejected when capacity is unavailable. With acceptance and buffering, unfinished work is 1, 2, 3, and 4 jobs after four intervals.",
    },
    representation: {
      kind: "event-track",
      caption:
        "Compare cumulative arrivals with completions; their difference is unfinished work, not necessarily ready-queue depth.",
      data: {
        unit: "s",
        lanes: [
          { id: "input", label: "Cumulative arrivals", kind: "signal" },
          { id: "output", label: "Cumulative completions", kind: "signal" },
          { id: "backlog", label: "Unfinished work", kind: "signal" },
        ],
        events: [
          { ts: 0, lane: "backlog", label: "0 jobs", kind: "info" },
          { ts: 1, lane: "input", label: "3 arrived", kind: "info" },
          { ts: 1, lane: "output", label: "2 completed", kind: "success" },
          { ts: 1, lane: "backlog", label: "1 unfinished", kind: "warn" },
          { ts: 2, lane: "input", label: "6 arrived", kind: "info" },
          { ts: 2, lane: "output", label: "4 completed", kind: "success" },
          { ts: 2, lane: "backlog", label: "2 unfinished", kind: "warn" },
          { ts: 4, lane: "input", label: "12 arrived", kind: "info" },
          { ts: 4, lane: "output", label: "8 completed", kind: "success" },
          { ts: 4, lane: "backlog", label: "4 unfinished", kind: "warn" },
          { ts: 6, lane: "backlog", label: "0 after arrivals stop at t=4", kind: "success" },
        ],
        window: { from: 0, to: 6 },
        note:
          "Constant-rate arithmetic, not a broker benchmark. From t=4 arrivals stop and service remains 2 jobs/s. Unfinished work includes in-flight work; S5 queueDepth has different accounting.",
      },
      textEquivalent:
        "At t=0 unfinished work is zero. By t=1, 3 arrivals minus 2 completions leave 1 job; t=2 leaves 2; t=4 leaves 4. Arrivals then stop. Two more seconds at 2 completions/s drain those four jobs by t=6. The buffer changes where work waits, not its service rate.",
    },
    worked: {
      decision:
        "Return accepted status with a job identifier and process previews from a bounded queue, while monitoring the growing unfinished-work count.",
      reasoning: [
        "The caller needs acceptance of the upload, not an already rendered preview.",
        "Each interval adds 3 minus 2, or 1 unfinished job.",
        "After four intervals, 12 arrived and 8 finished, leaving 4.",
        "With arrivals stopped, 4 divided by 2 requires another 2 seconds.",
        "If arrivals continue at 3/s, buffering alone cannot stabilize the system.",
        "A crash after producing a preview but before acknowledgement can cause redelivery; use a stable job identity to avoid duplicate effects.",
      ],
    },
    contrast: [
      {
        alternative: "Generate the preview in the request",
        tradeoff:
          "The caller gets a definite result without a job-status workflow, but processing occupies its latency budget.",
        whenNotToUse:
          "Do not introduce a queue when the caller needs the result immediately and the bounded processing already fits its deadline.",
      },
      {
        alternative: "Reject excess work instead of retaining it",
        tradeoff:
          "Bounds retained work but requires a visible rejection and a cooperative producer policy.",
        whenNotToUse:
          "Do not silently drop accepted work whose completion the caller was promised.",
      },
    ],
    misconceptions: [
      {
        wrong: "A queue removes a sustained capacity deficit.",
        discriminant: "Compare admitted work and completed work over the same window.",
        counterexample:
          "Three arrivals and two completions every second add one unfinished job each second despite the queue.",
      },
      {
        wrong: "One logical job implies exactly one execution.",
        discriminant: "Locate the acknowledgement relative to the external effect.",
        counterexample:
          "A worker saves a preview and crashes before acknowledging; another delivery can repeat the save.",
      },
    ],
    practiceIds: ["t-15-predict", "t-15-compare"],
    evidenceCriteria: [
      "Calculate unfinished work with explicit accounting boundaries.",
      "Separate acceptance from successful completion.",
      "Explain why a queue does not add service capacity.",
      "Identify the effect-before-ack redelivery window.",
    ],
    transfer: {
      variant:
        "A document service accepts translation jobs. Predict unfinished work for a short burst and decide whether the upload response needs the translated document or only a job identifier.",
      domain: "Document translation",
    },
    provenance: {
      reviewed: false,
      notes:
        "Canonical concept 15; checked against conservation of work and S5 competing-consumer semantics. Rates are illustrative and do not represent S5 throughput. Independent technical review is pending.",
    },
  },
  {
    id: 16,
    rev: "2.1",
    objective:
      "Count subscriber delivery obligations separately from delivery attempts, and contrast fan-out with competing consumers.",
    prereqIds: [15],
    mentalModel: {
      definition:
        "Pub/sub routes a published event to independent subscriptions. Each subscription has its own delivery obligation and acknowledgement state. Replicas within one subscription may compete for its work; independent subscriptions do not split the same obligation.",
      analogy:
        "Each department receives its own copy of a school announcement; clerks within a department may share the task of handling that copy.",
      analogyLimits:
        "Announcements do not normally require acknowledgements or redelivery. Broker retention, replay, ordering, and subscription creation rules must be specified separately.",
      correspondence: [
        ["Published event", "Original announcement"],
        ["Subscription", "Department receiving a copy"],
        ["Subscriber replicas", "Clerks sharing one department's work"],
      ],
    },
    scenario: {
      system: "A museum publishes ExhibitOpened for an archive and a visitor display.",
      data:
        "One event E1 is published with two existing subscriptions. The archive succeeds; the display fails once and succeeds on its next attempt.",
      symptom: "A teammate counts the display retry as a second published event.",
      constraints: [
        "Delivery state is tracked separately for each subscription.",
        "A retry does not create another obligation for the archive.",
        "The illustrated schedule follows S5's serial stepping, not parallel execution.",
      ],
      baseline:
        "One shared queue gives one logical work obligation for E1. Two independent subscriptions give two obligations, with three attempts in this replay.",
    },
    representation: {
      kind: "event-track",
      caption: "Count publications, subscription obligations, and attempts separately.",
      data: {
        unit: "step",
        lanes: [
          { id: "publisher", label: "Publisher", kind: "actor" },
          { id: "archive", label: "Archive subscription", kind: "actor" },
          { id: "display", label: "Display subscription", kind: "actor" },
        ],
        events: [
          { ts: 0, lane: "publisher", label: "Publish E1 once", kind: "info" },
          { ts: 1, lane: "archive", label: "E1 attempt 1 acknowledged", kind: "success" },
          { ts: 2, lane: "display", label: "E1 attempt 1 fails transiently", kind: "warn" },
          { ts: 3, lane: "display", label: "E1 attempt 2 acknowledged", kind: "success" },
        ],
        window: { from: 0, to: 3 },
        note:
          "One publication, two subscription obligations, three attempts. S5 stores pending/acked/dead states and handles one attempt per step; retries retain the current subscriber cursor. It does not demonstrate failure-independent scheduling.",
      },
      textEquivalent:
        "E1 is published once at step 0. Archive acknowledges its copy at step 1. Display fails at step 2 and acknowledges on retry at step 3. There are two subscription obligations, three attempts, and two acknowledgements; archive is not retried.",
    },
    worked: {
      decision:
        "Use independent subscriptions because both archive and display need every event; use competing replicas only to share work inside one subscription.",
      reasoning: [
        "The archive and display perform distinct reactions, so neither can consume the other's obligation.",
        "One event times two subscriptions gives two obligations.",
        "The display retry adds an attempt, not an event or an archive delivery.",
        "An archive acknowledgement says nothing about the display's acknowledgement.",
        "S5 models separate delivery states but its scheduler can delay later subscriptions during retries; production isolation requires an appropriate broker and consumer design.",
      ],
    },
    contrast: [
      {
        alternative: "One shared queue with two workers",
        tradeoff:
          "Shares one workload rather than asking both workers to perform every reaction.",
        whenNotToUse:
          "Do not use a single competing-consumer queue when both distinct reactions must receive every event.",
      },
      {
        alternative: "A direct call to one known handler",
        tradeoff:
          "Keeps a required result explicit without subscription management.",
        whenNotToUse:
          "Do not choose fan-out solely to accelerate one handler; independent subscribers increase work rather than split it.",
      },
    ],
    misconceptions: [
      {
        wrong: "Adding an independent subscriber divides the existing workload.",
        discriminant: "Distinguish another subscription from another replica.",
        counterexample:
          "Two events with three subscriptions create six obligations, not two divided among three handlers.",
      },
      {
        wrong: "Separate delivery states prove that failures cannot delay other subscribers.",
        discriminant: "Inspect scheduling as well as state ownership.",
        counterexample:
          "S5 keeps a failing subscriber's cursor during retries, delaying selection of later subscribers until success or exhaustion.",
      },
    ],
    practiceIds: ["t-16-predict", "t-16-order"],
    evidenceCriteria: [
      "Count obligations and attempts without conflating them.",
      "Explain per-subscription acknowledgements.",
      "Distinguish competing replicas from independent subscriptions.",
      "Name S5's scheduling limitation.",
    ],
    transfer: {
      variant:
        "A library publishes ReservationCancelled to a waitlist notifier and a reporting service. Count obligations and explain what changes when another notifier replica is added.",
      domain: "Library circulation",
    },
    provenance: {
      reviewed: false,
      notes:
        "Canonical concept 16; checked against S5 fanoutStep and deliveries(). Explicitly documents serial scheduling and the retained retry cursor rather than claiming independent execution. Independent review is pending.",
    },
  },
  {
    id: 17,
    rev: "2.1",
    objective:
      "Separate a committed business fact from its later reactions and justify an event versus a direct call using consistency requirements.",
    prereqIds: [15, 16],
    mentalModel: {
      definition:
        "Event-driven architecture organizes reactions around records of facts that have happened. Producers and reactors remain coupled through event meaning and schema, even when they do not call each other directly.",
      analogy:
        "A public notice records a decision; different departments act on their copies at different times.",
      analogyLimits:
        "Notices can be delayed, duplicated, or missed without durable publication. Reactions are not an atomic transaction, and publication does not prove completion.",
      correspondence: [
        ["Committed event", "Recorded decision"],
        ["Reactor", "Department acting on the notice"],
        ["Event schema", "Agreed notice format"],
      ],
    },
    scenario: {
      system: "A course platform records enrollment and prepares optional welcome material.",
      data:
        "Enrollment commits at 0 ms; a durably recorded event is dispatched at 20 ms; a welcome email finishes at 80 ms and optional material at 2020 ms.",
      symptom: "The student can see enrollment before welcome material is ready.",
      constraints: [
        "Enrollment is valid without the optional welcome material.",
        "The enrollment and outgoing event are stored atomically in this scenario.",
        "Reactors must tolerate duplicate delivery.",
      ],
      baseline:
        "Waiting for optional material adds about two seconds to confirmation. Returning after recording enrollment avoids that wait but exposes a pending-material state.",
    },
    representation: {
      kind: "event-track",
      caption: "Observe the gap between the committed fact and the completed reactions.",
      data: {
        unit: "ms",
        lanes: [
          { id: "enroll", label: "Enrollment", kind: "actor" },
          { id: "mail", label: "Welcome email", kind: "actor" },
          { id: "material", label: "Optional material", kind: "actor" },
          { id: "view", label: "Student view", kind: "signal" },
        ],
        events: [
          { ts: 0, lane: "enroll", label: "Enrollment and outgoing event committed", kind: "success" },
          { ts: 20, lane: "enroll", label: "Event dispatched; confirmation returned", kind: "info" },
          { ts: 80, lane: "mail", label: "Email complete", kind: "success" },
          { ts: 100, lane: "view", label: "Enrolled; welcome material pending", kind: "warn" },
          { ts: 2020, lane: "material", label: "Material complete", kind: "success" },
        ],
        window: { from: 0, to: 2020 },
        note:
          "Illustrative schedule, not measured latency. Atomic storage of the fact and outgoing event is an explicit assumption, not a consequence of using pub/sub.",
      },
      textEquivalent:
        "Enrollment and its outgoing event commit at 0 ms. Dispatch and confirmation occur at 20 ms. Email finishes at 80 ms. At 100 ms the student is enrolled but material is pending; that reaction finishes at 2020 ms.",
    },
    worked: {
      decision:
        "Confirm enrollment independently of optional reactions and show a pending state until material is ready.",
      reasoning: [
        "Enrollment validity does not depend on the optional material.",
        "The event reports a committed fact rather than requesting permission to enroll.",
        "The interface must not interpret publisher success as completion of every reaction.",
        "Atomic recording avoids a crash window in which enrollment commits but no outgoing event survives.",
        "Changing an event field can still break consumers, so contract evolution and observability remain necessary.",
      ],
    },
    contrast: [
      {
        alternative: "Call a dependency directly before confirming",
        tradeoff:
          "Provides a required answer immediately but couples response latency and availability to that dependency.",
        whenNotToUse:
          "Do not replace a required eligibility decision with an eventual reaction when confirmation must depend on its answer.",
      },
      {
        alternative: "Keep the workflow in one local transaction",
        tradeoff:
          "Can preserve local atomic invariants with less coordination machinery.",
        whenNotToUse:
          "Do not introduce distributed events for a small local invariant that a single transaction already preserves.",
      },
    ],
    misconceptions: [
      {
        wrong: "Events eliminate coupling.",
        discriminant: "Ask which consumers depend on event meaning and fields.",
        counterexample:
          "Renaming enrollmentId without compatibility can break every reactor even though no direct calls exist.",
      },
      {
        wrong: "Publishing after a commit guarantees delivery of the fact.",
        discriminant: "Locate a crash between the two operations.",
        counterexample:
          "A process commits enrollment and crashes before publishing; without durable atomic recording, reactors may never hear about it.",
      },
    ],
    practiceIds: ["t-17-compare", "t-17-variant"],
    evidenceCriteria: [
      "Identify what must be true before confirmation.",
      "Separate a fact from a command requiring an answer.",
      "Describe a pending reaction honestly.",
      "Identify contract coupling and the commit/publication gap.",
    ],
    transfer: {
      variant:
        "A scientific archive commits a dataset and later builds search indexes. Decide what submission confirmation promises and what search should show before indexing finishes.",
      domain: "Research archives",
    },
    provenance: {
      reviewed: false,
      notes:
        "Canonical concept 17, composed with 15 and 16. Timing and atomic-outgoing-event storage are scenario assumptions; S5 does not model business transactions. Independent review is pending.",
    },
  },
  {
    id: 20,
    rev: "2.1",
    objective:
      "Distinguish exhausted delivery attempts from evidence of a poison message, then justify recovery or loss handling.",
    prereqIds: [15, 12],
    mentalModel: {
      definition:
        "A dead letter queue retains messages or subscription deliveries removed from normal processing under a failure policy, here after three failed attempts. Exhaustion does not prove the payload is poison: transient outages can also exhaust attempts. Poison describes a message that cannot succeed unchanged under the relevant consumer contract.",
      analogy:
        "A postal inspection shelf holds letters that could not be delivered so an owner can investigate them.",
      analogyLimits:
        "The shelf does not explain the cause or repair the letter. A valid message can be parked during an outage, and replay can repeat effects already performed before an acknowledgement was lost.",
      correspondence: [
        ["Attempt limit", "Bounded delivery visits"],
        ["DLQ", "Inspection shelf"],
        ["Redrive", "Sending inspected mail back for delivery"],
      ],
    },
    scenario: {
      system: "A file-import consumer uses three total attempts per message.",
      data:
        "A times out once and then succeeds. B fails schema validation on all three attempts because a required field is absent.",
      symptom: "The operator must separate recovered failure from parked invalid input.",
      constraints: [
        "Attempts include the first attempt.",
        "Retries remain on the same worker in this replay.",
        "The missing field is independently confirmed by payload validation.",
      ],
      baseline:
        "Unlimited unchanged retries cannot repair B. A bounded policy lets A recover and parks B with error history for investigation.",
    },
    representation: {
      kind: "event-track",
      caption: "Compare error type, recovery, and exhaustion; do not infer poison from a worker failure.",
      data: {
        unit: "step",
        lanes: [
          { id: "worker", label: "Consumer attempts", kind: "actor" },
          { id: "dlq", label: "DLQ", kind: "signal" },
        ],
        events: [
          { ts: 1, lane: "worker", label: "A attempt 1: timeout", kind: "warn" },
          { ts: 2, lane: "worker", label: "A attempt 2: success", kind: "success" },
          { ts: 3, lane: "worker", label: "B attempt 1: required field absent", kind: "warn" },
          { ts: 4, lane: "worker", label: "B attempt 2: same validation failure", kind: "warn" },
          { ts: 5, lane: "worker", label: "B attempt 3: same failure; exhausted", kind: "fail" },
          { ts: 5, lane: "dlq", label: "B retained with error and history", kind: "warn" },
        ],
        window: { from: 1, to: 5 },
        note:
          "Illustrative mixed-message replay, not one S5 run: S5 failure is configured for the entire controller and poison mode fails every selected delivery. S5 dead is a counter/state, not stored DLQ payload recovery.",
      },
      textEquivalent:
        "A times out at step 1 and succeeds at step 2. B fails the same required-field check at steps 3, 4, and 5 and is parked after three failures. Independent payload validation establishes B's invalidity; exhaustion alone would not establish poison.",
    },
    worked: {
      decision:
        "Keep bounded retries for eligible failures and retain exhausted B for an owned investigation before controlled redrive.",
      reasoning: [
        "A's successful retry refutes the claim that its first failure proved poison.",
        "B's confirmed missing required field cannot be repaired by repeating the unchanged delivery.",
        "Three total attempts means one initial attempt plus two retries.",
        "Preserve identity, payload, errors, and timestamps so recovery is auditable.",
        "Repair or reconstruct the payload from an authoritative source and test the consumer before redrive.",
        "Check duplicate-effect protection and monitor the redrive; parking is not business completion.",
      ],
    },
    contrast: [
      {
        alternative: "Continue bounded retries while a transient dependency recovers",
        tradeoff:
          "May restore valid work without manual handling but consumes time and attempt budget.",
        whenNotToUse:
          "Do not repeatedly retry confirmed invalid data unchanged merely because retries exist.",
      },
      {
        alternative: "Discard an explicitly expendable message",
        tradeoff:
          "Avoids recovery cost at the price of losing the work, which requires an explicit loss policy.",
        whenNotToUse:
          "Do not discard required business work without an owner-approved loss or reconstruction policy.",
      },
    ],
    misconceptions: [
      {
        wrong: "A message in the DLQ must be poison.",
        discriminant: "Separate routing policy from failure cause.",
        counterexample:
          "Three timeouts during a dependency outage can park a valid message that succeeds unchanged after recovery.",
      },
      {
        wrong: "Redrive fixes the cause.",
        discriminant: "Identify what changed before another delivery.",
        counterexample:
          "B still lacks its required field after redrive and returns to the DLQ after three more failures.",
      },
    ],
    practiceIds: ["t-20-find-flaw", "t-20-compare"],
    evidenceCriteria: [
      "Reject poison classification based only on random worker failures.",
      "Count total attempts correctly.",
      "Separate parking from successful recovery.",
      "Justify retry, retention, or discard using recoverability and loss constraints.",
    ],
    transfer: {
      variant:
        "A sensor pipeline has valid measurements delayed by an outage and obsolete samples past their useful lifetime. Propose separate recovery and loss policies.",
      domain: "Environmental telemetry",
    },
    provenance: {
      reviewed: false,
      notes:
        "Canonical concept 20; checked against S5 attempt exhaustion and transient/poison distinctions. Retention, inspection, and redrive describe required operational behavior beyond S5's counters. Independent review is pending.",
    },
  },
];
