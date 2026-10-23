# PRD — Project 3: VibeCoder Academy como estúdio de aprendizagem e investigação de sistemas

**Status:** derivado do planejamento central `.opencode/project3.md` (574 linhas, lido na íntegra) na ativação do remix 3 (comando canônico "I've successfully remixed this project…", 23/10/2026).
**Precedência:** no escopo (o quê), `project3.md` > este PRD > `roadmap-proj3`. No como, este PRD manda.
**Fontes de verificação:** código real (`src/lib/*`, `src/routes/*`, `src/components/*`, `src/styles.css`, `src/hooks/*`, `src/test/*`), estado do Project 2 (F0–F13 concluídas, gates 117/117 vitest) e `mem://product/evolution.md`.

## 0. Regras de engajamento do remix

1. Este remix executa o Project 3 fase a fase, conforme `.opencode/roadmap-proj3`. Só avança quando os gates da fase passam.
2. `project3.md` §20 (fronteiras) é vinculante: nada de login, cadastro, papéis, segurança operacional, pagamentos, deploy, serviços externos ou infraestrutura. Segurança/DevOps/Networking continuam como assuntos educativos, não como escopo de implementação.
3. Significados e contratos do Project 2 que permanecem: ids canônicos 1..111, chave de estado `vibecoder-learning-v1`, dimensões Contato·Prática·Demonstrado·Transferido·Retido·Aplicação declarada, `RETENTION_INTERVAL_MS` = 72h, `recordAttempt` como único agendador de recuperação, sem percentual global, sem "Mission ready".
4. Precisão dos simuladores é comportamento contratado em testes (`src/test/simulators.test.ts`): não pode regredir. A evolução de interface torna as correções compreensíveis, não as esconde.
5. Qualidade acima de quantidade: nenhum requisito deste PRD é "contar telas"; cada fase fecha uma fricção observada em `project3.md`.

## 1. Diagnóstico confirmado no código (fatos que o PRD usa)

| Fato verificado | Fonte no código |
|---|---|
| Tokens são OKLCH com shell escuro único (`:root,.dark` idênticos), violeta `--primary` como solução dominante, `--paper/--ink` como superfície editorial pontual (`prose-paper`) | `src/styles.css` |
| Header mostra badge permanente "Declared in my app: n/111" e nav Biblioteca·Laboratórios·Progresso·Meu app; Missões não têm entrada | `src/components/site-header.tsx` |
| Home concentra apresentação + busca + catálogo; card de conceito usa analogia legada como descrição e Link-overlay `z-10` | `src/routes/index.tsx`, `src/components/concept-card.tsx` |
| 26 lições estruturadas de 111 conceitos; 85 seguem legadas; lições têm `provenance.reviewed` | `src/lib/lessons/index.ts`, `coverage.ts` |
| Instrumentos: 7 kinds declarados (`request-flow, latency-histogram, state-machine, event-track, query-explainer, timeline, table`); `timeline` sem render dedicado | `src/lib/lessons/types.ts`, `src/components/instruments/` |
| Motor de prática: 6 tipos (`predict, order, compare, find-flaw, variant, choose-info`), rubrica com critérios/causa/trade-off/validAlternatives, ajuda graduada 3 níveis, `taskQualityIssues` | `src/lib/exercises.ts` |
| 6 laboratórios (`ratelimit, circuit, nplusone, sqli, pubsub, tail`) com lógica pura injetável em `src/lib/simulators.ts` | `src/lib/labs.ts`, `simulators.ts` |
| Missões: 5 casos; dossiê em `learning.missions`; avanço por participação; estado de missão no store compartilhado | `src/lib/missions.ts`, `learning.ts` |
| Progresso: 6 dimensões com denominador rotulado e significado explícito; matriz por categoria | `src/lib/progress.ts`, `src/routes/progress.tsx` |
| Meu app (`/readiness`): checklist de autodeclaração legada migrado 1:1 | `src/routes/readiness.tsx` |
| Rotas: `/`, `/concepts/$id`, `/sandboxes`, `/labs/$id`, `/missions` (layout+index+$slug), `/progress`, `/readiness` | `src/routes/` |
| Testes: ≥101 contratos (tsgo + vitest como gate padrão do projeto) | `src/test/`, AGENTS.md |

Cada fase abaixo ataca um ou mais desses fatos.

## 2. Decisões técnicas globais

### D1 — Sistema de identidade v3: base clara, bancada escura, marca restrita
- `:root` passa a ser o tema claro: superfície de leitura neutra quente clara, tinta bem contrastada (`--background` claro, `--foreground` tinta escura). O fundo escuro deixa de ser o shell do produto.
- Bancadas e áreas instrumentais (laboratórios, instrumentos, traces) recebem tokens próprios de superfície escura opcional: `--bench`, `--bench-foreground`, `--bench-muted`, `--bench-border`, `--bench-accent`. Bancada escura é escolha de tarefa (observação/comparação), não decoração.
- Acentos funcionais mantêm papéis exclusivos: `--success`, `--warning`, `--destructive`, `--info/accent-2`. Violeta (`--primary`) volta a papel de marca: logotipo, CTA primário, foco — não fundo de tudo. Em tema claro, violeta escurece para contraste AA como texto.
- Superfícies: `--surface` (leitura), `--surface-raised` (cards sobre leitura), `--bench` (instrumental), `--evidence` (registro de evidência, superfície distinta das duas anteriores). Mudança de superfície indica mudança de tarefa (planejamento §5.2).
- Nenhuma cor hardcoded em componentes (regra já contratada). Todo o redesenho passa por tokens em `src/styles.css` + variantes shadcn.
- Nesta fase inicial do remix há um único tema ativo (claro). Tema claro/escuro completo por preferência fica FORA do escopo do remix 3; o sistema de tokens já o viabiliza sem retrabalho estrutural.

