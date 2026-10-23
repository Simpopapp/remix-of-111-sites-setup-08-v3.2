# Registro do Monitor — remix 3, fase F2 (Biblioteca)

**Data:** 2026-10-23
**Verdict parcial:** F2 concluída com gates verdes (avaliação do monitor pendente — runtime OpenCode ausente no ambiente, `command -v opencode` vazio; registro persistido em disco conforme recuperação documentada na skill 15).

## O que foi feito

Fase F2 do `roadmap-proj3` (PRD project3 §3/F2, §8.2, §14.3) executada integralmente:

- Busca unificada do acervo em `src/lib/library-search.ts` (módulo puro): 111 conceitos + 6 laboratórios + 5 missões, cada resultado com motivo da relevância explícito (`reason`/`reasonSource`) e tipo de experiência/coverage honesto (Aula estruturada / Aula não revisada / Referência rápida / Laboratório / Missão investigativa).
- Correspondência fraca (só tema/número) rotulada "Correspondência fraca" e ordenada por último — nunca apresentada como diagnóstico.
- Novos cards (`src/components/library/result-card.tsx`): problema em 1ª linha + ação praticada + representação real (instrumento da aula/bancada); a analogia sai do resumo principal.
- Categorias com apresentação editorial própria (pergunta + blurb por tema, `CATEGORY_QUESTIONS`); filtros por tema/tipo/profundidade; visão editorial vs. compacta; vazio orientado (`emptyAdvice` com dica de sintoma e temas).
- `?q=/?cat=/?type=/?depth=/?view=` sincronizados na URL; filtros e posição preservados ao abrir item e voltar (verificado em E2E).
- `src/components/library/catalog.tsx` reescrito para o novo contrato; `src/routes/library.tsx` atualizado (head incluído).

## Gates F2 (números reais)

- `bunx tsgo --noEmit` — limpo.
- `bunx vitest run` — 141/141 em 14 arquivos (+14 novos em `src/test/library-search.test.ts`: motivo da relevância, fraca rotulada, filtros, cobertura honesta, vazio orientado).
- `bun run build` — OK (build-errors.log: "build OK").
- E2E `e2e/e2e_f2_library.py` — 7 passos verdes, 0 pageerrors (sintoma com motivo, categoria editorial, filtros preservados ao voltar, vazio orientado, visão compacta, filtro de tipo sem vazamento).
- Nenhum teste contratado enfraquecido (suite anterior 127/127 continua inclusa).

## Estado do roadmap

F0–F2 `[x]`. Próxima fase: F3 — Aula (modos guided/reference/practice, pré-requisitos com motivo, render de timeline, síntese derivada).
