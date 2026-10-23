import type { Answer, Task } from "@/lib/exercises";

function exactlyOne(answer: Answer, key: string): boolean {
  return answer.picked?.length === 1 && answer.picked[0] === key;
}

export const TASKS_OBSERVABILITY: Task[] = [
  {
    id: "t-58-predict",
    conceptId: 58,
    type: "predict",
    prompt:
      "Before investigating, choose the conclusion justified by the alert.",
    context:
      "An API-edge alert fires when the server-error ratio exceeds 2% over five minutes. The latest complete window has 300 errors among 10,000 eligible requests. No component-level or user-segment evidence has been inspected.",
    options: [
      {
        key: "a",
        label:
          "The measured ratio is 3% in this window; the failing mechanism and distribution of user impact remain unknown.",
      },
      {
        key: "b",
        label:
          "The measured ratio is 3%; the database is the likely confirmed failure because it is shared by every request.",
      },
      {
        key: "c",
        label:
          "The measured ratio means 3% of accounts are affected; request counts are enough to estimate affected accounts.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-alert-scope",
          label:
            "Infer a measured request ratio without inventing a cause or an account denominator.",
          cause:
            "The conclusion promotes a symptom into a component diagnosis or substitutes accounts for the measured request population.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "300 / 10,000 is 3% for the stated five-minute request window. The alert supports that bounded observation. It does not identify a component or reveal how requests are distributed among accounts.",
      nextStep:
        "In a different alert scenario, list the measured population and one causal claim requiring additional evidence.",
    },
    helpLevels: [
      "Identify the numerator, denominator, and interval before interpreting impact.",
      "Requests, accounts, and components are different units of explanation.",
      "Choose a: the ratio is 3%; cause and user-impact distribution are still unknown.",
    ],
  },
  {
    id: "t-58-choose-info",
    conceptId: 58,
    type: "choose-info",
    prompt:
      "Choose the first evidence request that best separates a changed service outcome from changed traffic composition.",
    context:
      "An aggregate error ratio rose after a mobile-client rollout. Two hypotheses remain open: comparable requests became less reliable, or traffic shifted toward a route with a historically higher error ratio. Only the aggregate ratio is currently available. You may request one read-only evidence bundle.",
    options: [
      {
        key: "a",
        label:
          "Request before/after eligible and failed counts by route and client version, with identical windows and collection-coverage notes.",
      },
      {
        key: "b",
        label:
          "Request the latest sampled failed request and its stack trace, without before/after traffic counts.",
      },
      {
        key: "c",
        label:
          "Request a longer-window aggregate error ratio and the release timestamp, without route or client breakdown.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-discriminating-evidence",
          label:
            "Choose comparable subgroup counts capable of distinguishing the two stated explanations.",
          cause:
            "The requested evidence may describe one failure or smooth the same aggregate, but it cannot separate a changed route mix from changed within-route reliability.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "Choose the scoped before/after counts with comparable windows and coverage. They let you compare both traffic shares and within-group failure ratios. A trace or stack trace can help later, but one request cannot establish whether population composition changed. This request does not predetermine which hypothesis will survive.",
      nextStep:
        "For a fresh scenario, write an observation that would weaken each hypothesis rather than assuming which one is true.",
    },
    helpLevels: [
      "Ask which evidence could produce different findings under the two hypotheses.",
      "A ratio can change because subgroup ratios change or because subgroup weights change.",
      "Choose a: compare eligible and failed counts by route and client version before and after, retaining window and coverage information.",
    ],
  },
  {
    id: "t-60-compare",
    conceptId: 60,
    type: "compare",
    prompt:
      "Compare logs, traces, and metrics for this question and choose the most direct first inspection.",
    context:
      "You have the trace_id of one unusually slow report request. You need to identify which recorded child operation occupied most of its elapsed time. Available data includes a complete trace with parent-child spans, structured error logs correlated by trace_id but without operation durations, and a service-wide five-minute latency histogram.",
    options: [
      {
        key: "a",
        label:
          "Inspect the trace's child-span boundaries; it reconstructs this request's recorded timing but does not establish prevalence.",
      },
      {
        key: "b",
        label:
          "Inspect the error logs first; the number of log entries identifies the longest child operation.",
      },
      {
        key: "c",
        label:
          "Inspect the histogram first; its P99 identifies the child operation taken by this request.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-signal-fit",
          label:
            "Match the per-request operation-timing question to the available trace.",
          cause:
            "The choice treats log volume as elapsed time or treats a population distribution as a reconstruction of one request.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "The complete trace is the direct first inspection for recorded child timing. Correlated logs may explain events inside an interval, while the histogram addresses prevalence and distribution. Neither log count nor population P99 identifies this request's longest child.",
      nextStep:
        "Change the question to 'How often does this happen?' and identify the population measurement needed alongside the trace.",
    },
    helpLevels: [
      "Keep one request's structure separate from population frequency.",
      "The available logs lack durations; the histogram lacks parent-child operation paths.",
      "Choose a: inspect child-span timing, then use logs for details and metrics for prevalence.",
    ],
  },
  {
    id: "t-60-find-flaw",
    conceptId: 60,
    type: "find-flaw",
    prompt:
      "Find the unsupported conclusion and choose the best correction.",
    context:
      "A slow-request sampler retains trace T: root duration 900 ms, including an 800 ms client span for a search dependency. There are no remote child spans or CPU measurements. A draft says: 'The search service's CPU caused the delay for most requests.'",
    options: [
      {
        key: "a",
        label:
          "The 800 ms interval is an investigation target, but neither remote CPU causation nor population prevalence is established.",
      },
      {
        key: "b",
        label:
          "CPU causation is established by the long client span, but prevalence needs more samples.",
      },
      {
        key: "c",
        label:
          "Prevalence is established because the sampler selected a slow request, but CPU causation needs remote spans.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-trace-limits",
          label:
            "Reject both the unmeasured CPU mechanism and the biased-sample population inference.",
          cause:
            "The correction still mistakes caller-observed elapsed time for remote CPU work or ignores that a slow-request sampler cannot establish population frequency.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "The client span establishes 800 ms of recorded elapsed time for this sampled request. Connection wait, network delay, remote queueing, and execution remain possible contributors. The slow-request sampling rule also prevents inferring that most requests share this behavior.",
      nextStep:
        "Specify separate evidence requests for remote execution mechanism and population frequency.",
    },
    helpLevels: [
      "Underline each claim that needs evidence: CPU, cause, and most requests.",
      "A client span measures elapsed time, and the sample was selected for slowness.",
      "Choose a: the interval is real evidence for this request, but CPU causation and prevalence remain unsupported.",
    ],
  },
  {
    id: "t-61-predict",
    conceptId: 61,
    type: "predict",
    prompt:
      "Before changing the dashboard window, predict both displayed rates. Choose one.",
    context:
      "A completed-request counter is 2,000 at t=0 min, 2,600 at t=1 min, and 2,600 at t=5 min. Collection is complete, no counter reset occurs, and the dashboard divides endpoint increase by elapsed seconds.",
    options: [
      {
        key: "a",
        label:
          "The [0,1] window shows 10 requests/s; [0,5] shows 2 requests/s. The longer average hides the first-minute burst.",
      },
      {
        key: "b",
        label:
          "Both windows show 10 requests/s because the counter increase is the same.",
      },
      {
        key: "c",
        label:
          "The windows show 600 and 120 requests/s respectively because their durations are one and five minutes.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-window-rate",
          label:
            "Divide the same event increase by each interval in seconds and preserve the burst interpretation.",
          cause:
            "The prediction ignores elapsed duration or divides by minutes while labeling the result as requests per second.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "Both intervals contain a 600-request increase. Over 60 seconds that is 10 requests/s; over 300 seconds it is 2 requests/s. The five-minute average includes four minutes without additional completions and does not disprove the burst.",
      nextStep:
        "Repeat the calculation with a new interval and explicitly state what a smoothed average cannot reveal about individual seconds.",
    },
    helpLevels: [
      "Calculate the counter increase before calculating a rate.",
      "Convert one minute to 60 seconds and five minutes to 300 seconds.",
      "Choose a: 600 / 60 = 10 requests/s and 600 / 300 = 2 requests/s.",
    ],
  },
  {
    id: "t-61-compare",
    conceptId: 61,
    type: "compare",
    prompt:
      "Choose the measurement plan that can answer whether more eligible searches exceed 500 ms.",
    context:
      "Traffic volume doubled. You need to compare the fraction of eligible searches exceeding 500 ms before and after, across all replicas. Compatible request-duration histograms include a 500 ms boundary and total observation counts. Per-replica P99 summaries and cumulative request counters are also available.",
    options: [
      {
        key: "a",
        label:
          "Combine compatible histogram counts across replicas within each comparison window, then calculate the share above 500 ms.",
      },
      {
        key: "b",
        label:
          "Average per-replica P99 values in each window and compare the two averages with 500 ms.",
      },
      {
        key: "c",
        label:
          "Compare cumulative request-counter totals; higher totals reveal a higher fraction of slow searches.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-duration-population",
          label:
            "Retain duration-threshold counts and a matching population denominator.",
          cause:
            "The measurement substitutes averaged percentiles or traffic totals for the distribution counts needed to calculate a slow-event fraction.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "Compatible histogram counts can be combined across replicas for the same interval and eligibility scope. Subtract the count at or below 500 ms from the total, then divide by the total. Averaged P99 values cannot reconstruct this fraction, and request totals contain no duration distribution.",
      nextStep:
        "Remove the exact 500 ms boundary and explain why the fraction may then be bounded or estimated rather than known exactly.",
    },
    helpLevels: [
      "The question concerns a fraction above a duration threshold, not traffic growth.",
      "You need both duration-threshold counts and all eligible observations from matching windows.",
      "Choose a: combine compatible histogram counts, calculate above-threshold counts, and divide by the matching total.",
    ],
  },
  {
    id: "t-63-compare",
    conceptId: 63,
    type: "compare",
    prompt:
      "Choose one justified SLO policy. Two policies are defensible under the stated constraints; feedback explains their trade-offs.",
    context:
      "For an internal document-search tool, user research supports either 99.5% or 99.9% correct results within 500 ms over rolling 28 days. Both are feasible. The stricter option requires additional engineering investment that delays a useful feature. Both policies use the same eligibility definition, count a failed or slow search once as bad, and keep monitoring severe individual failures.",
    options: [
      {
        key: "a",
        label:
          "Choose 99.5% and use the saved reliability investment for the feature, accepting a larger bad-event allowance.",
      },
      {
        key: "b",
        label:
          "Choose 99.9% and fund additional reliability work, accepting the feature delay and smaller bad-event allowance.",
      },
      {
        key: "c",
        label:
          "Choose 100% without changing investment because a zero budget makes measured failures less likely.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-contextual-slo",
          label:
            "Choose a feasible user-supported target while acknowledging its investment and budget trade-off.",
          cause:
            "The policy treats a zero error budget as a mechanism that prevents failures rather than as an unforgiving target requiring justified investment.",
          check: (a) =>
            exactlyOne(a, "a") || exactlyOne(a, "b"),
        },
      ],
      validAlternatives: [
        {
          picks: ["a"],
          tradeoff:
            "99.5% allows 500 bad events per 100,000 eligible searches. It preserves feature capacity while accepting more measured failure than 99.9%; user needs must remain under review.",
        },
        {
          picks: ["b"],
          tradeoff:
            "99.9% allows 100 bad events per 100,000 eligible searches. It supports a stronger experience target but consumes more engineering capacity and delays the feature.",
        },
      ],
      expected:
        "Both 99.5% and 99.9% are defensible because the scenario explicitly supports and funds either choice. Their bad-event allowances differ by a factor of five. A 100% target leaves no budget but does not prevent faults or eliminate engineering costs.",
      nextStep:
        "Change the user requirement or investment constraint and explain which previously valid choice may cease to be defensible.",
    },
    helpLevels: [
      "Separate the measured user experience from the investment decision.",
      "For 100,000 events, compare 0.5% and 0.1% bad-event allowances.",
      "Choose a or b, not both: both are supported here, with different budget and investment trade-offs; 100% does not prevent failures.",
    ],
  },
  {
    id: "t-63-find-flaw",
    conceptId: 63,
    type: "find-flaw",
    prompt:
      "Choose the revision that fixes the mismatch between the stated experience and its SLI.",
    context:
      "A photo-export product says '99.9% of exports are usable within two minutes over rolling 28 days.' Its proposed SLI counts only successful HTTP responses from the job-submission endpoint. That endpoint can return 202 while queued work later fails or produces a corrupt file.",
    options: [
      {
        key: "a",
        label:
          "Measure eligible export jobs producing a verified usable file within two minutes of accepted submission, including failed and missing completions as bad once their deadline passes.",
      },
      {
        key: "b",
        label:
          "Keep counting successful submission responses, but raise the target to 99.99% to account for downstream failures.",
      },
      {
        key: "c",
        label:
          "Measure completion time only among successful finished jobs, excluding jobs that fail or never complete.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-user-experience-sli",
          label:
            "Measure the promised end-to-end result without removing failed or missing outcomes from eligibility.",
          cause:
            "The revision either tightens an unrelated submission metric or introduces survivorship bias by excluding jobs that fail to produce a usable result.",
          check: (a) => exactlyOne(a, "a"),
        },
      ],
      expected:
        "The SLI must follow eligible jobs from accepted submission to a usable output within two minutes. A 202 confirms acceptance, not completion. Failed jobs and jobs missing the deadline must remain in the evaluated population, with a clear maturity rule for jobs whose two-minute allowance has not elapsed.",
      nextStep:
        "Define how the evaluator treats a job accepted 30 seconds before the reporting snapshot so it is not prematurely labeled late.",
    },
    helpLevels: [
      "Compare the promise's endpoint with the measurement's endpoint.",
      "Submission success and usable export completion are different events.",
      "Choose a: measure timely usable outputs for all eligible jobs after their deadline can be evaluated, including failed and missing completions.",
    ],
  },
];