### D2 — Tipografia por papéis
- Papéis fixados: **título editorial** = Fraunces (display, personalidade); **UI/rótulos/leitura de interface** = Space Grotesk; **código/identificadores/medidas** = JetBrains Mono. Monoespaçada nunca como atmosfera: só código, ids e números que ganham com ela.
- Escala editorial: títulos de seção com hierarquia real (números editoriais opcionais, ex. "§3.2"), divisores e ritmo por margem/alinhamento em vez de cartões empilhados.
- Larguras por tarefa: leitura ~65–75ch; bancadas largas quando o instrumento exige; comparação pode usar duas colunas no desktop. Nenhuma página resolve congestionamento encolhendo texto.

### D3 — Arquitetura de informação e navegação
- Header organizado pelo trabalho do aluno: **Início** (`/`) · **Biblioteca** (`/library`, nova) · **Laboratórios** (`/sandboxes`) · **Missões** (`/missions`) · **Progresso** (`/progress`) · **Meu app** (`/readiness`).
- O badge "n/111" sai do header (planejamento §6): autodeclaração continua em `/readiness` com seu significado intacto.
- `/library` recebe o acervo completo (busca, categorias, cobertura). `/` vira mesa de trabalho (sessão atual + próxima ação), sem catálogo como continuação inevitável.
- Missões ganham entrada de primeira classe no header, compatível com seu papel metodológico.
- Contexto preservado na navegação: busca mantém `?q=`/`?cat=` (já existe) e o retorno de aula/laboratório/missão devolve filtros e posição; abrir um apoio não destrói a sessão.

### D4 — Política de idioma
- Interface, navegação, comandos, estados e feedback do motor: **pt-BR**.
- Conteúdo editorial existente em inglês NÃO é traduzido automaticamente neste remix (planejamento §17 proíbe tradução integral automática sem decisão de produto; honestidade da proveniência). Termos técnicos reconhecíveis permanecem (ex.: "circuit breaker", "P99").
- Novos textos editoriais e toda a nova UI nascem em pt-BR. Rotulagem de dimensões do progresso ganha rótulo pt-BR quando a tela for redesenhada (F6), sem reinterpretar semântica.

### D5 — Contratos de aula e representação
- `RepresentationSpec`/`Lesson` (contrato D1 do Project 2) continua sendo a fonte; o redesenho muda a renderização, não o contrato editorial.
- `timeline` recebe render dedicado no despacho de aula (hoje cai em fallback) — comportamento novo coberto por teste de shapes.
- Instrumentos ganham leitura por estado: seleção ilumina consequência (fluxo↔registro↔explicação) onde o kind suporta; equivalentes textuais continuam obrigatórios (a11y D13 project2).

### D6 — Laboratório: uma execução, uma evidência
- Bancada unifica cenário curto, previsão, controles, instrumento vivo e registro: a representação, os registros e os números vêm da mesma execução identificável (planejamento §8.5).
- Distinguir sempre: exemplo editorial fixo (rotulado "exemplo") vs. execução atual do aluno. Estado sem execução é estado de trabalho legível, não gráfico fictício.
- Controles de configuração ≠ reinício; comparar preserva a tentativa anterior e rotula cada configuração. Parâmetros inválidos e casos fora do modelo são estados explícitos.
- Saída útil: relatório de experimento (hipótese → configuração → observação → interpretação) registrável no caderno de evidências (F6).
- `simulators.ts` permanece puro e injetável; componentes só renderizam estado retornado.

### D7 — Missões: raciocínio preservado
- O histórico da missão (previsões iniciais, revisões de hipótese, evidências incorporadas, decisões) NÃO é limpo ao trocar de etapa; fica consultável e confrontável.
- O dossiê final é derivado do histórico e editável — nunca redigido do zero em campo vazio.
- Avanço por participação é permitido, mas a UI distingue: etapa percorrida / critério demonstrado / reflexão não avaliada. Sem nota falsa de qualidade de texto aberto.
- Ida ao laboratório dentro da missão carrega e devolve contexto (hipótese em teste + resultado reaproveitável), sem desvio de página sem retorno.

### D8 — Evidência contextual e caderno
- Novo registro de evidência contextual (aditivo, não destrutivo): liga tarefa, cenário, resposta/decisão, configuração, observação, critérios, apoio usado, resultado e momento. Distingue: resposta avaliada objetivamente / solução revelada (não conta como demonstração) / anotação pessoal / dossiê.
- Caderno de decisões: página única onde hipóteses, relatórios de experimento, comparações e dossiês ficam recuperáveis, referenciando a evidência de origem. Não é mais uma coleção de resumos.
- Persistência: `localStorage` no padrão do projeto (`useSyncExternalStore`, `getServerSnapshot` neutro congelado — regra D3 do Project 2). Nova chave de store separada (ex. `vibecoder-evidence-v1`) sem tocar `vibecoder-learning-v1`.
- Retenção: intervalo de 72h permanece; a experiência de recuperação (F6) passa a usar a evidência, sem punir atraso e sem alterar a semântica de `retained`.

