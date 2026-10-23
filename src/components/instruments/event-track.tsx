import { useId } from "react";
import type { RepresentationSpec } from "@/lib/lessons/types";
import type { EventTrackData } from "./index";

export type { EventTrackData } from "./index";

interface Props {
  spec: RepresentationSpec;
  interactive?: boolean;
  onInspect?: (entity: string) => void;
}

const STATUS = {
  info: {
    symbol: "●",
    label: "Info",
    className: "text-info",
  },
  success: {
    symbol: "✓",
    label: "Success",
    className: "text-success",
  },
  warn: {
    symbol: "▲",
    label: "Warning",
    className: "text-warning",
  },
  fail: {
    symbol: "✕",
    label: "Failure",
    className: "text-destructive",
  },
} as const;

export function EventTrackInstrument({
  spec,
  interactive = false,
  onInspect,
}: Props) {
  const titleId = useId();
  // D17: dados editoriais validados pelo teste de contrato.
  const data = spec.data as unknown as EventTrackData;
  const events = data.events
    .map((event, index) => ({ ...event, index }))
    .sort((a, b) => a.ts - b.ts || a.index - b.index);

  // Inclui a janela e todos os eventos: nenhum evento é ocultado ou cortado.
  const times = events.map((event) => event.ts);
  if (data.window) times.push(data.window.from, data.window.to);
  const from = times.length ? Math.min(...times) : 0;
  const to = times.length ? Math.max(...times) : from;
  const position = (ts: number) =>
    to === from ? 50 : ((ts - from) / (to - from)) * 100;

  const canInspect = interactive && typeof onInspect === "function";
  const knownLanes = new Set(data.lanes.map((lane) => lane.id));
  const unassigned = events.filter((event) => !knownLanes.has(event.lane));

  return (
    <figure
      aria-labelledby={titleId}
      className="min-w-0 space-y-4 text-foreground"
    >
      <figcaption id={titleId} className="text-sm font-semibold break-words">
        Event track — {spec.caption}
      </figcaption>

      <p className="text-xs text-muted-foreground">
        Time ({data.unit}): {from} → {to}. Read each lane in ascending
        timestamp order. Equal timestamps do not establish causal order.
      </p>

      <ul aria-label="Event status legend" className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS).map(([kind, status]) => (
          <li key={kind} className={status.className}>
            <span aria-hidden="true">{status.symbol}</span> {status.label}
          </li>
        ))}
      </ul>

      {data.window ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Observation window: {data.window.from}–{data.window.to} {data.unit}
            {" "}(inclusive). Events outside it remain visible and are labelled.
          </p>
          <div
            aria-hidden="true"
            className="relative hidden h-3 rounded border border-border md:block"
          >
            <div
              className="absolute inset-y-0 border-x-2 border-info bg-info/20"
              style={{
                left: `${position(data.window.from)}%`,
                width: `${
                  to === from
                    ? 0
                    : position(data.window.to) - position(data.window.from)
                }%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {data.lanes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lanes supplied.</p>
      ) : null}

      {data.lanes.map((lane) => {
        const laneEvents = events.filter((event) => event.lane === lane.id);
        return (
          <section
            key={lane.id}
            aria-label={`${lane.label}, ${lane.kind} lane`}
            className="min-w-0 border-t border-border pt-3"
          >
            <h3 className="mb-2 text-sm font-semibold break-words">
              {lane.label}
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                {lane.kind === "actor" ? "Actor" : "Signal"} · {lane.id}
              </span>
            </h3>

            {laneEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No events in this lane.
              </p>
            ) : (
              <ol className="space-y-3">
                {laneEvents.map((event) => {
                  const status = STATUS[event.kind];
                  const outside =
                    data.window !== undefined &&
                    (event.ts < data.window.from || event.ts > data.window.to);
                  const content = (
                    <>
                      <span className={`font-semibold ${status.className}`}>
                        <span aria-hidden="true">{status.symbol}</span>{" "}
                        {status.label}
                      </span>
                      <span className="font-mono">
                        {" "}· {event.ts} {data.unit}
                      </span>
                      {" "}— {event.label}
                      {outside ? (
                        <span className="font-semibold text-warning">
                          {" "}— Outside observation window
                        </span>
                      ) : null}
                    </>
                  );

                  return (
                    <li key={event.index} className="min-w-0">
                      <div
                        aria-hidden="true"
                        className="relative mx-2 mb-2 hidden h-3 border-b border-border md:block"
                      >
                        <span
                          className={`absolute top-0 -translate-x-1/2 text-xs ${status.className}`}
                          style={{ left: `${position(event.ts)}%` }}
                        >
                          {status.symbol}
                        </span>
                      </div>
                      {canInspect ? (
                        <button
                          type="button"
                          onClick={() => onInspect?.(lane.id)}
                          aria-label={`Inspect ${lane.label}: ${event.label}, ${event.ts} ${data.unit}`}
                          className="block w-full rounded border border-border bg-secondary/40 p-2 text-left text-sm break-words"
                        >
                          {content}
                          <span className="ml-2 text-xs underline">
                            Inspect lane
                          </span>
                        </button>
                      ) : (
                        <p className="text-sm break-words">{content}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events supplied.</p>
      ) : null}

      {unassigned.length > 0 ? (
        <div className="border border-warning p-3 text-sm">
          <p className="font-semibold text-warning">
            ▲ Invalid data: events reference an unknown lane.
          </p>
          <ul className="mt-2 space-y-1">
            {unassigned.map((event) => (
              <li key={event.index} className="break-words">
                {event.ts} {data.unit} · {event.lane} · {event.kind}
                {" "}— {event.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground break-words">
        <strong>Model limits:</strong> {data.note}
      </p>
    </figure>
  );
}
