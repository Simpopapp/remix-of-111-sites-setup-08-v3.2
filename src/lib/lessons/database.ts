import type { Lesson } from "./types";

export const LESSONS_DATABASE: Lesson[] = [
  {
    id: 81,
    rev: "2.1",
    objective:
      "Order a database change around the readers and writers that remain active, and identify the evidence required before removing an old field.",
    prereqIds: [],
    mentalModel: {
      definition:
        "A database migration is a controlled transition of stored structure or data. Its safety depends on intermediate states, active application versions, concurrent writes, and recovery constraints, not just the final schema.",
      analogy:
        "A library replaces its catalog cards while visitors still use the old drawers.",
      analogyLimits:
        "Database writers can change records during copying, and schema operations can lock tables or rewrite data. Keeping two drawers does not automatically keep their contents consistent.",
      correspondence: [
        ["Expanded schema", "Old and new catalog drawers coexist"],
        ["Backfill", "Copy existing cards into the new drawer"],
        ["Contract phase", "Remove the retired drawer after its users leave"],
      ],
    },
    scenario: {
      system: "A library service changing a required member nickname into a display label.",
      data:
        "There are 100,000 members. Old servers read and write nickname. The target application uses display_label with the same string meaning. Servers cannot all switch at once.",
      symptom:
        "A direct column rename passes a new-server test but makes old-server queries fail.",
      constraints: [
        "Reads and writes continue during the transition.",
        "Old writers do not know display_label.",
        "The intermediate schema must support old-server rollback.",
        "No database-specific online DDL guarantee is assumed.",
      ],
      baseline:
        "The original schema contains nickname only. A direct rename removes the identifier that old servers still query.",
    },
    representation: {
      kind: "query-explainer",
      caption:
        "Inspect the intermediate contracts and costs before removing the old column.",
      data: {
        statement:
          "Illustrative transition: members.nickname -> members.display_label; both store the same string meaning.",
        versions: [
          {
            label: "Direct replacement",
            plan: [
              {
                step: "Rename",
                detail:
                  "Rename nickname to display_label while old servers remain.",
                cost: "Potential DDL locking; old queries lose their column.",
              },
              {
                step: "Deploy",
                detail:
                  "New servers work, but old servers can still receive traffic.",
                cost: "Mixed-version failures until old readers and writers leave.",
              },
            ],
          },
        ],
        plan: [
          {
            step: "Expand",
            detail:
              "Add nullable display_label while preserving nickname; assess DDL behavior first.",
            cost: "Extra storage; lock or rewrite behavior depends on the database.",
          },
          {
            step: "Bridge writes",
            detail:
              "Establish a database-side bridge that copies nickname changes into display_label in the same transaction. Keep nickname authoritative while old writers exist.",
            cost: "Extra write work and bridge maintenance.",
          },
          {
            step: "Backfill",
            detail:
              "Copy existing nickname values in bounded batches with concurrency control so a stale copy cannot overwrite a newer bridged value.",
            cost: "Table reads, writes, logging, and contention.",
          },
          {
            step: "Verify and switch",
            detail:
              "Verify coverage and equality, then move reads to display_label. Keep writes through nickname and the bridge during the rollback window.",
            cost: "Validation queries and a temporary dual-field contract.",
          },
          {
            step: "Contract",
            detail:
              "After old users and the rollback window are retired, coordinate the final writer switch and remove the bridge and nickname.",
            cost: "Loss of old-code rollback; DDL still requires assessment.",
          },
        ],
        note:
          "Didactic model, not executable SQL or a production runbook. Transactional bridge behavior, batch concurrency control, DDL locks, and recovery must be designed for the actual database.",
      },
      textEquivalent:
        "A direct rename breaks old servers because nickname disappears. A staged transition first preserves nickname and adds display_label, then bridges old writes transactionally. A concurrency-safe backfill copies existing values in bounded batches. Equality and coverage are verified before reads switch; writes continue through nickname during the rollback window. Only after old users and that window are retired can the final writer switch, bridge removal, and column removal be coordinated. The staged plan adds storage, write work, validation, and operational complexity; it does not guarantee lock-free DDL.",
    },
    worked: {
      decision:
        "Use a staged transition with one authoritative write path during coexistence, and make contraction conditional on compatibility and data evidence.",
      reasoning: [
        "List old readers and writers first: both require nickname, so the first schema change must preserve it.",
        "A new-application dual write alone misses old-server writes. The scenario therefore needs a bridge covering those writers or a different coordination strategy.",
        "Keep nickname authoritative while old writers exist; otherwise two independently writable fields can disagree.",
        "Backfill under concurrency control and verify both missing values and mismatches. Finishing a batch job alone does not establish consistency.",
        "Preserving nickname and its write path supports old-code rollback during the stated window, but only while data meanings remain compatible.",
        "Retire old users and rollback expectations before contraction. Dropping the column cannot be undone safely merely by redeploying old code.",
      ],
    },
    contrast: [
      {
        alternative: "Use a coordinated maintenance window",
        tradeoff:
          "Stopping all affected readers and writers can simplify a small migration, but introduces downtime and still requires data validation and recovery planning.",
        whenNotToUse:
          "Do not add a multi-release bridge to a disposable database or a small system whose users explicitly accept a verified maintenance window; conversely, do not assume a window is available when clients cannot be stopped.",
      },
    ],
    misconceptions: [
      {
        wrong: "Adding a column, deploying new code, and copying rows is automatically safe.",
        discriminant:
          "Identify every writer active during the copy and how its updates reach the target field.",
        counterexample:
          "An old server updates nickname after its row was copied. Without a bridge or reconciliation protocol, display_label retains the previous value.",
      },
    ],
    practiceIds: ["t-81-order", "t-81-find-flaw"],
    evidenceCriteria: [
      "Preserve fields needed by active readers and writers.",
      "Explain how concurrent old-version writes reach the new field.",
      "Require data validation and retirement evidence before contraction.",
      "State why code rollback does not reverse destructive data changes.",
    ],
    transfer: {
      variant:
        "Move a museum inventory identifier to a new field while overnight importers still write the old field.",
      domain: "Museum inventory",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 81. The bridge and data volume are teaching assumptions; database-specific technical review and executable migration design remain pending.",
    },
  },
  {
    id: 82,
    rev: "2.1",
    objective:
      "Build a directional compatibility matrix for application queries against old and new database schemas, without treating a schema number as proof of compatibility.",
    prereqIds: [],
    mentalModel: {
      definition:
        "Schema versioning records the evolution of stored structures and their migration history. Compatibility is a separate relation between a particular reader or writer and a particular schema.",
      analogy:
        "A revised form can keep the boxes that older clerks still fill in.",
      analogyLimits:
        "A revision label does not show whether a clerk uses a removed box. Database compatibility also includes types, constraints, defaults, queries, and data meaning.",
      correspondence: [
        ["Schema revision", "Identified edition of the form"],
        ["Query contract", "Boxes a clerk expects to read or fill"],
        ["Compatibility test", "Try that clerk's actual procedure on that edition"],
      ],
    },
    scenario: {
      system: "A member service with independently deployed application versions.",
      data:
        "S1 has members(id, nickname). S2 adds locale NOT NULL DEFAULT 'en' and keeps nickname. S3 removes nickname. A1 explicitly reads id and nickname and inserts only those fields. A2 also explicitly reads and writes locale.",
      symptom:
        "A recorded migration history is mistaken for permission to run any application version against any schema.",
      constraints: [
        "Queries name columns explicitly; there is no positional decoding or SELECT *.",
        "The locale default is acceptable for A1-created members.",
        "A2 has no fallback when locale is absent.",
        "Only the stated query contracts are assessed.",
      ],
      baseline:
        "A1 works with S1. Compatibility for other combinations must be checked rather than inferred from increasing revision numbers.",
    },
    representation: {
      kind: "table",
      caption:
        "Check each application against each schema; directions are not interchangeable.",
      data: {
        columns: [
          { key: "pair", label: "Application × schema", emphasis: true },
          { key: "result", label: "Outcome" },
          { key: "reason", label: "Reason" },
        ],
        rows: [
          {
            cells: {
              pair: "A1 × S1",
              result: "PASS — baseline",
              reason: "Required columns exist.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "A1 × S2",
              result: "PASS — old application on new schema",
              reason: "nickname remains; omitted locale gets an acceptable default.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "A2 × S1",
              result: "FAIL — new application on old schema",
              reason: "locale queries reference an absent column.",
            },
            tone: "down",
          },
          {
            cells: {
              pair: "A2 × S2",
              result: "PASS — matching contract",
              reason: "nickname and locale both exist.",
            },
            tone: "ok",
          },
          {
            cells: {
              pair: "A1 × S3",
              result: "FAIL — removed field",
              reason: "A1 still queries nickname.",
            },
            tone: "down",
          },
          {
            cells: {
              pair: "A2 × S3",
              result: "FAIL — removed field",
              reason: "Adding locale did not remove A2's nickname dependency.",
            },
            tone: "down",
          },
        ],
        note:
          "Compatibility is limited to the stated reads and writes. Extra columns can break positional consumers; defaults must also preserve business meaning. Schema revisions are not API versions.",
      },
      textEquivalent:
        "A1 works on S1 and S2: nickname remains, and S2 supplies an acceptable locale default on inserts. A2 works on S2 but fails on S1 because locale is absent. Both A1 and A2 fail on S3 because both still query the removed nickname column. Thus old-application-on-new-schema compatibility does not imply new-application-on-old-schema compatibility.",
    },
    worked: {
      decision:
        "Record schema history and test a directional matrix of actual application reads and writes before allowing mixed revisions.",
      reasoning: [
        "In this lesson, backward compatibility means an old application works against the new schema; forward compatibility means a new application works against the old schema. Other contexts use these labels differently, so retain the explicit pair.",
        "A1 on S2 is backward compatible under the stated explicit-column and acceptable-default assumptions.",
        "A2 on S1 is not forward compatible because its locale query cannot succeed.",
        "Removing nickname breaks both stated applications, even though S3 is a newer recorded revision.",
        "A schema revision tracks storage evolution. An API version tracks an external contract; an adapter can preserve the API while storage changes.",
      ],
    },
    contrast: [
      {
        alternative: "Use a simple ordered migration history without a broad support matrix",
        tradeoff:
          "A single application stopped during migration may need only its before/after contracts, rather than long-lived multi-version support.",
        whenNotToUse:
          "Do not maintain elaborate schema-version negotiation for a disposable local database. Do not omit compatibility analysis when multiple application versions actually coexist.",
      },
    ],
    misconceptions: [
      {
        wrong: "A new schema revision supports every older application.",
        discriminant:
          "Compare the application's required columns and accepted meanings with the new schema.",
        counterexample:
          "S3 has a later revision number but removes nickname, so A1's explicit SELECT fails.",
      },
    ],
    practiceIds: ["t-82-predict", "t-82-variant"],
    evidenceCriteria: [
      "Distinguish old-application/new-schema from new-application/old-schema compatibility.",
      "Explain why an acceptable default can preserve an old insert.",
      "Predict failure from a removed or incompatible field.",
      "Separate migration history, storage schema, and external API contract.",
    ],
    transfer: {
      variant:
        "Assess old and new archive importers against record layouts with an added defaulted field and a removed accession field.",
      domain: "Digital archives",
    },
    provenance: {
      reviewed: false,
      notes:
        "Expanded from canonical concept 82. Compatibility terminology is explicitly scoped to application/schema pairs. Independent technical review is pending.",
    },
  },
];
