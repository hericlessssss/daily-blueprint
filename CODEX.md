# CODEX.md

Este arquivo e a documentacao viva de como trabalhamos no `daily-blueprint`.

## Modo de trabalho

- Entender contexto antes de alterar codigo.
- Preservar arquitetura existente.
- Fazer mudancas pequenas, seguras e incrementais.
- Preferir TDD sempre que houver comportamento executavel.
- Validar com testes, lint, typecheck e build quando esses comandos existirem.
- Registrar decisoes, padroes, comandos e aprendizados neste arquivo.
- Considerar seguranca, manutencao, rollback e impacto em producao.
- Evitar mudancas fora do escopo.
- Depois de ajustes no projeto, criar commit e fazer push para `origin/main`.

## Definition of Done

Uma tarefa so esta concluida quando:

- Implementacao feita.
- Testes adicionados ou atualizados quando aplicavel.
- Validacoes executadas.
- Documentacao ajustada quando necessario.
- Nenhuma alteracao fora do escopo foi introduzida.

## Comandos

Comandos obrigatorios do DoD tecnico:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run check
```

Validacao complementar:

```bash
git diff --check
rg -n "[^[:ascii:]]" CODEX.md docs prompts src test package.json tsconfig.json tsconfig.build.json eslint.config.js
```

## Padroes iniciais

- Idioma da documentacao: portugues do Brasil, sem acentos por enquanto para
  manter consistencia ASCII em codigo e docs.
- Conteudo literario gerado em `README.md` e `entries/` pode usar acentos e
  Unicode quando o modelo produzir portugues natural.
- Stack planejada: Node.js + TypeScript.
- Test runner: Vitest.
- Linter: ESLint com `typescript-eslint`.
- LLM planejada: Ollama local via API HTTP.
- Scheduler inicial planejado: cron.
- Scheduler de producao desejado: systemd timer, se a operacao pedir mais
  observabilidade.

## Aprendizados

- Commits que devem aparecer no grafico do GitHub precisam usar e-mail associado
  a conta GitHub e chegar a branch default do repositorio.
- O README publico deve ser discreto e literario; a mecanica do projeto fica em
  `docs/`.
- A fundacao tecnica nasceu com `npm run check` agregando lint, typecheck,
  testes e build.
- Regras dependentes de data devem receber `timeZone` explicitamente para evitar
  comportamento acidental do ambiente da VPS.
- O build usa `tsconfig.build.json` para compilar apenas `src/`; testes entram
  no typecheck, mas nao no artefato de build.
- `LLM_PROVIDER=mock` permite execucao local sem chamar Ollama; `ollama` e o
  provider padrao.
- O gerador mockado existe apenas como substituto temporario da API e deve
  preservar o tom publico do livro sem mencionar infraestrutura.
- A escrita local deve falhar quando `entries/YYYY-MM-DD.md` ja existir; a
  protecao evita sobrescrever publicacoes por acidente.
- Prompts vivem em `prompts/` e contexto narrativo em `state/summary.md`; a
  documentacao descreve, mas o codigo consome os artefatos versionados.
- A integracao Ollama fica atras de uma interface estreita e testavel. O modelo
  padrao e `qwen3:1.7b` por equilibrar baixo recurso e texto razoavel.
- Na VPS Hostinger, `qwen3:1.7b` rodou em CPU-only e respondeu uma frase curta
  em cerca de 16s. Isso e aceitavel para um job diario.
- Respostas do Qwen via Ollama podem trazer `thinking` separado; o projeto deve
  persistir apenas `response`.
- Publicacao Git e controlada por flags. `GIT_AUTO_COMMIT=false` e o default
  seguro; na VPS, usar `GIT_AUTO_COMMIT=true` e `GIT_PUSH=true`.
- Quando `GIT_AUTO_COMMIT=true`, sincronizar com `git pull --rebase` antes de
  escrever arquivos de publicacao.
- Smoke test na VPS em `~/daily-blueprint-smoke` passou `npm ci`,
  `npm run check` e `npm run generate` com Ollama real. A pasta era temporaria
  e sem `.git`, entao validou runtime/LLM/escrita, nao commit/push.
- Clone real na VPS em `~/apps/daily-blueprint` precisa de `git config
  user.name` e `git config user.email` antes do primeiro commit automatizado.
- Primeiro teste real com Git na VPS publicou `entries/2026-06-05.md` no commit
  `d2e44ee`.
