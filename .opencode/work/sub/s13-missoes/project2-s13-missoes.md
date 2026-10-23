# project2-s13 — Missões 12.3–12.5 (orders-pile-up, breaking-change, metric-moved)

## Missão
Produzir o CONTEÚDO completo das 3 missões novas do PRD (§12.3–12.5) como
objetos `Mission` prontos para o agente principal acrescentar ao array
`MISSIONS` em `src/lib/missions.ts`, além da tarefa de missão
`t-14-variant-2` (conteúdo para `src/lib/exercises-data/missions.ts`). Você
serve o objetivo central: conectar conhecimento em um cenário recorrente (Loja
Digital) onde o aluno decide, prevê e transfere — agora com fila, contratos e
investigação.

## Escopo
- Seu: conteúdo dos steps das 3 missões (arrays `Mission` íntegros); conteúdo
  da tarefa `t-14-variant-2` no formato Task do motor.
- Fora do seu escopo: `src/lib/missions.ts` (o agente principal integra),
  rotas, lições (s10/s11/s12), instrumentos (s9). Registre pendências.

## Por quê
A missão é o ciclo completo (§6.1) em escala; um spoiler do padrão-resposta ou
uma perturbação revelada antes da previsão destrói o valor pedagógico (regra
comum do §17).

## Fronteiras
- Recebe: contrato `Mission`/`MissionStep` em `src/lib/missions.ts` (slugs,
  prereqs e transferVariant fixados na D16 — NÃO mude), o motor de tarefas,
  as bancadas (`labs.ts` — 12.3 usa `pubsub`), a tabela de taskIds da D16.
- Entrega: relatório com (1) os 3 objetos Mission na íntegra; (2) o conteúdo
  de `t-14-variant-2`; (3) pendências de integração.

## Dono exclusivo de
Nada no disco — subagente read-only (PRD D15/D18). Escreve só no relatório.
