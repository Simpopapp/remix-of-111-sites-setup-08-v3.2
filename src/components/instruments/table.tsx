import { useId } from "react";
import type { RepresentationSpec } from "@/lib/lessons/types";
import type { TableData } from "./index";

export type { TableData } from "./index";

interface Props {
  spec: RepresentationSpec;
  interactive?: boolean;
  onInspect?: (entity: string) => void;
}

const TONE = {
  ok: {
    symbol: "✓",
    label: "OK",
    className: "text-success",
  },
  warn: {
    symbol: "▲",
    label: "Warning",
    className: "text-warning",
  },
  down: {
    symbol: "✕",
    label: "Down",
    className: "text-destructive",
  },
} as const;

export function TableInstrument({
  spec,
  interactive = false,
  onInspect,
}: Props) {
  const captionId = useId();
  const hintId = useId();
  const data = spec.data as unknown as TableData;
  const canInspect = interactive && typeof onInspect === "function";

  return (
    <div className="min-w-0 space-y-3 text-foreground">
      <p id={hintId} className="text-xs text-muted-foreground">
        Comparison table. Scroll horizontally within this region if needed.
        {" "}★ identifies an emphasized column.
        {" "}✓ OK · ▲ Warning · ✕ Down.
        Status applies to the row and is repeated in each cell.
      </p>

      <div
        role="region"
        aria-labelledby={captionId}
        aria-describedby={hintId}
        tabIndex={0}
        className="max-w-full overflow-x-auto rounded border border-border"
      >
        <table className="w-full border-collapse text-left text-sm">
          <caption
            id={captionId}
            className="p-3 text-left font-semibold break-words"
          >
            Comparison table — {spec.caption}
          </caption>
          <thead className="bg-secondary/60">
            <tr>
              {data.columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`border-b border-border px-3 py-2 align-top break-words ${
                    column.emphasis
                      ? "border-b-2 border-accent-2 font-bold text-foreground"
                      : "font-semibold text-muted-foreground"
                  }`}
                >
                  {column.emphasis ? (
                    <>
                      <span aria-hidden="true">★ </span>
                      <span className="sr-only">Emphasized column: </span>
                    </>
                  ) : null}
                  {canInspect ? (
                    <button
                      type="button"
                      aria-label={`Inspect column ${column.label}`}
                      onClick={() => onInspect?.(column.key)}
                      className="rounded text-left underline underline-offset-4"
                    >
                      {column.label}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.rows.map((row, index) => {
              const tone = row.tone ? TONE[row.tone] : undefined;
              return (
                <tr key={index} className="border-b border-border last:border-b-0">
                  {data.columns.map((column) => {
                    const value = row.cells[column.key];
                    return (
                      <td
                        key={column.key}
                        className={`px-3 py-3 align-top break-words ${
                          column.emphasis
                            ? "bg-accent-2/10 font-semibold"
                            : ""
                        }`}
                      >
                        {tone ? (
                          <span
                            className={`mb-1 block text-xs font-semibold ${tone.className}`}
                          >
                            <span aria-hidden="true">{tone.symbol}</span>{" "}
                            {tone.label}
                          </span>
                        ) : null}
                        <span>
                          {value === undefined ? "Not supplied" : value}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.columns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No columns supplied.</p>
      ) : null}
      {data.rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No rows supplied.</p>
      ) : null}

      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground break-words">
        <strong>Model limits:</strong> {data.note}
      </p>
    </div>
  );
}
