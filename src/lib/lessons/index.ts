import type { Lesson } from "./types";
import { LESSONS_TRAFFIC } from "./traffic";
import { LESSONS_PERFORMANCE } from "./performance";
import { LESSONS_RESILIENCE } from "./resilience";
import { LESSONS_ASYNC } from "./async";
import { LESSONS_DATABASE } from "./database";
import { LESSONS_PROTOCOLS } from "./protocols";
import { LESSONS_OBSERVABILITY } from "./observability";
import { LESSONS_SRE } from "./sre";
import { CONCEPTS } from "@/lib/concepts";

/** Todas as lições autorizadas, agregadas por categoria (PRD D1/D16). */
export const LESSONS: Lesson[] = [
  ...LESSONS_TRAFFIC,
  ...LESSONS_PERFORMANCE,
  ...LESSONS_RESILIENCE,
  ...LESSONS_ASYNC,
  ...LESSONS_DATABASE,
  ...LESSONS_PROTOCOLS,
  ...LESSONS_OBSERVABILITY,
  ...LESSONS_SRE,
];

const byId = new Map(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: number): Lesson | undefined {
  return byId.get(id);
}

export function hasLesson(id: number): boolean {
  return byId.has(id);
}

/** Valida que toda lição referencia um conceito canônico existente (1..111). */
export function lessonConceptExists(id: number): boolean {
  return CONCEPTS.some((c) => c.id === id);
}
