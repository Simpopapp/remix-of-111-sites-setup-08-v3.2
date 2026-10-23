# project2-s10 — Lições Async (15, 16, 17, 20) + Backpressure (44) e tarefas

## Missão
Produzir o CONTEÚDO completo de 5 lições v2 no contrato D1 — Message Queues
(15), Pub/Sub (16), Event-Driven Architecture (17), Dead Letter Queues (20),
Backpressure (44) — e as 9 tarefas de prática correspondentes. Você serve o
objetivo central: a onda 2 conecta conhecimento assíncrono para a missão
`orders-pile-up` (§12.3), onde o aluno diagnostica fila acumulando, separa
competing consumers de fan-out e decide recuperação com DLQ.

## Escopo
- Seu: conteúdo íntegro de `src/lib/lessons/async.ts` (15,16,17,20), o APPEND
  de uma lição (44) para `src/lib/lessons/performance.ts`, conteúdo íntegro de
  `src/lib/exercises-data/async.ts`.
- Fora do seu escopo: `lessons/index.ts` e `exercises-data/index.ts` (agente
  principal), instrumentos (s9), missões (s13), outras categorias (s11/s12).

## Por quê
É a onda que dá suporte editorial à missão de fila acumulada. Precisão acima de
volume: a lição 16 precisa distinguir distribuição de trabalho de distribuição
de eventos (lacuna §3.1.2 já corrigida no S5 — a lição deve coerência com esse
modelo); a lição 20 não pode rotular falha aleatória de worker como poison
message (S5, spec 4.2).

## Fronteiras
- Recebe: contrato D1 (`lessons/types.ts`), tabela de taskIds (PRD §20 D16),
  conceitos canônicos em `concepts.ts`, modelo do S5 em `simulators.ts`.
- Entrega: relatório com (1) `async.ts` íntegro; (2) lição 44 pronta para
  append; (3) `exercises-data/async.ts` íntegro; (4) pendências.

## Dono exclusivo de
Nada no disco — subagente read-only (PRD D15/D18). Escreve só no relatório.
