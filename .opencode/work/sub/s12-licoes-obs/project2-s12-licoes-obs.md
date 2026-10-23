# project2-s12 — Lições Observability (58, 60, 61, 63) e SRE (109, 111) + tarefas

## Missão
Produzir o CONTEÚDO completo de 6 lições v2 no contrato D1 — Monitoring (58),
Distributed Tracing (60), Metrics (61), SLOs (63), Production Incidents (109),
Postmortems (111) — e as 12 tarefas de prática correspondentes. Você serve o
objetivo central: a onda 2 conecta conhecimento de sinais e investigação para a
missão `metric-moved` (§12.5) — a métrica mudou e ainda não se sabe por quê; o
aluno formula hipóteses concorrentes, seleciona evidências e reconhece
incerteza, sem adivinhar o botão certo.

## Escopo
- Seu: conteúdo íntegro de `src/lib/lessons/observability.ts` (58, 60, 61, 63)
  e `src/lib/lessons/sre.ts` (109, 111); conteúdo íntegro de
  `src/lib/exercises-data/observability.ts` e `src/lib/exercises-data/sre.ts`.
- Fora do seu escopo: índices (agente principal), instrumentos (s9), missões
  (s13), outras categorias (s10/s11).

## Por quê
A missão 12.5 exige investigação honesta: distinguir sintoma de causa, SLI de
SLO, alerta de incidente, e reconhecer quando a evidência NÃO sustenta a
hipótese. Raso aqui destrói a missão inteira (planejamento §14: evidência acima
de atividade).

## Fronteiras
- Recebe: contrato D1, tabela de taskIds (PRD §20 D16), conceitos canônicos em
  `concepts.ts`.
- Entrega: relatório com (1) `observability.ts` íntegro; (2) `sre.ts` íntegro;
  (3) os 2 arquivos de tarefas íntegros; (4) pendências.

## Dono exclusivo de
Nada no disco — subagente read-only (PRD D15/D18). Escreve só no relatório.
