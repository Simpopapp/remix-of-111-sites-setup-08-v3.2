import type { Lesson } from "./types";

export const LESSONS_PROTOCOLS: Lesson[] = [
  {
    id: 102,
    rev: "2.1",
    objective:
      "Predict which client-server pairs survive an API contract change and compare version-selection strategies against client and support constraints.",
    prereqIds: [],
    mentalModel: {
      definition:
        "API versioning identifies externally observable contracts so incompatible behaviors can be selected and supported deliberately. A version identifier does not itself preserve the previous contract.",
      analogy:
        "A restaurant keeps an earlier menu available while introducing a different one.",
      analogyLimits:
        "Printing two menu numbers does not keep both kitchens operating. API versions require routing, implementation, testing, documentation, and a retirement policy.",
      correspondence: [
        ["Client-selected version", "Menu edition requested by a guest"],
        ["Contract implementation", "Kitchen able to fulfill that edition"],
        ["Retirement policy", "Notice that an edition will stop being served"],
      ],
    },
    scenario: {
      system: "A reading-list API consumed by installed mobile applications.",
      data:
        "C1 requests v1 and requires title. C2 requests v2 and requires displayTitle. S1 serves only v1. S2 serves both contracts through explicit adapters. S3 serves only v2.",
      symptom:
        "Replacing title with displayTitle succeeds in a new-client test but fails for installed C1 applications.",
      constraints: [
        "Installed applications cannot be upgraded immediately.",
        "Clients reject a missing required field.",
        "Unknown response fields are ignored.",
        "Version selection is explicit; unsupported versions return an error.",
      ],
      baseline:
        "C1 works with S1. Renaming a required response field in place changes the public contract.",
    },
    representation: {
      kind: "table",
      caption:
        "Two implemented contracts preserve more combinations than a new version label alone.",
      data: {
        columns: [
          { key: "pair", label: "Client × server", emphasis: true },
          { key: "result", label: "Outcome" },
          { key: "reason", label: "Contract selected" },
        ],
        rows: [
          {
            cells: {
              pair: "C1 × S1",
              result: "PASS — v1 available",
              reason: "v1 returns title.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "C1 × S2",
              result: "PASS — old client supported",
              reason: "The v1 adapter still returns title.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "C2 × S1",
              result: "FAIL — unsupported version",
              reason: "S1 does not implement v2.",
            },
            tone: "down",
          },
          {
            cells: {
              pair: "C2 × S2",
              result: "PASS — v2 available",
              reason: "v2 returns displayTitle.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "C1 × S3",
              result: "FAIL — v1 retired",
              reason: "A newer server no longer supports C1's request.",
            },
            tone: "down",
          },
          {
            cells: {
              pair: "C2 × S3",
              result: "PASS — v2 available",
              reason: "C2's selected contract remains implemented.",
            },
            tone: "ok",
          },
        ],
        note:
          "This matrix covers required fields and explicit version selection only. Authentication, errors, defaults, ordering, and meaning can also be contractual. Storage schema versions are independent.",
      },
      textEquivalent:
        "C1 works with S1 and S2 because both serve v1 with title, but fails with S3 after v1 retirement. C2 fails with S1 because v2 is unavailable and works with S2 and S3. S2 supports old clients, but that does not make C2 work with an old server. A version label without an implemented adapter would not preserve C1.",
    },
    worked: {
      decision:
        "Keep the v1 contract available while introducing explicitly selected v2, and choose the selection location from actual consumer and routing constraints.",
      reasoning: [
        "Replacing a required field is incompatible; an additive optional field may avoid a new version if real consumers tolerate it and existing meanings remain unchanged.",
        "A URL such as /v2/books makes selection visible in links, routing, and logs, but creates additional route surfaces and migration work.",
        "A header can keep resource URLs stable, but clients must set it and gateways, caches, logs, and documentation must distinguish its values; HTTP caches may require Vary.",
        "A payload version can suit messages or body-based operations, but decoding and routing must inspect the envelope; it is awkward for ordinary bodyless GET requests and cache keys.",
        "Old-client/new-server compatibility and new-client/old-server compatibility are separate checks.",
        "Plan usage evidence, notices, and support costs before retirement. An internal database migration need not change the API if its adapter preserves the external contract.",
      ],
    },
    contrast: [
      {
        alternative: "Extend the existing contract without creating v2",
        tradeoff:
          "An optional addition avoids another supported contract, but only if consumers tolerate extra fields and existing behavior is preserved.",
        whenNotToUse:
          "Do not create a new API version for an invisible query optimization. Do not call a required-field rename an optional extension.",
      },
    ],
    misconceptions: [
      {
        wrong: "Publishing v2 makes the release safe for v1 clients.",
        discriminant:
          "Send the old client's actual request to the new server and inspect the selected response contract.",
        counterexample:
          "S3 advertises v2 but no longer serves v1; C1 still requests v1 and fails.",
      },
    ],
    practiceIds: ["t-102-predict", "t-102-compare"],
    evidenceCriteria: [
      "Predict both directions of client-server compatibility.",
      "Identify incompatible required-field and behavioral changes.",
      "Compare URL, header, and payload selection costs.",
      "Explain when a compatible extension needs no new API version.",
    ],
    transfer: {
      variant:
        "Change an archive search API while desktop applications and scheduled integrations upgrade independently.",
      domain: "Archive search",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 102. Client behavior is explicit rather than assumed universal. This lesson does not prescribe the integrated mission's release sequence. Independent review is pending.",
    },
  },
  {
    id: 103,
    rev: "2.1",
    objective:
      "Classify a release against its declared public contract and distinguish a semantic version promise from actual production compatibility.",
    prereqIds: [],
    mentalModel: {
      definition:
        "For a declared public API after 1.0.0, Semantic Versioning uses MAJOR for incompatible API changes, MINOR for backward-compatible functionality, and PATCH for backward-compatible bug fixes. These numbers communicate a promise to consumers; they do not enforce it.",
      analogy:
        "A replacement-part label says whether it fits existing equipment or requires adaptation.",
      analogyLimits:
        "The label cannot inspect the part, install it, or keep old equipment running. Compatibility must be established by implementation and evidence.",
      correspondence: [
        ["Declared public API", "Published fitting specification"],
        ["Version increment", "Compatibility claim on the label"],
        ["Consumer contract tests", "Check the replacement against existing equipment"],
      ],
    },
    scenario: {
      system: "A stable date-formatting library at version 2.4.1.",
      data:
        "Its public formatDate(date) returns an ISO date string. Release A fixes an internal allocation issue without changing outputs. B adds optional formatDateUtc while preserving existing calls. C changes formatDate to return an object.",
      symptom:
        "A small implementation diff is labeled PATCH even though existing consumers expect a string.",
      constraints: [
        "The declared API includes return types and documented output behavior.",
        "The package is past 1.0.0.",
        "Consumers may select compatible update ranges.",
        "The examples are independent candidate releases from 2.4.1.",
      ],
      baseline:
        "Existing consumers call string methods on formatDate's result.",
    },
    representation: {
      kind: "table",
      caption:
        "Classify by the consumer-visible promise, not by diff size.",
      data: {
        columns: [
          { key: "change", label: "Candidate change", emphasis: true },
          { key: "version", label: "Next version" },
          { key: "result", label: "Existing consumer outcome" },
        ],
        rows: [
          {
            cells: {
              change: "A: allocation fix; same public behavior",
              version: "2.4.2 — PATCH",
              result: "PASS — existing calls and outputs preserved.",
            },
            tone: "ok",
          },
          {
            cells: {
              change: "B: optional new function; old behavior preserved",
              version: "2.5.0 — MINOR",
              result: "PASS — existing calls remain valid.",
            },
            tone: "ok",
          },
          {
            cells: {
              change: "C: string return becomes object",
              version: "3.0.0 — MAJOR",
              result: "FAIL without adaptation — old string operations break.",
            },
            tone: "down",
          },
          {
            cells: {
              change: "C published as 2.4.2",
              version: "Incorrect PATCH promise",
              result: "FAIL — compatible-range consumers may receive a break.",
            },
            tone: "down",
          },
          {
            cells: {
              change: "C labeled 3.0.0 but replaces a live service in place",
              version: "Major label alone",
              result: "RISK — the label does not route or adapt old clients.",
            },
            tone: "warn",
          },
        ],
        note:
          "Candidate releases are independent. SemVer 0.y.z permits initial-development instability; prerelease versions have additional rules. Neither a lockfile nor a version label proves deployed service compatibility.",
      },
      textEquivalent:
        "From 2.4.1, an internal backward-compatible bug fix is 2.4.2; an optional backward-compatible function is 2.5.0; changing the existing return type requires 3.0.0. The return-type change breaks old string consumers even with a correct major label, and publishing it as 2.4.2 additionally violates the compatibility promise. A major label on a live service does not preserve or route its old contract.",
    },
    worked: {
      decision:
        "Classify the change against the declared stable API, then separately verify distribution and runtime compatibility.",
      reasoning: [
        "Define the public contract before choosing the number: signatures, documented behavior, and relevant observable guarantees matter.",
        "Count broken consumer assumptions rather than changed lines. A one-line return-type change can require a major increment.",
        "Use MINOR for backward-compatible functionality and PATCH for backward-compatible bug fixes; adding documented deprecation also calls for MINOR under SemVer.",
        "A correct MAJOR warns consumers but does not make their old code compatible with the new API.",
        "Dependency ranges and lockfiles affect which artifacts are selected; contract tests and migration notes supply different evidence.",
        "For live services, version selection, coexistence, and rollout behavior must be designed separately. A package version and an API route version need not match.",
      ],
    },
    contrast: [
      {
        alternative: "Use a build identifier for a private, jointly deployed component",
        tradeoff:
          "A commit or build identifier can provide traceability without a public SemVer promise, provided there are no independently upgrading consumers relying on that promise.",
        whenNotToUse:
          "Do not invent public major versions for each internal refactor. Do not abandon compatibility signaling for a published stable library merely because its consumers are inconvenient to support.",
      },
    ],
    misconceptions: [
      {
        wrong: "A bug fix is always a patch.",
        discriminant:
          "Ask whether the proposed fix preserves the declared public API for existing consumers.",
        counterexample:
          "Calling an object return value a cleaner fix does not preserve the documented string return type; existing callers still break.",
      },
    ],
    practiceIds: ["t-103-find-flaw", "t-103-compare"],
    evidenceCriteria: [
      "Choose MAJOR, MINOR, or PATCH from the declared consumer contract.",
      "Explain why implementation size and the word fix do not determine compatibility.",
      "Separate version signaling from artifact selection and live service behavior.",
      "Identify a context where public SemVer adds little value.",
    ],
    transfer: {
      variant:
        "Classify changes to a public geometry package and contrast them with a private helper shipped atomically with one application.",
      domain: "Geometry software",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 103 using stable-public-API rules from Semantic Versioning 2.0.0 (https://semver.org/spec/v2.0.0.html). Independent technical review is pending.",
    },
  },
];