### D9 — Personalização explicável
- Objetivo do aluno editável; quando não corresponde a percurso, o produto ADMITE ("não há percurso correspondente") e oferece exploração — nunca encaminha silenciosamente para o primeiro percurso (comportamento atual a corrigir em F1/F2).
- Recomendações continuam explicando motivo; sempre ignoráveis/adiáveis, sem punição. Tempo disponível distingue unidades (15min ≠ 30min como hoje).
- Equívocos e confiança recomendarão contraste/apoio específico com motivo, a partir de critérios quebrados já registrados.

### D10 — Acessibilidade e mobile como desenho, não patch
- Toda ação importante por teclado; seleção ≠ foco visualmente distintos; ordenação/drag têm alternativa de teclado completa.
- Equivalente textual responde à mesma pergunta do instrumento (não lista bruta de valores).
- Movimento pausável/reduzido; `prefers-reduced-motion` já respeitado e mantido.
- Mobile: recomposição por etapas curtas (controles e observação próximos), não empilhamento de coluna única longa; header compacto sem consumir a área de trabalho.
- Contraste AA nas novas combinações de token, verificado por combinação (tinta/superfície, acento/uso).

### D11 — Estratégia de execução (enxame de 3 pilares)
- Pilares centrais (project3, prd-project3, roadmap-proj3) fixados antes de spawn; skill `subagentes-3-pilares` governa decomposição, ondas, verificação e integração.
- Ondas previstas: F0 é fundação feita pelo agente principal (contratos + tokens + shell). F1–F2 podem paralelizar (home / biblioteca) — donos exclusivos por rota. F3–F4 idem (aula / laboratórios). F5–F7 idem (missões / progresso+caderno / meu app). F8 é costura transversal do agente principal.
- Subagente read-only produz conteúdo/auditoria quando o recorte é editorial; subagente de fatia vertical assume rotas exclusivas quando o pacote é de código. Nenhum toca arquivos de outro pacote; costuras (header, rotas compartilhadas, index agregadores, testes globais) são do agente principal.

### D12 — Gates globais (por fase, sem exceção)
- `bunx tsgo --noEmit` limpo.
- `bunx vitest run` verde com contagem ≥ 101 (nunca menos que o estado anterior).
- Build do preview OK (build-errors.log sem erro novo).
- Roteiro E2E Playwright das telas tocadas passando (hidratação ~900–1000ms após goto; comparações de texto case-insensitive; nunca `body.upper()`).
- Nenhum teste contratado de precisão de simulador/regressão de clique removido ou enfraquecido.
- Fases com conteúdo novo de regra/estado adicionam teste unitário ao lado dos existentes.

### D13 — Proibições específicas (além do §20 do planejamento)
- Não reintroduzir "percentual global", ranking, streak, medalhas, certificado.
- Não converter autodeclaração legada em evidência de domínio.
- Não fingir sincronização/avaliação automática de texto/infra executável.
- Não trocar `reviewed: false` por `true` sem revisão efetiva nesta rodada.
- Não usar `supabase-admin`/backend para o caderno ou evidência: tudo local (sem login no escopo).
- Não criar 15 minissites de categoria: 15 temas compartilham gramática e diferem no instrumento/tarefa.
- Não transportar automaticamente cartões, larguras e frases do Project 2 para as telas redesenhadas (preservar conhecimento e distinções; questionar a forma).

## 3. Escopo por fase, com critérios de aceite

### F0 — Fundação de identidade v3 e shell de navegação
**Escopo:** D1, D2, D3, D4 (parte de UI). Tokens de tema claro + bancada + evidência; papéis tipográficos; header/navegação novos; rota `/library` criada (recebe o catálogo atual intacto em forma, restilizado por tokens); `/` continua funcional (temporariamente com o catálogo, até F1); política de idioma da UI (pt-BR) aplicada ao shell.
**Aceite:**
- `src/styles.css` reescrito com tokens claros+bancada sem cor hardcoded nova em componentes; .dark permanece coerente (não ativo).
- Header sem badge n/111; nav completa com Missões; mobile navegável; marca legível na primeira experiência.
- `/library` existe e renderiza o acervo; links do header não apontam para rota inexistente (regra do TanStack: rota criada no mesmo lote).
- Contraste AA: tinta sobre superfície clara ≥ AA; violeta como texto ≥ AA.
- Gates D12 verdes; testes de navegação atualizados sem perder contratos (contagem não cai).
**Fora:** conteúdo novo, simulações, mudança de significado de progresso.

### F1 — Home: mesa de trabalho
**Escopo:** §8.1. Estados desenhados: primeira visita (problema concreto + escolha curta de intenção), retorno (atividade interrompida em destaque com ponto de retomada real), revisão pendente, tudo concluído. Catálogo sai de `/` (vira seleção editorial curta no máximo). Objetivo do aluno editável (D9) com admissão honesta de não correspondência.
**Aceite:**
- Primeira tela oferece ação útil sem rolar por apresentação (verificado em viewport mobile 390×844 e desktop).
- "Continuar" aponta para a atividade/tarefa interrompida com contexto (missão ativa/última prática), não apenas para a última página.
- Estados sem histórico não mostram painel vazio nem números inflados.
- Recomendação com motivo explicado e ignorável.
- Gates D12 + teste unitário da lógica de próxima ação.

