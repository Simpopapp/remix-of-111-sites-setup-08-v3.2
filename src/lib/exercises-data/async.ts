import type { Answer, Task } from "@/lib/exercises";

function exactPicks(a: Answer, keys: string[]): boolean {
  const picked = a.picked ?? [];
  return (
    picked.length === keys.length &&
    new Set(picked).size === keys.length &&
    keys.every((key) => picked.includes(key))
  );
}

function exactOrder(a: Answer, keys: string[]): boolean {
  return (
    a.order?.length === keys.length &&
    keys.every((key, index) => a.order?.[index] === key)
  );
}

export const TASKS_ASYNC: Task[] = [
  {
    id: "t-15-predict",
    conceptId: 15,
    type: "predict",
    prompt: "Predict unfinished work after five intervals. Choose one.",
    context:
      "Initially 6 jobs are unfinished. Each one-second interval admits 7 jobs and completes 4. No jobs are lost or retried. Unfinished work includes waiting and in-flight jobs; count after both interval totals are recorded.",
    options: [
      { key: "a", label: "15 jobs." },
      { key: "b", label: "21 jobs." },
      { key: "c", label: "41 jobs." },
      { key: "d", label: "6 jobs." },
    ],
    rubric: {
      criteria: [
        {
          key: "ledger",
          label: "Include initial work, arrivals, and completions.",
          cause:
            "The calculation may omit the initial six jobs or count arrivals without subtracting completed work.",
          check: (a) => exactPicks(a, ["b"]),
        },
      ],
      expected:
        "Start with 6. Each interval adds 7 minus 4 = 3 unfinished jobs. Five intervals add 15, so 6 + 15 = 21. This is unfinished work, not a claim about ready-queue depth.",
      nextStep:
        "Recalculate with arrivals stopping after the fifth interval and determine the drain time at 4 completions/s.",
    },
    helpLevels: [
      "Use the same accounting boundary for arrivals and completions.",
      "Track net growth per interval, then add it to the initial six.",
      "The solution is 6 + 5 × (7 − 4) = 21 jobs, option b. The queue has not increased processing capacity.",
    ],
  },
  {
    id: "t-15-compare",
    conceptId: 15,
    type: "compare",
    prompt:
      "Choose one complete design for the export request. Both may be defensible; compare the cost described in feedback.",
    context:
      "An occasional export takes a bounded 200 ms within a 2 s deadline. Users may either receive the file now or accept a job identifier and retrieve it later. A managed durable queue and status endpoint already exist. Current request capacity is sufficient.",
    options: [
      { key: "a", label: "Generate the file inside the request and return it." },
      { key: "b", label: "Persist a job, return its identifier, and expose completion through status." },
      { key: "c", label: "Return a job identifier before persisting anything; attempt generation after the response." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-contract",
          label: "Keep the response promise consistent with retained work.",
          cause:
            "The response may promise a recoverable job before any durable record exists, losing accepted work on a process restart.",
          check: (a) => exactPicks(a, ["a"]) || exactPicks(a, ["b"]),
        },
      ],
      validAlternatives: [
        {
          picks: ["a"],
          tradeoff:
            "The bounded 200 ms operation fits the deadline and avoids polling, but occupies request capacity during generation.",
        },
        {
          picks: ["b"],
          tradeoff:
            "Durable acceptance decouples response time from generation and uses existing infrastructure, but adds delayed completion and status retrieval.",
        },
      ],
      expected:
        "A and B satisfy the stated product requirements with different latency and workflow costs. C exposes a job that can disappear before being retained.",
      nextStep:
        "Change the scenario so users must receive the file in the same response, then reassess the queued design.",
    },
    helpLevels: [
      "Separate acceptance of work from return of the completed file.",
      "Check both the deadline and what survives a restart.",
      "A and B are valid: A returns the bounded result now; B durably accepts later completion. C promises work before retaining it.",
    ],
  },
  {
    id: "t-16-predict",
    conceptId: 16,
    type: "predict",
    prompt:
      "Choose the subscription-obligation counts before retries. Count obligations, not attempts.",
    context:
      "Two events are published to three existing independent subscriptions: archive, display, and statistics. Display has two competing replicas within its single subscription. All subscriptions need both events.",
    options: [
      { key: "a", label: "Archive 2; display 2; statistics 2; total 6." },
      { key: "b", label: "Archive 2; display 4; statistics 2; total 8." },
      { key: "c", label: "Two obligations total, split across all handlers." },
    ],
    rubric: {
      criteria: [
        {
          key: "fanout-count",
          label: "Count one obligation per event per independent subscription.",
          cause:
            "The count may treat a competing replica as a new subscription or treat all subscriptions as one shared queue.",
          check: (a) => exactPicks(a, ["a"]),
        },
      ],
      expected:
        "Each subscription needs both events, so each has 2 obligations and the total is 6. Display replicas share its 2 obligations. Failures could add attempts without creating new obligations.",
      nextStep:
        "Add one independent subscription, then separately add one archive replica; compare which change increases obligations.",
    },
    helpLevels: [
      "Count independent subscriptions before counting processes.",
      "Two display replicas share one subscription's deliveries.",
      "Option a: 2 events × 3 subscriptions = 6 obligations. Display still has 2, not 4; retries would increase attempts.",
    ],
  },
  {
    id: "t-16-order",
    conceptId: 16,
    type: "order",
    prompt:
      "Order this S5 replay and place the global-completion claim where it first becomes unsupported. Include every item once.",
    context:
      "One event targets subscribers A and B. The specified replay handles A successfully, then B fails once and succeeds on retry. The claim must be checked immediately after A's acknowledgement. This is an evidence-check marker, not a broker transition.",
    options: [
      { key: "q4", label: "B's first attempt fails transiently." },
      { key: "q2", label: "A's attempt succeeds and A acknowledges." },
      { key: "q5", label: "B's retry succeeds and B acknowledges." },
      { key: "q1", label: "The publisher creates the event and two subscriber obligations." },
      { key: "q3", label: "Check the claim: A's acknowledgement means every subscriber is complete." },
    ],
    rubric: {
      criteria: [
        {
          key: "attempt-sequence",
          label: "Publish before delivery and retry B after its failure.",
          cause:
            "The sequence may place an attempt before publication or place B's retry before its failed attempt.",
          check: (a) =>
            exactOrder(a, ["q1", "q2", "q3", "q4", "q5"]),
        },
      ],
      expected:
        "q1 → q2 → q3 → q4 → q5. The claim at q3 is unsupported: A is acknowledged, but B is not. B later fails and retries independently of A's already completed state. S5 executes these attempts serially.",
      nextStep:
        "Inspect S5 deliveries() immediately after A succeeds and identify B's still-pending state.",
    },
    helpLevels: [
      "Publication must precede attempts; acknowledgement belongs to a subscription.",
      "Insert the claim check immediately after A acknowledges, before B's attempt.",
      "Use q1, q2, q3, q4, q5. At q3 only A is complete; B remains pending and its later retry does not reopen A.",
    ],
  },
  {
    id: "t-17-compare",
    conceptId: 17,
    type: "compare",
    prompt: "Choose one design for the required authorization decision.",
    context:
      "A controlled archive must decide whether a requester may download a restricted file. No file bytes may be released before a current authorization decision. Optional download statistics may be delayed. The authorization service provides the authoritative synchronous decision.",
    options: [
      { key: "a", label: "Obtain authorization before releasing bytes; record statistics asynchronously." },
      { key: "b", label: "Release bytes after publishing AccessRequested; wait for an eventual authorization reaction." },
      { key: "c", label: "Use a previously cached decision regardless of its age, then request a refresh." },
    ],
    rubric: {
      criteria: [
        {
          key: "required-answer",
          label: "Preserve authorization before disclosure.",
          cause:
            "The design treats a required current decision as an optional delayed reaction, allowing irreversible disclosure before permission is established.",
          check: (a) => exactPicks(a, ["a"]),
        },
      ],
      expected:
        "Choose A. Authorization is a prerequisite for releasing bytes; statistics are a reaction that may be delayed. Event-driven reactions do not remove the need for a required answer.",
      nextStep:
        "Move only the statistics step to an event and state which failure may delay statistics without permitting unauthorized access.",
    },
    helpLevels: [
      "Identify the invariant that must hold before bytes leave the service.",
      "Separate the permission decision from optional reporting.",
      "A preserves authorization before disclosure while allowing delayed statistics. B and C can release data without the required current decision.",
    ],
  },
  {
    id: "t-17-variant",
    conceptId: 17,
    type: "variant",
    prompt: "Choose the submission promise that fits this scientific workflow.",
    context:
      "A repository commits a dataset and an outgoing record atomically. Search indexing may take a minute and is not required for a valid submission. Users must know whether the dataset was accepted, but need not find it in search immediately.",
    options: [
      { key: "a", label: "Confirm the committed dataset and show indexing as pending until its reaction completes." },
      { key: "b", label: "Label the dataset searchable as soon as the outgoing record is stored." },
      { key: "c", label: "Undo a valid submission if the optional search indexer is temporarily unavailable." },
    ],
    rubric: {
      criteria: [
        {
          key: "fact-reaction",
          label: "Separate the committed submission from delayed indexing.",
          cause:
            "The choice equates a recorded fact with a finished reaction or makes an optional reactor determine submission validity.",
          check: (a) => exactPicks(a, ["a"]),
        },
      ],
      expected:
        "Choose A. Acceptance follows the dataset commit; searchability follows indexing. Atomic recording protects the outgoing fact, but does not make the index update immediate.",
      nextStep:
        "Describe what should happen if indexing receives the same dataset event twice.",
    },
    helpLevels: [
      "Identify which fact is already durable and which view is still being built.",
      "Submission validity and searchability have different completion times.",
      "A is the solution: confirm the committed dataset, expose pending indexing, and update searchability only after the reactor finishes.",
    ],
  },
  {
    id: "t-20-find-flaw",
    conceptId: 20,
    type: "find-flaw",
    prompt: "Choose the claim that is not supported by this attempt history.",
    context:
      "Message M times out on worker W on attempt 1, then succeeds unchanged on W on attempt 2. The policy allows three total attempts. No payload-validation failure is reported.",
    options: [
      { key: "a", label: "The first failure proves M was poison." },
      { key: "b", label: "The retry recovered this delivery without changing M." },
      { key: "c", label: "This replay did not exhaust the configured attempt limit." },
    ],
    rubric: {
      criteria: [
        {
          key: "unsupported-cause",
          label: "Reject a poison diagnosis based only on a worker timeout.",
          cause:
            "The diagnosis attributes a worker failure to message content despite an unchanged successful retry.",
          check: (a) => exactPicks(a, ["a"]),
        },
      ],
      expected:
        "A is unsupported and contradicted by recovery. M succeeded unchanged on its second attempt, so the timeout did not establish a poison message. Two attempts do not exhaust a three-attempt policy.",
      nextStep:
        "Contrast this history with three deterministic validation failures and ask what independent payload evidence is available.",
    },
    helpLevels: [
      "Follow the same message across attempts rather than classifying the first error alone.",
      "The unchanged second attempt succeeds.",
      "Select A: successful unchanged retry refutes this poison diagnosis. B and C follow directly from the history.",
    ],
  },
  {
    id: "t-20-compare",
    conceptId: 20,
    type: "compare",
    prompt:
      "Choose one complete disposition for this exhausted delivery. Two policies satisfy the stated loss constraints with different costs.",
    context:
      "A display sample has failed three total attempts because a dependency is unavailable. Its useful lifetime has now expired. The owner explicitly permits losing expired samples; they are not billing or audit records. An existing DLQ retains samples for short diagnostic analysis, and another live feed supplies current display data.",
    options: [
      { key: "a", label: "Retain the exhausted sample in the diagnostic DLQ; do not automatically redrive expired data." },
      { key: "b", label: "Discard the expired sample under the approved policy and record its loss count." },
      { key: "c", label: "Reset its attempt count and repeatedly retry it in the live queue." },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-disposition",
          label: "Respect exhaustion, useful lifetime, and the explicit loss policy.",
          cause:
            "The disposition renews automatic attempts for data that is no longer useful, consuming live capacity without restoring a required business outcome.",
          check: (a) => exactPicks(a, ["a"]) || exactPicks(a, ["b"]),
        },
      ],
      validAlternatives: [
        {
          picks: ["a"],
          tradeoff:
            "Diagnostic retention preserves evidence at a storage and review cost. Expired data must not be blindly redriven.",
        },
        {
          picks: ["b"],
          tradeoff:
            "Approved discard avoids recovery cost but loses payload-level diagnostic evidence; the loss remains visible in counters.",
        },
      ],
      expected:
        "A and B are valid under the explicit expiry and loss policy. C restarts an exhausted loop for obsolete data. DLQ placement does not prove poison: the dependency outage could affect valid messages.",
      nextStep:
        "Change the sample into an irreplaceable audit record and explain why the discard alternative no longer satisfies the constraints.",
    },
    helpLevels: [
      "Ask whether successful late processing still has value and whether loss is allowed.",
      "Retention for diagnosis and discard under an explicit policy are different from retrying live work.",
      "A preserves diagnostic evidence; B accepts the explicitly permitted loss. Both are valid. C wastes live capacity by retrying expired, exhausted work.",
    ],
  },
  {
    id: "t-44-compare",
    conceptId: 44,
    type: "compare",
    prompt: "Choose the next bounded intervention and its verification target.",
    context:
      "An export service admits 8 jobs/s and completes 5/s; backlog and oldest-job age rise. Shared storage is saturated. A controlled trial doubling workers keeps completions at 5/s and increases storage wait. Clients can defer requests when given explicit guidance.",
    options: [
      { key: "a", label: "Temporarily admit 4 jobs/s, guide clients to defer, and track useful completions, age, and deferred demand." },
      { key: "b", label: "Double workers again while retaining the same admission policy; inspect the worker count." },
      { key: "c", label: "Double queue storage while retaining the same admission policy; inspect remaining disk space." },
    ],
    rubric: {
      criteria: [
        {
          key: "capacity-evidence",
          label: "Use the failed worker trial and saturated dependency to bound admitted work.",
          cause:
            "The intervention adds concurrency or buffering without changing the measured admission-service deficit or testing the shared bottleneck.",
          check: (a) => exactPicks(a, ["a"]),
        },
      ],
      expected:
        "Choose A. Current net growth is 8 − 5 = 3 jobs/s. If useful service remains 5/s, admission at 4/s drains existing work at 1/s. Deferred demand still exists upstream. More workers did not raise useful throughput in the controlled trial; more storage only delays exhaustion.",
      nextStep:
        "Verify whether completions remain at 5/s after admission changes, then investigate storage capacity before proposing another scaling trial.",
    },
    helpLevels: [
      "Separate offered, admitted, and completed work; inspect what the controlled trial actually changed.",
      "The shared dependency stayed saturated and useful completions did not increase.",
      "A is the solution: 4 admitted minus 5 completed gives a 1 job/s drain under the assumptions. Measure deferred demand too; a smaller server backlog does not prove all demand was served.",
    ],
  },
  {
    // Divergência D16 resolvida (relatório s13): decide da missão
    // orders-pile-up — autoria do agente principal na F12.
    id: "t-16-compare",
    conceptId: 16,
    type: "compare",
    prompt:
      "Choose a delivery arrangement for the two reactions to a paid order. Justify what each choice gives up.",
    context:
      "Digital Store publishes one OrderPaid event. Two reactions exist: a customer email that must reach the customer independently, and fulfillment work where several workers can share the load. Duplicate email copies annoy customers; duplicate fulfillment attempts are already protected by stable order identity.",
    options: [
      {
        key: "a",
        label:
          "One shared queue holds both reactions; whichever worker is free handles the next message.",
      },
      {
        key: "b",
        label:
          "Two independent subscriptions receive every event; the fulfillment subscription runs several competing workers inside it.",
      },
      {
        key: "c",
        label:
          "Fulfillment subscribes independently; the email is sent by the publishing service inside the same transaction.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-obligations",
          label: "Give every event to the email reaction independently of fulfillment work.",
          cause:
            "A shared queue splits events between workers, so one reaction can consume the message the other reaction needed.",
          check: (a) => a.picked?.includes("b") ?? false,
        },
        {
          key: "choice-shared-work",
          label: "Let fulfillment work be shared among workers while each email copy stays its own obligation.",
          cause:
            "Treating fulfillment replicas as independent subscriptions multiplies obligations instead of dividing work.",
          check: (a) => a.picked?.includes("b") ?? false,
        },
      ],
      validAlternatives: [
        {
          picks: ["b"],
          tradeoff:
            "Independent subscriptions plus competing workers inside fulfillment give both properties, at the cost of operating two subscriptions and per-subscription retry state.",
        },
        {
          picks: ["c"],
          tradeoff:
            "Sending the email inside the publish transaction avoids a lost notification but couples checkout latency and availability to the mail path, against the stated independence requirement.",
        },
      ],
      expected:
        "B is the only arrangement that satisfies both stated needs: each subscription owns its delivery obligation, so the email always gets its copy, while competing replicas inside the fulfillment subscription share the work. A lets one reaction's worker consume the other reaction's message. C removes the independence the email needs by coupling it to the checkout transaction.",
      nextStep:
        "Trace one OrderPaid event through your chosen arrangement with a transient fulfillment failure, and note which reaction is delayed and which is not.",
    },
    helpLevels: [
      "Ask, for each message, who must receive it and who may share it.",
      "One delivery obligation per event per independent subscription; replicas share one subscription's work.",
      "Option b: two subscriptions get every event, and fulfillment's workers compete inside their own subscription. A steals messages between reactions; C couples the email to checkout.",
    ],
  },
];
