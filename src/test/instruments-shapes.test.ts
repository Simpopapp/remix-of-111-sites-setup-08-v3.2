import { describe, it } from "vitest";
import { LESSONS } from "@/lib/lessons";
import type {
  EventTrackData,
  TableData,
  QueryExplainerData,
} from "@/components/instruments";

type Dict = Record<string, unknown>;

function assert(
  condition: unknown,
  path: string,
  requirement: string,
): asserts condition {
  if (!condition) throw new Error(`${path}: ${requirement}`);
}

function object(value: unknown, path: string): Dict {
  assert(
    typeof value === "object" && value !== null && !Array.isArray(value),
    path,
    "expected an object",
  );
  return value as Dict;
}

function array(value: unknown, path: string): unknown[] {
  assert(Array.isArray(value), path, "expected an array");
  return value;
}

function text(value: unknown, path: string): void {
  assert(
    typeof value === "string" && value.trim().length > 0,
    path,
    "expected a non-empty string",
  );
}

function number(value: unknown, path: string): asserts value is number {
  assert(
    typeof value === "number" && Number.isFinite(value),
    path,
    "expected a finite number",
  );
}

function oneOf(
  value: unknown,
  options: readonly string[],
  path: string,
): void {
  assert(
    typeof value === "string" && options.includes(value),
    path,
    `expected one of ${options.join(", ")}`,
  );
}

export function assertEventTrackData(
  value: unknown,
  path = "event-track",
): asserts value is EventTrackData {
  const data = object(value, path);
  text(data["unit"], `${path}.unit`);
  text(data["note"], `${path}.note`);

  const laneIds = new Set<string>();
  array(data["lanes"], `${path}.lanes`).forEach((value, index) => {
    const p = `${path}.lanes[${index}]`;
    const lane = object(value, p);
    text(lane["id"], `${p}.id`);
    text(lane["label"], `${p}.label`);
    oneOf(lane["kind"], ["actor", "signal"], `${p}.kind`);
    const id = lane["id"] as string;
    assert(!laneIds.has(id), `${p}.id`, "duplicate lane id");
    laneIds.add(id);
  });

  array(data["events"], `${path}.events`).forEach((value, index) => {
    const p = `${path}.events[${index}]`;
    const event = object(value, p);
    number(event["ts"], `${p}.ts`);
    text(event["lane"], `${p}.lane`);
    assert(
      laneIds.has(event["lane"] as string),
      `${p}.lane`,
      "must reference a declared lane",
    );
    text(event["label"], `${p}.label`);
    oneOf(
      event["kind"],
      ["info", "success", "warn", "fail"],
      `${p}.kind`,
    );
  });

  if ("window" in data) {
    const window = object(data["window"], `${path}.window`);
    const from = window["from"];
    const to = window["to"];
    number(from, `${path}.window.from`);
    number(to, `${path}.window.to`);
    assert(from <= to, `${path}.window`, "from must be <= to");
  }
}

export function assertTableData(
  value: unknown,
  path = "table",
): asserts value is TableData {
  const data = object(value, path);
  text(data["note"], `${path}.note`);

  const keys = new Set<string>();
  array(data["columns"], `${path}.columns`).forEach((value, index) => {
    const p = `${path}.columns[${index}]`;
    const column = object(value, p);
    text(column["key"], `${p}.key`);
    text(column["label"], `${p}.label`);
    const key = column["key"] as string;
    assert(!keys.has(key), `${p}.key`, "duplicate column key");
    keys.add(key);
    if ("emphasis" in column) {
      assert(
        typeof column["emphasis"] === "boolean",
        `${p}.emphasis`,
        "expected a boolean",
      );
    }
  });

  array(data["rows"], `${path}.rows`).forEach((value, index) => {
    const p = `${path}.rows[${index}]`;
    const row = object(value, p);
    const cells = object(row["cells"], `${p}.cells`);
    for (const [key, cell] of Object.entries(cells)) {
      assert(
        typeof cell === "string" ||
          (typeof cell === "number" && Number.isFinite(cell)),
        `${p}.cells.${key}`,
        "expected a string or finite number",
      );
    }
    for (const key of keys) {
      assert(
        Object.prototype.hasOwnProperty.call(cells, key),
        `${p}.cells.${key}`,
        "missing declared column",
      );
    }
    if ("tone" in row) {
      oneOf(row["tone"], ["ok", "warn", "down"], `${p}.tone`);
    }
  });
}

function assertPlan(value: unknown, path: string): void {
  array(value, path).forEach((value, index) => {
    const p = `${path}[${index}]`;
    const step = object(value, p);
    text(step["step"], `${p}.step`);
    text(step["detail"], `${p}.detail`);
    if ("cost" in step) text(step["cost"], `${p}.cost`);
  });
}

export function assertQueryExplainerData(
  value: unknown,
  path = "query-explainer",
): asserts value is QueryExplainerData {
  const data = object(value, path);
  text(data["statement"], `${path}.statement`);
  text(data["note"], `${path}.note`);
  assertPlan(data["plan"], `${path}.plan`);

  if ("versions" in data) {
    array(data["versions"], `${path}.versions`).forEach((value, index) => {
      const p = `${path}.versions[${index}]`;
      const version = object(value, p);
      text(version["label"], `${p}.label`);
      assertPlan(version["plan"], `${p}.plan`);
    });
  }
}

describe("instruments — shapes D17 das lições integradas", () => {
  it("valida todas as representações dos três kinds, sem exigir cobertura mínima", () => {
    // Se não houver lições desses kinds, o loop passa sem falhar.
    // Não filtrar por revisão, categoria ou presença de campos:
    // dados legados incompatíveis também devem ser denunciados.
    for (const lesson of LESSONS) {
      const spec = lesson.representation;
      const path = `lesson ${lesson.id}.representation.data`;
      switch (spec.kind) {
        case "event-track":
          assertEventTrackData(spec.data, path);
          break;
        case "table":
          assertTableData(spec.data, path);
          break;
        case "query-explainer":
          assertQueryExplainerData(spec.data, path);
          break;
      }
    }
  });
});
