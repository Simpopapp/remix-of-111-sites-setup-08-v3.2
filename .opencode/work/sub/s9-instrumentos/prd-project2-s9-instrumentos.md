# prd-project2-s9 — o COMO dos instrumentos (onda 2a)

## Decisões que você segue
- D6 (PRD §15): contrato comum do instrumento — props
  `{ spec: RepresentationSpec; interactive?: boolean; onInspect?: (entity: string) => void }`;
  estados visuais derivam de tokens, nunca cor hardcoded; eixos/legendas/entidades
  nomeadas/direção das conexões.
- D17 (PRD §20): shapes `EventTrackData`, `TableData`, `QueryExplainerData` —
  segue EXATAMENTE os campos; o tipo do componente importa o shape dele
  (`import type { EventTrackData } from ...` local ao arquivo) e o exporta
  (`export type { EventTrackData }`).
- D13 (PRD): nada depende de hover; estados diferenciados por texto+forma além de
  cor; `prefers-reduced-motion` preserva o raciocínio; zoom/texto maior não
  truncam significado. O `textEquivalent` é da lição — o componente NÃO duplica.

## Exemplares obrigatórios (leia antes de redigir)
- `src/components/instruments/latency-histogram.tsx` (eixos, marcadores, note)
- `src/components/instruments/request-flow.tsx` (nodes/edges/janela)
- `src/components/instruments/index.ts` (barrel de tipos)
- `src/styles.css` (tokens disponíveis — use `var(--...)`/classes semânticas)

## Requisitos por componente
1. **event-track** — trilhas por lane (ator/sinal), eventos posicionados no
   tempo com `kind` info/success/warn/fail diferenciado por texto+forma (não só
   cor); janela `window` quando presente; `note` visível ("limites do modelo").
   Responsivo: rolagem horizontal só se inevitável, com fallback empilhado.
2. **table** — colunas com `emphasis`, células com `tone` ok/warn/down
   renderizadas por texto+forma+token, nunca só cor; cabeçalho de tabela real
   (`<table>` com th/td); `note` visível. Deve ler bem no mobile (overflow-x
   apenas aqui, com rótulo).
3. **query-explainer** — `statement` em bloco monoespaçado; `plan` como lista
   de passos com `cost` quando presente; `versions` compara planos lado a lado
   (ou empilhados no mobile) com rótulos claros; `note` visível.
4. Todos: sem estado interno além de UI local (seleção/inspeção); nenhuma
   dependência nova; nenhuma animação essencial à leitura.

## Teste de shapes (conteúdo de `src/test/instruments-shapes.test.ts`)
- Valida (com asserts manuais, sem lib nova) que TODA lição de `LESSONS` cuja
  `representation.kind` é event-track/table/query-explainer passa um validador
  do shape correspondente (campos obrigatórios, tipos, `note` não vazio).
- Como as lições novas ainda não estarão integradas quando você escreve, o
  teste deve iterar `LESSONS` e passar vazio hoje, sem falhar — o valor é
  cobrir a onda após a integração. Liste isso no relatório.

## Aceite do relatório
1. 3 arquivos TSX na íntegra + exports do barrel + conteúdo do teste.
2. Cada componente: nome acessível, sem cor hardcoded (rg `#[0-9a-f]{3,8}` zero
   no seu conteúdo), `aria-label`/`role` onde couber.
3. Pendências de integração (index.ts, import nos consumers).

## Registro de decisões do subagente
- (vazio — preencha numerado no relatório)

## Proibições
- NÃO edite arquivos (read-only). NÃO use `oc`. NÃO pergunte ao usuário.
- NÃO dependa de hover; NÃO invente campos fora do shape D17.
