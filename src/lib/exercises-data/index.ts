import type { Task } from "@/lib/exercises";
import { TASKS_TRAFFIC } from "./traffic";
import { TASKS_PERFORMANCE } from "./performance";
import { TASKS_RESILIENCE } from "./resilience";
import { TASKS_ASYNC } from "./async";
import { TASKS_DATABASE } from "./database";
import { TASKS_PROTOCOLS } from "./protocols";
import { TASKS_OBSERVABILITY } from "./observability";
import { TASKS_SRE } from "./sre";
import { TASKS_MISSIONS } from "./missions";

/** Registro único de tarefas de prática (PRD project2 D8/D16). */
export const TASKS: Task[] = [
  ...TASKS_TRAFFIC,
  ...TASKS_PERFORMANCE,
  ...TASKS_RESILIENCE,
  ...TASKS_ASYNC,
  ...TASKS_DATABASE,
  ...TASKS_PROTOCOLS,
  ...TASKS_OBSERVABILITY,
  ...TASKS_SRE,
  ...TASKS_MISSIONS,
];

export function getTask(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
