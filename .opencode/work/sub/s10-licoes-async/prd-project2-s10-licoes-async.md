# prd-project2-s10 — o COMO das lições Async + 44 (onda 2a)

## Decisões que você segue
- D1 (PRD §3): contrato `Lesson` integral; `analogyLimits` e
  `misconceptions[].counterexample` NÃO vazios; `practiceIds` só com ids da
  tabela D16; arquivo = categoria do conceito (15,16,17,20 → async.ts;
  44 → performance.ts, append).
- D8 (PRD §3): motor `src/lib/exercises.ts` — 6 tipos; rubrica com critérios
  verificáveis; feedback diagnóstico com `causes`/`nextStep` (nunca "errado,
  tente novamente"); proibições §6.3: resposta não está no nome do botão, sem
  alternativa caricatural, sem pergunta vocabular.
- Instrumento das lições Async (e 44): `event-track` (shape D17) — trilhas por
  lane, eventos com kind info/success/warn/fail, `note` de limites do modelo.

## Exemplares obrigatórios (leia antes de redigir)
- `src/lib/lessons/traffic.ts` e `src/lib/lessons/resilience.ts` (lições 11–13
  mostram o tom, a profundidade e o formato de `representation.data` para
  request-flow/state-machine)
- `src/lib/exercises-data/traffic.ts` (formato de Task/Rubric/feedback)
- `src/lib/exercises.ts` (motor — assinaturas exatas)
- `src/lib/simulators.ts` (modelo S5 — a lição 16/20 precisa coerência)
- Entradas de 15,16,17,20,44 em `src/lib/concepts.ts` (nome/eli/risk/fix)

## Requisitos editoriais
- Português do Brasil no corpo das lições (as lições da onda 1 estão em pt? —
  confirme no exemplar e SIGA o idioma do exemplar; inconsistência de idioma
  entre lições é falha).
- Cada lição: objetivo observável, pré-reqs canônicos (use `relations.ts` seed
  D4 quando couber — NÃO edite relations.ts), cenário com baseline, exemplo
  trabalhado com raciocínio intermediário, contraste com "quando NÃO usar",
  equívocos com contraexemplo discriminante, transferência com domínio trocado,
  provenance honesto (`reviewed: true` só se o conteúdo for tecnicamente
  correto; notes explicam a revisão).
- Precisão (planejamento §3.1.2): Pub/Sub (16) distingue competing consumers de
  fan-out; DLQ (20) — poison message é mensagem que falha após esgotar
  tentativas, NÃO falha aleatória de worker; Backpressure (44) — sinal de
  acumulação e o que fazer antes de escalar capacidade.
- Instrumento: cada lição traz `representation` com kind `event-track`, dados
  coerentes com o cenário (lanes/events plausíveis, ts coerente com `unit`) e
  `textEquivalent` que permite o mesmo raciocínio sem o gráfico.

## Tarefas (formato Task do motor; feedback causes/nextStep reais)
- 15: t-15-predict (prever acúmulo de fila), t-15-compare (fila vs chamada
  síncrona; alternativas válidas com trade-off)
- 16: t-16-predict (entregas por assinante em fan-out), t-16-order (ordenar
  eventos de entrega/ack; identificar onde a suposição quebra)
- 17: t-17-compare (evento vs chamada direta), t-17-variant (transferência com
  nomes trocados)
- 20: t-20-find-flaw (hipótese não sustentada — ex.: "falha aleatória = poison"),
  t-20-compare (retry vs DLQ vs descartar; alternativas válidas)
- 44: t-44-compare (backpressure vs escalar capacidade)
- ids EXATOS da tabela D16; `conceptId` correto por tarefa; helpLevels com
  3 níveis (nível 3 revela solução comentada).

## Aceite do relatório
1. `async.ts` íntegro (4 lições) + lição 44 para append + `exercises-data/async.ts`.
2. Checklist por lição: campos D1 completos, analogyLimits preenchido,
   practiceIds = tabela D16, instrumento event-track com dados coerentes.
3. Checklist por tarefa: rubrica verificável, feedback com causa provável,
   nenhum spoiler de padrão-resposta de missão (a lição não entrega a resposta
   da missão orders-pile-up).

## Registro de decisões do subagente
- (vazio — preencha numerado no relatório)

## Proibições
- NÃO edite arquivos (read-only). NÃO use `oc`. NÃO pergunte ao usuário.
- NÃO invente ids de tarefa fora da tabela D16. NÃO toque em relations.ts,
  concepts.ts, index.ts.