### F2 — Biblioteca: descobrir pelo problema, mecanismo e contraste
**Escopo:** §8.2. Busca inclui aulas, laboratórios e missões com motivo da relevância e tipo de experiência entregue; filtros por tema/tipo/profundidade disponível; cards mostram problema + ação aprendida + representação real (analogia deixa de ser resumo principal); categorias com apresentação própria; busca sem resultado ajuda a reformular; visão compacta vs. editorial.
**Aceite:**
- Resultados explicam por que correspondem à consulta (sintoma→mecanismo preservado de `symptoms.ts`).
- Nenhum resultado fraco apresentado como diagnóstico; vazio com orientação.
- Filtros/posição preservados ao abrir e voltar de um item.
- Cobertura honesta visível (aula estruturada vs. referência legada vs. não revisado).
- Gates D12 + testes da busca ampliada.

### F3 — Aula: espaço de compreensão e decisão
**Escopo:** §8.3. Três modos compatíveis (compreensão guiada, consulta rápida, prática) sem duplicar explicação nem esconder limites; pré-requisitos com nome, motivo e retomada curta (não números); representação próxima da pergunta; render dedicado de `timeline` (D5); comparação antes/depois com cenário compartilhado; fechamento com síntese do princípio + condições de uso + erro provável + próxima aplicação (não autodeclaração como único fechamento).
**Aceite:**
- Consulta rápida responde definição/mecanismo/limites sem percorrer a aula inteira.
- Pré-requisito mostra por que é necessário e retorna ao mesmo ponto da aula.
- `timeline` renderiza com equivalente textual (teste de shapes).
- Síntese final é derivada da lição (contrato `Lesson`), não texto solto.
- Gates D12 + testes.

### F4 — Laboratórios: catálogo intencional + bancada unificada
**Escopo:** §8.4–8.5 e §10 (os 6 laboratórios, um a um). Catálogo revela fenômeno, controles reais, competência e limites (sem prometer fan-out/índice/precisão além do suportado). Bancada (D6): previsão antes da execução, execução identificável, comparação rotulada, relatório de experimento, estados completos (sem execução, parcial, pausa, parâmetro inválido, fora do modelo, sem evidência suficiente, reinício).
**Aceite por laboratório (contratado nos testes existentes e novos):**
- Ratelimit: clientes/tokens/tempo/destino visíveis; burst vs. taxa sustentada distinguíveis; escopo comparável.
- Circuit: máquina de estados acompanha a execução real; comparação com/sem proteção na mesma sequência.
- N+1: consultas, linhas e custo modelado com a mesma entidade identificável antes/depois.
- SQLi: consulta/entrada/parâmetros/resultado no mesmo campo de raciocínio; casos fora do modelo honestos.
- Pub/Sub: modos competing/fan-out como estruturas diferentes; evento com trajetória rastreável; DLQ como consequência de política; falhas com causas distintas.
- Tail: histograma+observações+marcador com unidades e amostra; exemplo 99×100/1×10.000 intacto.
- Relatório de experimento registrável no caderno (D8).
- Gates D12; nenhum teste de `simulators.test.ts` enfraquecido.

### F5 — Missões: investigação com memória
**Escopo:** §8.6 e D7. Composição por tipo de missão (investigação por evidências/hipóteses; timeline/invariante; etc.), histórico de raciocínio preservado e confrontável, dossiê derivado e editável, retorno real do laboratório, índice com problema/competência/pré-requisitos/produto/atividade interrompida, separação etapa percorrida vs. critério demonstrado vs. reflexão aberta.
**Aceite:**
- Trocar de etapa não apaga previsões/hipóteses/evidências (teste do store).
- Dossiê pré-preenchido a partir do histórico e editável.
- Lab↔missão preserva hipótese e resultado (ida e volta).
- Distinções de avanço visíveis na UI e no estado.
- Gates D12 + testes de missão/store.

### F6 — Progresso, evidências e revisão
**Escopo:** §8.7–8.9, D8, D9 (parte), §14. Progresso vira perguntas respondidas + lacunas acionáveis + evidências inspecionáveis (6 dimensões preservadas com rótulo pt-BR e denominador); "0/0" vira "sem prática disponível"; detalhe de evidência completa (tarefa, cenário, resposta, apoio, critérios, resultado, data) com comparação entre tentativas; revisão como sessão de recuperação (pergunta → resposta → apoio sob demanda → fechamento), não releitura; caderno de decisões (D8).
**Aceite:**
- Dimensões e denominadores com os mesmos números dos testes atuais (semântica intacta); apenas apresentação muda.
- Evidência mostra história completa; comparação lado a lado funciona.
- Sessão de revisão fecha com feedback e atualização de `retained` apenas via `recordAttempt` (nunca na mão).
- Caderno lista relatórios de experimento, dossiês e anotações com origem.
- Gates D12 + testes de evidência/caderno.

### F7 — Meu projeto: registro contextual
**Escopo:** §8.8. Do checklist de adoção para registro de decisão contextual: necessidade, decisão, motivo, alternativa descartada, evidência disponível, próxima verificação; "não se aplica" como conclusão válida; link decisão↔aula/missão com retorno para resolver lacuna; declarações legadas preservadas com significado histórico.
**Aceite:**
- Nada é marcado "implementado" como prova; o registro é reflexão, nunca certificação.
- Migração 1:1 do legado mantém significado (testes existentes de learning continuam verdes).
- Gates D12 + testes.

