# project2-s11 — Lições Database (81, 82) e Protocols (102, 103) + tarefas

## Missão
Produzir o CONTEÚDO completo de 4 lições v2 no contrato D1 — Database
Migrations (81), Schema Versioning (82), API Versioning (102), Semantic
Versioning (103) — e as 8 tarefas de prática correspondentes. Você serve o
objetivo central: a onda 2 conecta conhecimento de contratos e compatibilidade
para a missão `breaking-change` (§12.4) — uma mudança funcionou sozinha mas
quebrou clientes antigos; a aprendizagem está na compatibilidade e na ordem
argumentada das decisões, sem pipeline real.

## Escopo
- Seu: conteúdo íntegro de `src/lib/lessons/database.ts` (81, 82) e
  `src/lib/lessons/protocols.ts` (102, 103); conteúdo íntegro de
  `src/lib/exercises-data/database.ts` e `src/lib/exercises-data/protocols.ts`.
- Fora do seu escopo: índices (agente principal), instrumentos (s9), missões
  (s13), outras categorias (s10/s12).

## Por quê
A missão 12.4 exige matriz de compatibilidade e ordem de mudança argumentada.
A lição 82 e a 102 precisam separar versão de schema de versão de API e
compatibilidade retroativa/invertida — o erro clássico é trocar "nova versão"
por "mudança segura".

## Fronteiras
- Recebe: contrato D1, tabela de taskIds (PRD §20 D16), conceitos canônicos em
  `concepts.ts`.
- Entrega: relatório com (1) `database.ts` íntegro; (2) `protocols.ts` íntegro;
  (3) os 2 arquivos de tarefas íntegros; (4) pendências.

## Dono exclusivo de
Nada no disco — subagente read-only (PRD D15/D18). Escreve só no relatório.
