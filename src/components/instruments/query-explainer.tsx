import { useId } from "react";
import type { RepresentationSpec } from "@/lib/lessons/types";
import type { QueryExplainerData } from "./index";

export type { QueryExplainerData } from "./index";

interface Props {
  spec: RepresentationSpec;
  interactive?: boolean;
  onInspect?: (entity: string) => void;
}

export function QueryExplainerInstrument({
  spec,
  interactive = false,
  onInspect,
}: Props) {
  const titleId = useId();
  const data = spec.data as unknown as QueryExplainerData;
  const canInspect = interactive && typeof onInspect === "function";

  const renderPlan = (
    label: string,
    plan: QueryExplainerData["plan"],
  ) => (
    <section
      aria-label={label}
      className="min-w-0 border-t border-border pt-3"
    >
      <h3 className="mb-3 text-sm font-semibold break-words">{label}</h3>
      {plan.length === 0 ? (
        <p className="text-sm text-muted-foreground">No steps supplied.</p>
      ) : (
        <ol className="space-y-4">
          {plan.map((step, index) => (
            <li key={index} className="min-w-0 text-sm">
              <div className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full border border-accent-2 font-mono text-xs text-accent-2"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  {canInspect ? (
                    <button
                      type="button"
                      aria-label={`Inspect ${label}, step ${index + 1}: ${step.step}`}
                      onClick={() => onInspect?.(step.step)}
                      className="rounded text-left font-semibold break-words underline underline-offset-4"
                    >
                      {step.step}
                    </button>
                  ) : (
                    <p className="font-semibold break-words">{step.step}</p>
                  )}
                  <p className="leading-relaxed text-muted-foreground break-words">
                    {step.detail}
                  </p>
                  {step.cost !== undefined ? (
                    <p className="font-mono text-xs break-words">
                      Cost: {step.cost}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );

  return (
    <figure
      aria-labelledby={titleId}
      className="min-w-0 space-y-4 text-foreground"
    >
      <figcaption id={titleId} className="text-sm font-semibold break-words">
        Query / contract explainer — {spec.caption}
      </figcaption>

      <section aria-label="Statement" className="min-w-0">
        <h3 className="mb-2 text-sm font-semibold">Statement</h3>
        <pre className="max-w-full rounded border border-border bg-background/60 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          <code>{data.statement}</code>
        </pre>
      </section>

      <p className="text-xs text-muted-foreground">
        Read steps from top to bottom. Numbering is the supplied explanatory
        order, not evidence that a database executes all work sequentially.
        Costs retain the units and assumptions supplied by the lesson.
      </p>

      {renderPlan("Main plan", data.plan)}

      {data.versions && data.versions.length > 0 ? (
        <section aria-label="Version comparison" className="min-w-0 space-y-3">
          <h3 className="text-sm font-semibold">Compare versions</h3>
          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
            {data.versions.map((version, index) => (
              <div key={index} className="min-w-0">
                {renderPlan(version.label, version.plan)}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground break-words">
        <strong>Model limits:</strong> {data.note}
      </p>
    </figure>
  );
}
