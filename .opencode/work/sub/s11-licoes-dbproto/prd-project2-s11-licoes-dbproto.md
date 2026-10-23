# prd-project2-s11 — o COMO das lições Database/Protocols (onda 2a)

## Decisões que você segue
- D1 (PRD §3): contrato `Lesson` integral; `analogyLimits` e counterexample não
  vazios; `practiceIds` só da tabela D16; arquivo = categoria (81,82 →
  database.ts; 102,103 → protocols.ts).
- D8: motor `exercises.ts`; feedback diagnóstico com causes/nextStep;
  proibições §6.3 (resposta não no nome do botão, sem caricatura, sem
  vocabular).
- Instrumentos: 81 → `query-explainer` (planos/migração passo a passo com
  custo); 82, 102, 103 → `table` (matriz de compatibilidade/versões — shape
  D17, tone ok/warn/down por texto+forma).

## Exemplares obrigatórios (leia antes de redigir)
- `src/lib/lessons/performance.ts` (lição 27 — tom e profundidade de Database
  próxima) e `src/lib/lessons/traffic.ts` (formato de representation.data)
- `src/lib/exercises-data/performance.ts` (formato Task/Rubric)
- `src/lib/exercises.ts` (assinaturas exatas)
- Entradas de 81,82,102,103 em `src/lib/concepts.ts`

## Requisitos editoriais
- Siga o idioma e o tom dos exemplares (consistência entre lições é critério).
- Precisão: migração (81) separa expand/contract de migrate-and-hope; schema
  versioning (82) — compatibilidade retroativa vs invertida, com exemplo
  concreto (coluna removida quebra cliente antigo; coluna nova com default não
  quebra); API versioning (102) — quando versionar, onde versionar (URL/header/
  payload) e o custo de cada escolha; semver (103) — o que MAJOR/MINOR/PATCH
  prometem a quem consome e por que semver sozinho não protege cliente em
  produção.
- Contraste com "quando NÃO usar" real (ex.: quando versionar é overkill;
  quando expand/contract é peso desnecessário).
- Instrumento: `table` com matriz de compatibilidade plausível (linhas =
  combinações cliente×servidor ou versão×operação; tone por quebra real);
  `query-explainer` da 81 com statement + plan + note de limites
  ("modelo didático").
- `textEquivalent` obrigatório e suficiente (mesmo raciocínio sem o gráfico).

## Tarefas (formato Task do motor)
- 81: t-81-order (ordenar passos de uma migração segura; identificar onde a
  suposição quebra), t-81-find-flaw (plano de migração com hipótese não
  sustentada)
- 82: t-82-predict (prever o que quebra ao remover/trocar campo), t-82-variant
  (transferência com domínio trocado)
- 102: t-102-predict (prever impacto em clientes antigos), t-102-compare
  (estratégia de release com alternativas válidas e trade-off)
- 103: t-103-find-flaw (bump de versão que não honra o semver), t-103-compare
  (versionar vs não versionar)
- ids EXATOS da tabela D16; conceptId correto; helpLevels 3 níveis.

## Aceite do relatório
1. Os 4 entregáveis na íntegra (2 lições × 2 arquivos + 2 arquivos de tarefas).
2. Checklist por lição (D1 completo, instrumento correto, practiceIds = D16).
3. Checklist por tarefa (rubrica verificável, feedback com causa, sem spoiler
   da missão breaking-change — a lição não entrega a resposta da missão).

## Registro de decisões do subagente
- (vazio — preencha numerado no relatório)

## Proibições
- NÃO edite arquivos (read-only). NÃO use `oc`. NÃO pergunte ao usuário.
- NÃO invente ids fora da tabela D16. NÃO toque em concepts.ts, index.ts,
  relations.ts.