### F8 — Acabamento transversal: estados, a11y, mobile, idioma
**Escopo:** §15–§17, D10, D4. Passada completa por todas as telas redesenhadas: tabela de estados do planejamento (§15) aplicada; teclado completo; equivalentes textuais respondem à pergunta; mobile recomposto (não empilhado); passada de idioma pt-BR na UI; remoção de uppercase em explicações onde ainda existir; foco visível; reduced-motion.
**Aceite:**
- Roteiro E2E dedicado: navegação por teclado em aula+laboratório+missão; verificação de estados vazios/erro/parcial por tela.
- Nenhum comando destrutivo se confunde com comparativo; reinício distinto de configuração.
- Gates D12 + E2E específico verde.

### F9 — Conteúdo: percursos fechados e honestidade de cobertura
**Escopo:** §12 e §11.1. Auditoria dos 111 conceitos contra critérios de profundidade (12.1: 8 capacidades); fechar elos frágeis dos percursos existentes antes de expandir; tratamento substantivo para DevOps, Streaming, Distributed, Scaling, Reliability, Security, Networking onde os percursos exigem; referências rápidas mantidas com alcance indicado; exemplos em contexto recorrente com variantes de domínio; proveniência honesta.
**Aceite:**
- Nenhum percurso com "referência superficial no ponto decisivo" (verificação por percurso, item a item).
- Cobertura nominal não é meta: cada lição nova passa pelos 8 critérios ou é rotulada como referência.
- `reviewed` só muda com revisão efetiva registrada nas notes.
- Gates D12 + testes de lessons/coverage atualizados.

## 4. Ordens e dependências

- F0 → F1..F7 dependem dos tokens/shell. F1 e F2 podem paralelizar (rotas distintas). F3 e F4 podem paralelizar. F5 depende de F4 (retorno de laboratório) para fechar, mas pode iniciar UI própria em paralelo. F6 depende de D8 (contrato de evidência) e pode paralelizar com F7. F8 é costura depois das ondas. F9 é contínuo e independente de UI, mas só é honesto com as telas novas (rotulagem de alcance).
- Ordem no roadmap é a precedência oficial; mudança de ordem exige justificativa registrada no próprio roadmap.

## 5. Casos de borda e testes esperados (transversais)

1. Primeiro acesso sem nenhum dado: home sem painel vazio; biblioteca sem recommandação fabricada.
2. Objetivo sem correspondência: admissão explícita, sem redirecionamento silencioso.
3. Busca sem resultado: orientação de reformulação; sem falso positivo de "diagnóstico".
4. Execução de laboratório sem evidência suficiente: relatório bloqueado com motivo, não salvo parcialmente como válido.
5. Parâmetro inválido e caso fora do modelo: estados nomeados com limite explícito.
6. Reinício vs. mudança de configuração: nunca apagar comparação silenciosamente.
7. Troca de etapa de missão: histórico preservado (teste do store).
8. Solução revelada (help 3): conta como consolidação, nunca como demonstração independente (contrato existente mantido).
9. Atraso de revisão: não apaga `retained` anterior; sem dívida moral na UI.
10. SSR/hidratação: qualquer estado novo lido do localStorage passa por store com `getServerSnapshot` neutro (sem mismatch).

## 6. Tools e skills recomendadas por tipo de trabalho

- Fundação/UI e tokens: escrita direta em `src/styles.css`, `src/routes/__root.tsx` (fontes via `<link>`, nunca @import remoto em styles.css), componentes em `src/components/`.
- Verificação: `bunx tsgo --noEmit`, `bunx vitest run`, roteiros Playwright em `/tmp/browser/` (viewport 1280×1800; mobile 390×844 quando o alvo é recomposição), build-errors.log.
- Conteúdo editorial (F9): subagentes read-only com pilares próprios produzindo objetos `Lesson`/`Task` íntegros; integração pelo agente principal (mesma divisão que funcionou em s7–s13 do Project 2).
- Memória/decisões: valores escolhidos pelo usuário (paleta final, nomes de seção) vão para `mem://`; regras estruturais para `AGENTS.md` (uma regra, um porquê).

## 7. Registro de decisões deste PRD

- D1..D13 acima. Nenhuma decisão "futura" fica implícita: o que não está aqui não está autorizado; ambiguidades se resolvem contra `project3.md` e registram nesta seção com número (D14, D15…) à medida que surgirem.

## 8. Critério de encerramento do Project 3

Todas as fases F0–F9 com gates verdes e a checagem de 5 min/10 tentativas executada sobre novos arquivos e fases (protocolo plan.md §Como executar). Neste remix, se nem tudo couber, o roadmap central registra o estado exato (checkboxes, gates reais, linha "Próximo remix") para retomada sem redescoberta.

## 9. Contratos técnicos fixados nesta rodada

Tudo que mais de um pacote consome fica fixado AQUI antes da onda paralela (skill subagentes-3-pilares §3). Subagentes implementam contra estes contratos; se um contrato estiver errado, avisam no relatório em vez de improvisar.

### 9.1 Tokens de identidade v3 (F0 — fonte da verdade: `src/styles.css`)

