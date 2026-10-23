/**
 * Contratos de dados dos instrumentos D6/D17.
 * Browser-safe: tipos e reexports de componentes de apresentação.
 */
export type { RequestFlowData } from "./request-flow";
export type { StateMachineData } from "./state-machine";
export type { HistogramData } from "./latency-histogram";

export interface EventTrackData {
  unit: string;
  lanes: {
    id: string;
    label: string;
    kind: "actor" | "signal";
  }[];
  events: {
    ts: number;
    lane: string;
    label: string;
    kind: "info" | "success" | "warn" | "fail";
  }[];
  window?: {
    from: number;
    to: number;
  };
  note: string;
}

export interface TableData {
  columns: {
    key: string;
    label: string;
    emphasis?: boolean;
  }[];
  rows: {
    cells: Record<string, string | number>;
    tone?: "ok" | "warn" | "down";
  }[];
  note: string;
}

export interface QueryExplainerData {
  statement: string;
  versions?: {
    label: string;
    plan: {
      step: string;
      detail: string;
      cost?: string;
    }[];
  }[];
  plan: {
    step: string;
    detail: string;
    cost?: string;
  }[];
  note: string;
}

export { EventTrackInstrument } from "./event-track";
export { TableInstrument } from "./table";
export { QueryExplainerInstrument } from "./query-explainer";
