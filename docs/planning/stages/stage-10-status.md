# Stage 10 — Onda 2 (remix 2): expansão editorial, instrumentos e missões 12.3–12.5

Data: 2026-10-23 · Fases F10–F13 do `roadmap-proj2` · PRD §20 (D16–D18)

## Entregado

- **12 lições v2 novas** (contrato D1, com analogyLimits/counterexample e instrumento central): Async 15, 16, 17, 20 (`lessons/async.ts`); Performance 44 — Backpressure (append em `lessons/performance.ts`); Database 81, 82 (`lessons/database.ts`); Protocols 102, 103 (`lessons/protocols.ts`); Observability 58, 60, 61, 63 (`lessons/observability.ts`); SRE 109, 111 (`lessons/sre.ts`).
- **3 instrumentos novos** (D17): `event-track`, `table`, `query-explainer` em `src/components/instruments/`, com validador de shapes em `src/test/instruments-shapes.test.ts`. A lição 27 foi migrada ao shape D17 (o legado `rows/queries/assumptions` foi denunciado pelo validador do s9 e migrado sem perder números/limites).
- **17 tarefas de prática novas** (motor D8): 16 da tabela D16 + `t-16-compare` (divergência resolvida — relatório s13) + `t-14-variant-2` (exceção de id registrada).
- **3 missões novas**: `orders-pile-up` (§12.3, bancada pubsub), `breaking-change` (§12.4, matriz de compatibilidade como evidência textual), `metric-moved` (§12.5, hipóteses concorrentes sobre 3 sinais).
- **Renderização**: `representation.tsx` despacha os 3 kinds aos componentes novos; aviso "sem renderizador" removido do `lesson-view`.

## Gates (números reais)

- `bunx tsgo --noEmit` limpo.
- `bunx vitest run`: **117/117** (101 + 16), incluindo contrato de lições/tarefas genérico, spoilers, transferências com domínio trocado, dossiês com "72 hours".
- E2E estendido (`e2e/e2e_wave2.py`): **14/14 checks** — aula 15 renderiza event-track com limites do modelo; missão `orders-pile-up` completa o ciclo (briefing→predict→experiment→decide→transfer→dossier), sem spoiler de pagamento, dossiê persiste após reload, índice mostra "dossier saved", console limpo.
- Verificação ao vivo: 5 missões no índice; /concepts/{15,27,44,81,102,109,111} renderizam instrumento (7/7).

## Decisões registradas (PRD §20)

- D16 (escopo/tabela de ids), D17 (shapes), D18 (execução read-only do enxame + leitura dos pilares do disco) + divergência `t-16-compare` resolvida + exceção de id `t-14-variant-2`.

## Enxame

- Onda 2a: s9-instrumentos, s10-licoes-async, s11-licoes-dbproto, s12-licoes-obs, s13-missoes — todos read-only, entregas na íntegra nos relatórios; integração e gates do agente principal. Pilares em `.opencode/work/sub/{s9..s13}/`.

## Bloqueios externos

- Runtime OpenCode indisponível (proxy `/oc` → 502, binário removido em wipe anterior). Bloqueio documentado também na F9; a avaliação do monitor ficará pendente até a recuperação do ambiente (skill `15-project-monitor` tem o procedimento de recuperação).

## Estado final

Remix finalizado (+4 fases: F10–F13). Próximo remix: lições das categorias restantes (DevOps, Streaming, Distributed, Scaling, Reliability, Security, Networking), percursos exemplares §8.3, personalização §13, revisão técnica independente das provenances `reviewed: false`.
