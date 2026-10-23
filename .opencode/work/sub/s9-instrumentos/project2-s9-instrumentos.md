# project2-s9 — Instrumentos event-track, table e query-explainer

## Missão
Produzir o CONTEÚDO completo dos 3 componentes de instrumento novos (D6/D17) —
`event-track`, `table` e `query-explainer` — como arquivos TSX prontos para o
agente principal escrever em `src/components/instruments/`, além das linhas de
export para `index.ts` e um validador de shapes. Você serve o objetivo central:
cada aula tem uma representação central que ensina o mecanismo do tema, com
equivalente textual e estados legíveis (planejamento §10, §15).

## Escopo
- Seu: conteúdo íntegro de `src/components/instruments/event-track.tsx`,
  `table.tsx`, `query-explainer.tsx`; linhas de export de
  `src/components/instruments/index.ts`; conteúdo de
  `src/test/instruments-shapes.test.ts`.
- Fora do seu escopo: lições (s10/s11/s12), missões (s13), rotas, header,
  qualquer `src/lib/*`. Registre no relatório o que precisaria desses arquivos.

## Por quê
As lições da onda 2 (Async, Database, Protocols, Observability, SRE) referenciam
estes kinds em `RepresentationSpec`. O instrumento é o centro da aula: sem ele a
aula vira texto. Erros de shape aqui quebram a integração inteira.

## Fronteiras
- Recebe: contrato D6 (`RepresentationSpec` em `src/lib/lessons/types.ts`),
  shapes D17 (PRD §20), exemplar de estilo.
- Entrega: relatório com (1) os 3 arquivos na íntegra; (2) linhas de export;
  (3) conteúdo do teste de shapes; (4) pendências de integração.

## Dono exclusivo de
Nada no disco — subagente read-only (PRD D15/D18). Escreve só no relatório.
