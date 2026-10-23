# prd-project2-s12 — o COMO das lições Observability/SRE (onda 2a)

## Decisões que você segue
- D1 (PRD §3): contrato `Lesson` integral; analogyLimits e counterexample não
  vazios; practiceIds só da tabela D16; arquivo = categoria (58,60,61,63 →
  observability.ts; 109,111 → sre.ts).
- D8: motor `exercises.ts`; feedback diagnóstico com causes/nextStep;
  proibições §6.3.
- Instrumentos: 58, 60, 61, 109 → `event-track` (sinais/linha do tempo — shape
  D17); 63, 111 → `table` (SLO/orçamento de erro; dossiê de postmortem).

## Exemplares obrigatórios (leia antes de redigir)
- `src/lib/lessons/resilience.ts` (tom e profundidade; máquina de estados) e
  `src/lib/lessons/traffic.ts` (formato de representation.data)
- `src/lib/exercises-data/resilience.ts` (formato Task/Rubric)
- `src/lib/exercises.ts` (assinaturas exatas)
- Entradas de 58,60,61,63,109,111 em `src/lib/concepts.ts`

## Requisitos editoriais
- Siga o idioma e o tom dos exemplares.
- Precisão: monitoramento (58) distingue observabilidade de coleta de métricas;
  tracing (60) — trace_id/spans, o que um trace prova e o que NÃO prova;
  métricas (61) — contra, taxa e histograma, janela e unidades (coerência com a
  lição 91/93 da onda 1 sobre percentis); SLOs (63) — SLI → SLO → orçamento de
  erro, por que 100% não é objetivo; incidentes (109) — sinais → hipótese →
  ação → verificação, sem caça a culpados; postmortems (111) — fato/hipótese/
  ação/verificação/aprendizado, blameless sem virar ritual vazio.
- Contraste com "quando NÃO usar" real (ex.: quando mais dashboards não ajuda;
  quando postmortem não muda nada).
- Instrumento: event-track com lanes de atores/sinais coerentes com o cenário;
  table com linhas que se leem sem cor (texto+forma).
- `textEquivalent` obrigatório e suficiente.

## Tarefas (formato Task do motor)
- 58: t-58-predict (o que um alerta pode/may not dizer), t-58-choose-info (qual
  evidência pedir primeiro)
- 60: t-60-compare (log vs trace vs métrica para a mesma dúvida), t-60-find-flaw
  (conclusão não sustentada por um trace)
- 61: t-61-predict (efeito de janela/agregação na leitura), t-61-compare
  (métrica certa para a pergunta)
- 63: t-63-compare (escolha de SLO com trade-off), t-63-find-flaw (SLO mal
  definido — SLI que não mede a experiência)
- 109: t-109-order (sequência de investigação; onde a suposição quebra),
  t-109-compare (ação de mitigação vs ação de causa-raiz)
- 111: t-111-variant (transferência do raciocínio de postmortem para outro
  domínio), t-111-compare (blameless vs atribuição de culpa; trade-offs)
- ids EXATOS da tabela D16; conceptId correto; helpLevels 3 níveis.

## Aceite do relatório
1. Os 4 entregáveis na íntegra.
2. Checklist por lição (D1 completo, instrumento correto, practiceIds = D16).
3. Checklist por tarefa (rubrica verificável, feedback com causa, sem spoiler
   da missão metric-moved — a lição não entrega a resposta da missão).

## Registro de decisões do subagente
- (vazio — preencha numerado no relatório)

## Proibições
- NÃO edite arquivos (read-only). NÃO use `oc`. NÃO pergunte ao usuário.
- NÃO invente ids fora da tabela D16. NÃO toque em concepts.ts, index.ts,
  relations.ts.
