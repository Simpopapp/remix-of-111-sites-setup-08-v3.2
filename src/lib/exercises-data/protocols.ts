import type { Task } from "@/lib/exercises";

export const TASKS_PROTOCOLS: Task[] = [
  {
    id: "t-102-predict",
    conceptId: 102,
    type: "predict",
    prompt:
      "Predict the effect on the installed client for the two candidate server changes. Choose one.",
    context:
      "A deployed reading-list client calls GET /books and requires title to be a string. It ignores unknown response fields. Candidate A adds optional subtitle while retaining title and its meaning. Candidate B replaces title with displayTitle at the same route. There is no version negotiation or response adapter. Consider each candidate independently.",
    options: [
      {
        key: "a",
        label: "The client works with A and B.",
      },
      {
        key: "b",
        label: "The client works with A and fails with B.",
      },
      {
        key: "c",
        label: "The client fails with A and works with B.",
      },
      {
        key: "d",
        label: "The client fails with A and B.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "impact",
          label: "Distinguish tolerated additions from a missing required field.",
          cause:
            "The prediction assumes either that every added field is breaking or that a new field name automatically satisfies an old client's required title contract.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "A preserves the required title and adds a field the client ignores. B removes title, so the installed client fails even if the replacement server works with a newly written client.",
      nextStep:
        "Change the client to reject unknown fields and reassess A; compatibility depends on real consumer behavior.",
    },
    helpLevels: [
      "List what this installed client requires and what it tolerates.",
      "Do not infer a field-name mapping that the scenario does not implement.",
      "Option b follows the stated decoder: subtitle is ignored, but displayTitle cannot replace the missing title.",
    ],
  },
  {
    id: "t-102-compare",
    conceptId: 102,
    type: "compare",
    prompt:
      "Choose one release strategy that meets all stated constraints. More than one strategy can be valid; compare its support cost in the feedback.",
    context:
      "A public archive API must introduce an incompatible result shape while keeping its existing shape available for six months. Consumers can select either a URL version or a custom request header. The gateway can route both; caches and logs can be configured to distinguish header values. The team can support two contracts. GET requests have no body. No consumer can be forced to upgrade immediately.",
    options: [
      {
        key: "a",
        label:
          "Keep the old route and add a separate /v2 route with its own response adapter.",
      },
      {
        key: "b",
        label:
          "Keep the resource URL and select the old or new response adapter with a version header.",
      },
      {
        key: "c",
        label:
          "Replace the existing response shape and announce a new package version.",
      },
      {
        key: "d",
        label:
          "Require a version field in a GET request body and remove the old shape.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-contract",
          label: "Keep the old contract selectable during the support period.",
          cause:
            "The strategy removes a contract that consumers still require, or treats a package label as runtime contract selection.",
          check: (a) =>
            a.picked?.length === 1 &&
            (a.picked[0] === "a" || a.picked[0] === "b"),
        },
      ],
      validAlternatives: [
        {
          picks: ["a"],
          tradeoff:
            "URL selection is visible in links, routing, and logs, but adds route and documentation surfaces. Both adapters still need tests and a retirement policy.",
        },
        {
          picks: ["b"],
          tradeoff:
            "Header selection preserves resource URLs but requires explicit client configuration, gateway observability, and correct cache separation, including Vary where applicable. Both adapters still need support.",
        },
      ],
      expected:
        "Both a and b can preserve the old contract under the stated capabilities. Neither is universally superior. A new package number alone does not adapt old requests. The body-based proposal conflicts with the bodyless GET constraint and also removes required support.",
      nextStep:
        "Remove custom-header support from one consumer and reassess which strategy remains feasible.",
    },
    helpLevels: [
      "Separate where a version is selected from whether both contracts remain implemented.",
      "The scenario explicitly supports both URL and header routing, but not GET-body selection.",
      "Either a or b meets the constraints. Compare visible route proliferation with header-aware client, cache, and logging configuration.",
    ],
  },
  {
    id: "t-103-find-flaw",
    conceptId: 103,
    type: "find-flaw",
    prompt:
      "Which release claim conflicts with the library's declared stable public API? Choose one.",
    context:
      "A library is at 1.6.2. Its documented normalize(value) function returns a string, and existing callers use string methods on it. Each proposal is an independent next release. Assume the stated compatibility claims for the other changes are verified.",
    options: [
      {
        key: "a",
        label:
          "Publish 1.6.3 for an internal leak fix that preserves the public contract.",
      },
      {
        key: "b",
        label:
          "Publish 1.7.0 for a new optional normalizeMany function while retaining existing behavior.",
      },
      {
        key: "c",
        label:
          "Publish 1.6.3 when normalize starts returning an object, describing it as a small cleanup.",
      },
      {
        key: "d",
        label:
          "Publish 2.0.0 when removing normalize and requiring callers to use another function.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "mismatch",
          label: "Compare the version promise with an existing caller's assumptions.",
          cause:
            "The diagnosis classifies a release by implementation size or its cleanup label instead of the documented return-type contract.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "Proposal c breaks the documented string return type while promising a backward-compatible patch. Under the stated stable API, the incompatible change requires 2.0.0. A major increment signals migration work but does not perform it.",
      nextStep:
        "Write one existing string-method call and show how it behaves before and after the proposed return-type change.",
    },
    helpLevels: [
      "Ignore the words small and cleanup; trace an existing call.",
      "The public return type is part of the stable API.",
      "Option c violates the PATCH promise: callers receive an object where they were promised a string.",
    ],
  },
  {
    id: "t-103-compare",
    conceptId: 103,
    type: "compare",
    prompt:
      "Choose a proportionate identification policy for these two components. Two alternatives are acceptable under the stated constraints.",
    context:
      "Component P is a published stable library with independently upgrading consumers who rely on its declared public API. Component I is a private helper built and deployed atomically with one application; it has no separately distributed artifact or independent consumers. Both need reproducible source identification. The team can maintain either shared release automation or separate policies.",
    options: [
      {
        key: "a",
        label:
          "Use public SemVer for P and identify I through the application's immutable build and source revision.",
      },
      {
        key: "b",
        label:
          "Use public SemVer for P and internal SemVer labels plus immutable source revisions for I.",
      },
      {
        key: "c",
        label:
          "Use source revisions only for P and I, withdrawing P's compatibility promise.",
      },
      {
        key: "d",
        label:
          "Increment P's patch number for every change and rely on I's build identifier for traceability.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "choice-proportionality",
          label: "Preserve the public promise without confusing it with traceability.",
          cause:
            "The policy either removes a promise that independent consumers rely on or treats every public change as a compatible patch. Source identification and compatibility signaling solve different problems.",
          check: (a) =>
            a.picked?.length === 1 &&
            (a.picked[0] === "a" || a.picked[0] === "b"),
        },
      ],
      validAlternatives: [
        {
          picks: ["a"],
          tradeoff:
            "P keeps its consumer-facing compatibility signal. I avoids a separate release taxonomy while remaining traceable through the atomic application build.",
        },
        {
          picks: ["b"],
          tradeoff:
            "A shared internal release convention can simplify automation, but I's separate semantic labels add bookkeeping without protecting any independent consumer in this scenario.",
        },
      ],
      expected:
        "Both a and b preserve P's public SemVer commitment and reproducibility. A is leaner for I; b can be justified by shared tooling. Neither labeling policy replaces compatibility tests or preserves an old live service contract automatically.",
      nextStep:
        "Give I an independently upgrading plugin consumer and explain why its compatibility policy now needs reconsideration.",
    },
    helpLevels: [
      "Identify who upgrades independently and who needs only reproducible identification.",
      "P has a public compatibility promise; I has no independent release boundary.",
      "Both a and b are acceptable. A avoids unnecessary labels for I; b trades extra bookkeeping for a shared convention.",
    ],
  },
];
