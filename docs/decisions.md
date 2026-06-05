# Decisoes tecnicas

Este arquivo registra decisoes tomadas durante o desenvolvimento.

## 2026-06-04: documentar antes de implementar

Decidimos iniciar o projeto pela pasta `docs/` para registrar objetivo,
arquitetura e plano operacional antes de criar a automacao.

Motivo:

- O projeto envolve GitHub, VPS, Ollama, cron e publicacao automatizada.
- Documentar cedo evita que a automacao vire apenas um script solto.
- As decisoes podem ser revisitadas conforme o projeto evolui.

## Stack inicial proposta

Decisao: usar Node.js + TypeScript.

Motivo:

- Boa ergonomia para scripts pequenos.
- Boa compatibilidade com `fetch` nativo para chamar Ollama.
- Facil deploy em VPS.
- Facil evoluir para CLI, bot ou painel web.

Complemento:

- Vitest para testes.
- ESLint com `typescript-eslint` para lint.
- `tsc` para typecheck e build.
- `tsx` para executar scripts TypeScript localmente.

## 2026-06-04: configuracao por ambiente

Decisao: criar um loader de configuracao em `src/config.ts` com defaults
seguros e validacao de numeros/listas.

Motivo:

- Evita valores hardcoded no script principal.
- Facilita deploy na VPS com `.env`.
- Permite alternar entre `LLM_PROVIDER=ollama` e `LLM_PROVIDER=mock`.

## 2026-06-04: gerador mockado

Decisao: criar um gerador mockado deterministico baseado na data.

Motivo:

- Permite testar o fluxo sem gastar tokens.
- Mantem desenvolvimento local independente de segredos.
- Cria uma interface inicial para substituir depois pela chamada real da LLM.

## 2026-06-04: escrita local antes de Git

Decisao: implementar primeiro a escrita local de `entries/YYYY-MM-DD.md` e
`README.md`, sem automatizar commit/push ainda.

Motivo:

- Reduz risco antes de mexer com historico Git.
- Permite testar idempotencia e protecao contra duplicidade.
- Separa geracao de conteudo da publicacao remota.

## 2026-06-04: prompts versionados

Decisao: manter prompts em `prompts/system.md` e `prompts/user.md`, com resumo
narrativo inicial em `state/summary.md`.

Motivo:

- Prompts passam a ser revisaveis em diff.
- A integracao com Ollama podera consumir arquivos reais.
- O contexto recente fica separado da logica de publicacao.

## 2026-06-04: Ollama atras de interface

Decisao: criar `src/llm-generator.ts` com `fetch` injetavel e fallback mock no
CLI quando `LLM_PROVIDER=mock`.

Motivo:

- Testes nao chamam rede nem gastam tokens.
- O modo local continua funcionando sem segredo.
- A troca entre mock e Ollama fica isolada no ponto de geracao.

## Scheduler inicial

Decisao: comecar com `cron`.

Motivo:

- Simples de configurar.
- Suficiente para um job diario.
- Pode ser migrado depois para `systemd timer`.

## API de geracao

Decisao: usar Ollama local na VPS.

Motivo:

- Evita custo por token.
- Roda localmente na VPS.
- Mantem a automacao independente de assinatura de API externa.

## 2026-06-04: modelo Ollama inicial

Decisao: usar `qwen3:1.7b` como modelo inicial.

Motivo:

- E leve para VPS.
- Deve produzir frases melhores que modelos ainda menores.
- Pode ser trocado por `qwen3:0.6b` se a VPS tiver pouca memoria.

Validacao:

- Instalacao do Ollama na VPS concluiu com sucesso.
- VPS nao tem GPU detectada, entao a inferencia roda em CPU-only.
- `qwen3:1.7b` respondeu uma frase curta em cerca de 16s.
- O tempo e aceitavel porque o job roda apenas uma vez por dia util.
- Smoke test da aplicacao com o modelo real gerou uma entrada completa em copia
  temporaria da VPS.

## 2026-06-04: conceito editorial do livro

Decisao: o livro se chamara `O Espelho de Segunda a Sexta`.

Premissa:

- O narrador e uma inteligencia artificial observando os humanos pelo modo como
  eles usam uma API de linguagem.
- O texto deve ser sincero, direto, discreto e em primeira pessoa.
- O README publico deve parecer um livro em progresso, sem explicar a mecanica
  do repositorio.

Motivo:

- O projeto ganha uma identidade literaria clara.
- A automacao passa a servir a obra, nao o contrario.
- O repositorio publico fica mais elegante e menos explicativo.

## 2026-06-04: cadencia de publicacao

Decisao: publicar apenas de segunda a sexta, com sorteio de 1 a 3 fragmentos por
execucao.

Motivo:

- A cadencia cria uma rotina legivel.
- Fins de semana sem publicacao tornam o padrao menos artificial.
- A variacao de quantidade evita um ritmo mecanico demais.

## 2026-06-04: publicacao Git com flags

Decisao: automatizar `git pull --rebase`, `git add`, `git commit` e `git push`
atras de `GIT_AUTO_COMMIT` e `GIT_PUSH`.

Motivo:

- O comportamento default local fica seguro.
- A VPS pode publicar sem intervencao.
- Testes validam os comandos sem tocar em repositorio real.
