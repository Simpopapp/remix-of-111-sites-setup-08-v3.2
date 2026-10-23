import type { Task } from "@/lib/exercises";

export const TASKS_DATABASE: Task[] = [
  {
    id: "t-81-order",
    conceptId: 81,
    type: "order",
    prompt:
      "Order the four steps. Each step has the prerequisites described below. Which step would lose its justification if an unlisted old writer remained active?",
    context:
      "A read-only archive serves old queries using shelf_code. New queries will use location_code with the same meaning. All writes are paused until this migration finishes. The new query release is allowed only after copied values are verified. The retirement check covers all readers; if an old writer were discovered, that check would also need to cover it before removal. The task evaluates the order; use the retirement step to identify the broken assumption.",
    options: [
      {
        key: "a",
        label: "Release queries that read location_code after verification.",
      },
      {
        key: "b",
        label: "Copy shelf_code into location_code and verify every value.",
      },
      {
        key: "c",
        label: "Confirm old users are retired, then remove shelf_code.",
      },
      {
        key: "d",
        label: "Add location_code while preserving shelf_code.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "sequence",
          label: "Respect field creation, verified copying, and reader retirement.",
          cause:
            "The proposed sequence uses a field before it is ready or removes a field while an old user may still require it.",
          check: (a) => a.order?.join(",") === "d,b,a,c",
        },
      ],
      expected:
        "Add the field, copy and verify while writes are paused, release the new queries, then confirm retirement and remove the old field. Step c loses its justification if an old writer remains: it is still a user of shelf_code. If writes were not paused, this copy-only plan would additionally need a synchronization protocol.",
      nextStep:
        "Remove the write pause and identify how an update arriving during the copy could be lost from location_code.",
    },
    helpLevels: [
      "For each step, list the field and data it requires.",
      "The new query release requires verified values, and removal requires retirement evidence.",
      "The order is d, b, a, c. An undiscovered old writer invalidates c's retirement assumption; live writes would also require synchronization during copying.",
    ],
  },
  {
    id: "t-81-find-flaw",
    conceptId: 81,
    type: "find-flaw",
    prompt:
      "Which observation most directly contradicts the plan's claim that the new field will stay current? Choose one.",
    context:
      "A service adds display_label, copies nickname once, and deploys new servers that write both fields. Old servers remain for one day and still update nickname only. There is no trigger, change capture, or reconciliation. The plan claims that all display_label values stay current because new servers dual-write.",
    options: [
      {
        key: "a",
        label: "The copy runs in batches of 500 rows.",
      },
      {
        key: "b",
        label: "An old server updates nickname after that row was copied.",
      },
      {
        key: "c",
        label: "A new server inserts a row with both values equal.",
      },
      {
        key: "d",
        label: "A read uses an explicit list of columns.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "diagnosis",
          label: "Find a writer outside the claimed synchronization mechanism.",
          cause:
            "The diagnosis treats new-server dual writes as coverage for old servers that do not execute that code.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "b",
        },
      ],
      expected:
        "The old-server update changes nickname but not display_label after the one-time copy. Dual writes in new code cannot synchronize writers still running old code.",
      nextStep:
        "List every active write path and propose either a bridge covering it or a coordinated period without that writer.",
    },
    helpLevels: [
      "Trace one row after its copy has finished.",
      "Ask which versions execute the dual-write code.",
      "Option b supplies a counterexample: the old server changes only nickname, leaving display_label stale.",
    ],
  },
  {
    id: "t-82-predict",
    conceptId: 82,
    type: "predict",
    prompt:
      "Predict the old exporter's behavior on each schema. Choose one.",
    context:
      "The exporter explicitly SELECTs id, code and INSERTs id, code. S1 has those columns. S2 retains them and adds language NOT NULL DEFAULT 'en'; that default is acceptable. S3 instead renames code to numeric_code and changes its type to integer, with no alias or adapter. The exporter still sends alphanumeric values such as 'A7'.",
    options: [
      {
        key: "a",
        label: "Reads and inserts work on S2; both fail on S3.",
      },
      {
        key: "b",
        label: "Reads work but inserts fail on S2; both work on S3.",
      },
      {
        key: "c",
        label: "Both fail on S2; reads work but inserts fail on S3.",
      },
      {
        key: "d",
        label: "Reads and inserts work on both S2 and S3.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "prediction",
          label: "Track explicit column names and omitted-field defaults.",
          cause:
            "The prediction overlooks either S2's acceptable insert default or S3's removal of the exact column the exporter queries.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "a",
        },
      ],
      expected:
        "S2 preserves code and supplies language for old inserts. S3 removes code, so both old SQL statements fail; even merely redirecting the name would not establish that alphanumeric values fit an integer contract.",
      nextStep:
        "Evaluate a new exporter that requires language against S1 to test the opposite compatibility direction.",
    },
    helpLevels: [
      "Evaluate SELECT and INSERT separately.",
      "An omitted field can use a default, but a missing named column cannot.",
      "Option a matches the contract: S2 preserves both operations; S3 removes code and also introduces an incompatible value domain.",
    ],
  },
  {
    id: "t-82-variant",
    conceptId: 82,
    type: "variant",
    prompt:
      "Transfer the compatibility reasoning to archive importers. Choose the accurate matrix summary.",
    context:
      "Layout L1 has accession and title. L2 preserves both and adds collection with default 'general'. Importer I1 reads and writes only accession and title, explicitly by name; 'general' is acceptable. I2 also requires collection and has no fallback. Both importers require accession. L3 removes accession. Assume no adapters or other changes.",
    options: [
      {
        key: "a",
        label: "I1 works on L2; I2 works on L1; both fail on L3.",
      },
      {
        key: "b",
        label: "I1 fails on L2; I2 fails on L1; both work on L3.",
      },
      {
        key: "c",
        label: "I1 works on L2; I2 fails on L1; both fail on L3.",
      },
      {
        key: "d",
        label: "I1 fails on L2; I2 works on L1; both fail on L3.",
      },
    ],
    rubric: {
      criteria: [
        {
          key: "transfer",
          label: "Check both compatibility directions and the shared dependency.",
          cause:
            "The matrix assumes compatibility is symmetric or overlooks that both importers still depend on accession.",
          check: (a) => a.picked?.length === 1 && a.picked[0] === "c",
        },
      ],
      expected:
        "I1 works on L2 because its fields remain and the new default is acceptable. I2 fails on L1 because collection is absent. Both fail on L3 because accession is removed. A newer layout does not imply universal compatibility.",
      nextStep:
        "Add a row for an importer that explicitly tolerates missing collection and explain which result changes.",
    },
    helpLevels: [
      "Write each importer's required fields beside each layout.",
      "The default helps an old writer on L2; it cannot add a field to L1.",
      "Option c preserves the direction of each check and catches the accession dependency shared by both importers.",
    ],
  },
];
