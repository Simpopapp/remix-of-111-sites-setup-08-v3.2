# prd-project2-s13 — o COMO das missões 12.3–12.5 (onda 2a)

## Decisões que você segue
- D10 (PRD §3/§17): `MissionStep` kinds briefing|predict|experiment|decide|
  transfer|dossier; a missão NUNCA informa qual padrão é a resposta;
  perturbação só revelada APÓS a previsão; dossiê salvo em
  `learning.missions[slug]` (mencione a revisão automática de ~72h no corpo do
  dossier, como as missões 1 e 2 fazem).
- D16 (PRD §20): slugs `orders-pile-up` (12.3, prereqs [15,16,20,44,12]),
  `breaking-change` (12.4, prereqs [102,103,81,82]), `metric-moved` (12.5,
  prereqs [58,60,61,63,109,111]); tarefa de transfer por missão: t-14-variant-2
  / t-82-variant / t-111-variant.
- Regras do §17.1/§17.2 (padrão das missões 1 e 2): 6 steps, body ≤ 120
  palavras/step, `needsEvidence` é critério textual (nunca "screenshot"),
  taskId/labId só da tabela D16/labs válidos.

## Exemplares obrigatórios (leia antes de redigir)
- `src/lib/missions.ts` (as 2 missões existentes — copie o TOM e o formato dos
  steps; títulos em inglês como os existentes; body em inglês)
- `src/lib/exercises-data/missions.ts` (t-14-variant e t-27-variant — formato
  de Task de transfer)
- `src/lib/exercises.ts` (assinatura do motor), `src/lib/labs.ts` (ids válidos)

## Roteiro das 3 missões (seguir de perto)
### 1. `orders-pile-up` — §12.3 "Os pedidos não param de acumular"
1. briefing — Loja Digital: pedidos entram mais rápido do que saem; fila
   cresce. O que o cliente vê? Primeira hipótese (coletada, não rotulada).
2. predict — t-15-predict: prever o acúmulo antes de revelar.
3. experiment — bancada `pubsub` (labId "pubsub"): comparar modos, aplicar
   causas diferentes (transitória / mensagem inválida / consumidor lento) e
   observar o que muda na fila e na DLQ. Evidência: registro do que cada causa
   provocou.
4. decide — t-16-compare: distinguir notificar assinantes de distribuir
   trabalho + plano de recuperação (alternativas válidas com trade-off).
5. transfer — t-14-variant-2: processamento de arquivos/notificações com
   duplicação que exige raciocínio de idempotência; domínio trocado.
6. dossier — explicação da causa sustentada por evidências + plano de
   recuperação + distinção notificar×distribuir.

### 2. `breaking-change` — §12.4 "Uma mudança funcionou sozinha, mas quebrou clientes antigos"
1. briefing — Loja Digital: release novo funcionou nos testes; clientes antigos
   do app quebram. Primeira hipótese.
2. predict — t-102-predict: prever o impacto da mudança em clientes antigos.
3. experiment — SEM bancada (sem labId): o corpo apresenta duas versões de
   contrato (payload/endpoint) e dois clientes; o aluno produz a matriz de
   compatibilidade (evidência textual: quais combinações quebram e por quê).
4. decide — t-102-compare: estratégia de release/compatibilidade com
   alternativas válidas e condição de rollback.
5. transfer — t-82-variant: mesma decisão aplicada a schema de banco (domínio
   trocado).
6. dossier — matriz de compatibilidade + ordem argumentada da mudança +
   condição de rollback.

### 3. `metric-moved` — §12.5 "A métrica mudou; ainda não sabemos por quê"
1. briefing — Loja Digital: a taxa de checkout caiu ontem; ninguém mexeu no
   código (aparentemente). Primeira hipótese concorrente.
2. predict — t-61-predict: prever o que a janela/agregação pode esconder.
3. experiment — SEM bancada: o corpo apresenta 3 evidências (gráfico da
   métrica, log de erros, trace de um pedido); o aluno seleciona qual evidência
   sustenta qual hipótese e o que cada uma NÃO prova. Evidência: hipóteses
   concorrentes mapeadas às evidências.
4. decide — t-58-choose-info: qual informação pedir em seguida antes de agir.
5. transfer — t-111-variant: pós-incidente em outro domínio (ex.: pipeline de
   conteúdo, não checkout).
6. dossier — dossiê curto: fato → hipótese → evidência escolhida → ação →
   verificação → aprendizado; reconhecer a incerteza que permanece.

## Tarefa `t-14-variant-2` (formato Task; conceptId 14)
- prompt: enunciado de processamento de arquivos com repetição e duplicação
  (NUNCA a palavra pagamento); variant explícita; rubrica com o invariante
  "cada arquivo processado uma única vez" verificável; feedback com causa
  provável + próxima ação; expected no nível 3 comentado.

## Aceite do relatório
1. 3 objetos Mission na íntegra + conteúdo de t-14-variant-2.
2. Checklist por missão: 6 steps, kinds corretos, body ≤ 120 palavras, sem
   spoiler (nenhum body nomeia idempotência/backpressure/versionamento como
   resposta ANTES do step decide), taskIds/labId válidos.
3. Nenhum step informa o padrão-resposta (asserção manual listada no relatório).

## Registro de decisões do subagente
- (vazio — preencha numerado no relatório)

## Proibições
- NÃO edite arquivos (read-only). NÃO mude slugs/títulos/prereqs fixados na
  D16. NÃO use `oc`. NÃO pergunte ao usuário.