```text
Superfícies (tema claro ativo):
  --background        leitura neutra clara (base do produto)
  --foreground        tinta escura de alta legibilidade
  --surface-raised    card sobre a leitura (borda sutil, sem sombra pesada)
  --paper / --ink     bloco editorial de leitura longa (mantém papel; passa a
                      existir contraste por borda/tonalidade, não por inversão)
  --bench             superfície instrumental escura (laboratórios, instrumentos)
  --bench-foreground  tinta sobre bancada
  --bench-muted       texto secundário de bancada
  --bench-border      borda dentro da bancada
  --evidence          superfície do registro de evidência (distinta das outras)
Marca e estados:
  --primary           violeta de marca (texto/CTA em claro = tom AA)
  --accent-2 / --info ciano funcional (informativo)
  --success --warning --destructive  papéis exclusivos, inalterados
Tipografia (papéis, sem trocar as 3 famílias já carregadas):
  display/editorial   Fraunces      títulos de aula, seção, missão
  ui                  Space Grotesk nav, rótulos, corpo de interface
  dados               JetBrains Mono código, identificadores, números
```

- Utilitários novos em styles.css: `.prose-paper` (revisto para tema claro), `.bench` (composição de bancada), `.surface-evidence`.
- Nenhuma classe utilitária de cor literal (bg-[#…], text-white) em componente novo ou editado.

### 9.2 Arquitetura de rotas (F0 — criação no mesmo lote dos links)

```text
/               Início — mesa de trabalho (F1 redesenha; F0 só troca rótulo)
/library        Biblioteca — acervo completo (nova; F0 recebe o catálogo atual)
/sandboxes      Laboratórios — catálogo (F4 redesenha)
/labs/$id       Laboratório focado (F4 redesenha)
/missions       Missões — layout + índice (F5 redesenha índice)
/missions/$slug Missão (F5 redesenha)
/progress       Progresso (F6 redesenha)
/readiness      Meu app (F7 redesenha)
/concepts/$id   Conceito/aula (F3 redesenha)
```

- Header (F0): Início · Biblioteca · Laboratórios · Missões · Progresso · Meu app. Sem badge n/111.
- Regra TanStack preservada: rota referenciada por Link nasce no mesmo lote; rotas de layout renderizam `<Outlet />`.

### 9.3 Evidência contextual (D8 — F6, consumida por F4/F5/F6)

```text
Chave do store: "vibecoder-evidence-v1" (localStorage, useSyncExternalStore,
getServerSnapshot neutro congelado — mesmo padrão de learning.ts)

interface EvidenceRecord {
  id: string;                 // uuid local
  createdAt: number;          // epoch ms
  source:
    | { kind: "task"; taskId: string; conceptId: number;
        outcome: "met" | "partial" | "missed";
        answer: Answer; helpUsed: number; scenario?: string }
    | { kind: "lab"; labId: string; hypothesis: string;
        config: Record<string, number | string>;
        observation: string; interpretation: string }
    | { kind: "mission"; missionSlug: string; stageIndex: number;
        note: string };
  status: "evaluated" | "revealed" | "personal";
  // evaluated = resposta com critérios objetivos
  // revealed  = solução vista (nunca conta como demonstração)
  // personal  = anotação própria
}
```

- API do store: `appendEvidence`, `listEvidence(filter?)`, `getEvidence(id)` — apenas append/update de anotação pessoal; nada destrutivo silencioso.
- O motor de prática (exercises/learning) continua a fonte do `outcome`; evidência é registro complementar, nunca substitui `learning.ts`.

### 9.4 Caderno de decisões (D8 — F6)

```text
Chave: "vibecoder-notebook-v1"
interface NotebookEntry {
  id: string; createdAt: number; updatedAt: number;
  title: string;
  type: "experiment-report" | "dossier" | "note" | "comparison";
  originEvidenceIds: string[];   // rastreia a evidência de origem
  body: string;                  // pt-BR
  links?: { conceptId?: number; missionSlug?: string };
}
```

### 9.5 Registro de decisão em "Meu projeto" (F7)

```text
interface DecisionRecord {
  id: string; createdAt: number; updatedAt: number;
  conceptId?: number;            // princípio estudado ligado à decisão
  missionSlug?: string;
  need: string;                  // necessidade no projeto do aluno
  decision: string;
  rationale: string;
  rejectedAlternative?: string;
  evidenceNote?: string;         // evidência disponível, honesta
  nextCheck?: string;            // próxima verificação
  notApplicable?: boolean;       // conclusão válida de primeira classe
  legacyLegacyIndex?: number;    // mapeia declaração legada preservada
}
Chave: "vibecoder-decisions-v1". Declarações legadas de /readiness permanecem
intactas em learning.application (significado histórico — nunca reinterpretadas).
```

### 9.6 Modos de aula (F3)

```text
mode: "guided" | "reference" | "practice" (estado de URL (?mode=), default guided)
guided     percurso completo: situação → previsão → modelo → representação →
           contraste → prática → síntese
reference  definição, mecanismo, exemplo, contraexemplo, limites — sem esconder
           que existe mais; link para o modo guiado
practice   motor de prática da lição + variante + critérios
Fechamento (todas as lições): síntese { princípio, condições de uso,
erro mais provável, próxima aplicação } derivada dos campos do contrato Lesson.
```

### 9.7 Relatório de experimento (D6 — F4)

```text
Cada execução de laboratório produz: { hypothesis, config (rotulada),
observation (evidência selecionada), interpretation, verdict? }
- Comparação conserva as configurações anteriores rotuladas (A/B explícito).
- Exemplo editorial fixo é rotulado "exemplo" e nunca espelha a bancada.
- O relatório é o que se registra no caderno (9.4, type "experiment-report").
```

## 10. Pacotes de enxame e ondas

| Onda | Pacote | Dono exclusivo de | Saída |
|---|---|---|---|
| 0 | F0 fundação (agente principal, sem spawn) | styles.css, __root, site-header, routes/library.tsx | tokens+shell+rotas verdes |
| 1a | F1 home | routes/index.tsx, componente próprio | mesa de trabalho |
| 1b | F2 biblioteca | routes/library.tsx, components/library/* | busca+cobertura |
| 2a | F3 aula | routes/concepts.$id.tsx, components/lesson/*, instruments timeline | 3 modos+síntese |
| 2b | F4 laboratórios | routes/labs.$id.tsx, routes/sandboxes.tsx, components/sandboxes/* | bancada unificada |
| 3a | F5 missões | routes/missions*, components/missions/* | memória de raciocínio |
| 3b | F6 progresso+caderno | routes/progress.tsx, components/notebook/*, store evidência | perguntas+evidências |
| 3c | F7 meu app | routes/readiness.tsx, store decisões | registro contextual |
| 4 | F8 costura (agente principal) | passada transversal + E2E | estados/a11y/mobile/idioma |
| contínuo | F9 conteúdo | subagentes read-only (s14…) | objetos Lesson/Task íntegros |

- Costuras reservadas ao agente principal: header, `routes/__root.tsx`, agregadores (`lessons/index.ts`, `exercises-data/index.ts`, `instruments/index.ts`), testes globais, `routeTree.gen.ts` (auto), AGENTS.md.
- Subagentes read-only (conteúdo F9) seguem o padrão s7–s13: entregam arrays íntegros no relatório; o agente principal integra e marca o roadmap central.

## 11. Roteiros E2E previstos (Playwright, `/tmp/browser/`)

1. `e2e_f0_shell.py` — nav completa por header (desktop+mobile), sem badge n/111, /library acessível, contraste visual por screenshot.
2. `e2e_f1_home.py` — estados primeira visita/retorno; "continuar" leva à atividade com contexto.
3. `e2e_f2_library.py` — busca por sintoma→resultado com motivo; vazio orientado; filtros preservados no retorno.
4. `e2e_f3_lesson.py` — modos, pré-req nomeado com retorno ao ponto, síntese final, timeline renderizada.
5. `e2e_f4_lab.py` — previsão→execução→observação→relatório; comparação A/B; reinício ≠ configuração.
6. `e2e_f5_mission.py` — troca de etapa preserva histórico; lab ida-e-volta; dossiê derivado.
7. `e2e_f6_progress.py` — revisão como sessão; comparação de evidências; caderno com origem.
8. `e2e_f7_mine.py` — registro de decisão com "não se aplica"; legado preservado.
9. `e2e_f8_keyboard.py` — teclado ponta a ponta; estados vazios/erro; reduced-motion.

Convenções existentes mantidas: hidratação ~900–1000ms pós-goto antes de clicar; texto case-insensitive; nunca `body.upper()`; viewport 1280×1800 (mobile: 390×844 nos roteiros de recomposição).

## 12. Registro de riscos e mitigação

| Risco | Mitigação |
|---|---|
| Tema claro quebrar contrastes em componentes legados que assumiam fundo escuro | F0 faz passada por componentes com uso direto de cores/tokens ambiguos; E2E visual por screenshot em F0 |
| Reestruturação do home quebrar testes de navegação/busca existentes | Atualizar testes junto ao lote; contagem nunca cai; contratos de sintoma preservados |
| Bancada escura introduzir cores hardcoded | Banido por D1; revisão de diff por fase |
| Store novo colidir com learning.ts | Chaves separadas; sem migration de learning; testes de learning intactos |
| Scope creep de conteúdo (F9) engolir o remix | F9 é contínuo e último; fases de UI têm prioridade de onda |
| Retorno de laboratório sem contexto na missão | Contrato 9.7 + teste E2E 6 |
| Hidratação/SSR com estado novo | Padrão getServerSnapshot neutro; teste de learning como guardião |

## 13. Checagem de 5 min / 10 tentativas (protocolo)

Ao concluir cada fase ou arquivo novo relevante: até 10 tentativas curtas de verificação em janela de ~5 min (tsgo, vitest alvo, goto Playwright da tela, leitura do build-errors.log). Falha persistente após 10 → registrar no roadmap como pendência com evidência, não como concluído.

## 14. Especificação de composição por tela (guia de desenho por fase)

### 14.1 Shell e navegação (F0)
- Marca "VibeCoder Academy" legível na primeira experiência: nome em display serif + rótulo funcional pequeno; o ícone de CPU não é a identidade (planejamento §5.1), é apoio.
- Nav com estado ativo claro (fundo de superfície elevada + tinta primária), estado hover distinto de ativo; no mobile a nav rola horizontalmente abaixo da marca sem consumir a área de trabalho.
- Sem pontuação permanente na barra: o trabalho do aluno mora nas telas, não no header.

### 14.2 Início (F1)
- Composição em camadas por estado, não grade de cards iguais: (1) faixa de sessão — a próxima ação com contexto e estimativa honesta de esforço; (2) faixa de revisão pendente quando existir; (3) seleção editorial curta (3–5 itens com motivo), nunca o catálogo.
- Primeira visita: um problema concreto reconhecível + escolha curta de intenção; fenômeno visual legível (não ilustração decorativa).
- Objetivo editável em campo de uma linha com admissão de não correspondência.

### 14.3 Biblioteca (F2)
- Três entradas claramente separadas: consulta por nome (busca), investigação por sintoma (busca semântica existente), exploração por competência (categorias com apresentação própria).
- Resultado: problema + objetivo observável + apoios + cobertura (aula/referência/não revisado) + miniatura representativa.
- Categorias: cabeçalho editorial com pergunta importante da categoria, não faixa de pills.

### 14.4 Aula (F3)
- Abertura com situação + objetivo + representação central próxima da pergunta.
- Pré-requisitos como fichas com nome, motivo e retomada curta.
- Alternância observar → explicar → decidir; comparações antes/depois com cenário/dados/suposições compartilhados e causa destacada.
- Fechamento: síntese em superfície de evidência (9.1), não checklist de autodeclaração.

### 14.5 Laboratórios (F4)
- Catálogo: preview real do instrumento, controles disponíveis, competência, limites e relação de prática direta vs. apoio contextual com o conceito.
- Bancada: coluna de controles com limites visíveis + instrumento vivo + faixa de registro; previsão pedida antes da execução; execução identificável (nº da tentativa, configuração rotulada).
- Relatório de experimento em superfície de evidência com hipótese/config/observação/interpretação.

### 14.6 Missões (F5)
- Cada missão com composição própria por tipo de caso (evidências/hipóteses, timeline/invariante, fluxo/capacidade, comparação de acesso, matriz de versões).
- Faixa de raciocínio: previsões iniciais, revisões de hipótese e decisões consultáveis a qualquer momento; dossiê derivado editável ao final.
- Lab↔missão: convite de experimento carrega a hipótese; o retorno oferece incorporar o resultado como evidência.

### 14.7 Progresso (F6)
- Abertura com perguntas respondidas ("o que consigo demonstrar?", "o que vale praticar agora?"), lacunas acionáveis e revisões úteis antes de qualquer matriz.
- Matriz de categorias com "sem prática disponível" para 0/0, distinguido do desempenho do aluno.
- Detalhe de evidência: tarefa, cenário, resposta, apoio, critérios, resultado, data; comparação lado a lado de duas tentativas.

### 14.8 Meu app (F7)
- Registro de decisão em ficha única: necessidade → decisão → motivo → alternativa descartada → evidência → próxima verificação; "não se aplica" em destaque legítimo.
- Lista ordenada por relevância para o objetivo do aluno, não por data crua.

## 15. Plano de testes detalhado

### 15.1 Unitários (vitest, ao lado de `src/test/`)
- `learning.test.ts`, `progress.test.ts`, `missions.test.ts`, `simulators.test.ts`, `lessons.test.ts`, `recommend.test.ts`, `symptoms.test.ts`, `relations.test.ts`, `exercises.test.ts`, `instruments-shapes.test.ts`, `concepts.test.ts`, `app-routing.test.tsx` — nenhum enfraquecido; adaptações só de seletor/rótulo com o contrato preservado.
- Novos: `evidence.test.ts` (append/origem/status; revealed nunca demonstra), `notebook.test.ts` (origem rastreada), `decisions.test.ts` (notApplicable de primeira classe; legado preservado), `next-action.test.ts` (ordenação da mesa de trabalho; revisão pendente), `library-search.test.ts` (motivo da relevância; vazio orientado), `lesson-modes.test.ts` (síntese derivada; referência não superficial).
- Regra: um teste por regra nova, com valor concreto; nunca snapshot de estilo/markup.

### 15.2 E2E (seção 11) + observabilidade
- Cada fase roda o roteiro dela e o `e2e_f0_shell.py` se o shell mudou.
- build-errors.log consultado após cada lote de edits; console-logs/runtime-errors do preview conferidos nos estados tocados.

### 15.3 Critérios de qualidade ligados ao planejamento §19
- Identidade: aula/laboratório/missão reconhecíveis como a mesma Academy com composições distintas; assunto reconhecível pela representação central.
- Fluxos: sintoma→evidência→volta com conclusão; pré-req→retomada; retomada de tarefa real; consulta rápida sem estudo obrigatório; fechamento com síntese.
- Aprendizagem: previsão antes da explicação onde o ciclo pede; feedback com evidência e contraste; registros distinguem independente/ajuda/reflexão/autodeclaração.
- Sem metas de tempo/porcentagem inventadas; identidade julgada por legibilidade e pertinência, não só aparência.

## 16. Glossário editorial (pt-BR, uso consistente)

| Termo | Uso |
|---|---|
| Mesa de trabalho | home quando há sessão em curso |
| Biblioteca | acervo completo com busca/categorias |
| Bancada | área instrumental do laboratório |
| Execução | uma rodada identificável do simulador |
| Relatório de experimento | hipótese+configuração+observação+interpretação |
| Evidência | registro inspecionável de decisão/observação |
| Caderno | coleção recuperável de relatórios, dossiês e anotações |
| Percurso | sequência de aprendizagem por problema/competência |
| Variante | tarefa de transferência (nomes/contexto diferentes) |
| Recuperação | sessão de revisão posterior (72h, hipótese de calibração) |
| Autodeclaração | registro em "Meu app"; nunca prova |
| Solução revelada | apoio nível 3; consolidação, não demonstração |

Nenhum termo novo inventado quando um consagrado existe (rate limit, circuit breaker, percentil); explicação de equivalência quando útil.

