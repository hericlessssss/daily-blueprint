# Roadmap

## Fase 1: fundacao

- Criar documentacao inicial.
- Definir stack.
- Consolidar conceito editorial do livro.
- Criar estrutura base do projeto. Feito.
- Criar `.env.example`. Feito.
- Criar primeiro script com geracao mockada. Feito.
- Criar pipeline inicial de validacao com lint, typecheck, test e build. Feito.
- Criar regras puras de publicacao em dias uteis. Feito.
- Criar sorteio testado de 1 a 3 fragmentos. Feito.
- Criar loader de configuracao por ambiente. Feito.

## Fase 2: geracao real

- Integrar Ollama API. Feito atras de fallback mock.
- Criar prompts versionados. Feito.
- Montar contexto com resumo e ultimos trechos. Feito.
- Implementar sorteio de 1 a 3 fragmentos por dia util. Feito.
- Validar resposta antes de salvar. Feito para resposta da LLM.
- Gravar entrada em `entries/YYYY-MM-DD.md`. Feito.
- Atualizar `README.md`. Feito.

## Fase 3: publicacao

- Automatizar `git pull --rebase`. Feito.
- Automatizar `git add`, `commit` e `push`. Feito atras de flags.
- Padronizar mensagem de commit. Feito.
- Impedir commits duplicados no mesmo dia. Feito para escrita local.
- Bloquear publicacao em fins de semana. Feito.

## Fase 4: VPS

- Clonar repo na VPS. Feito.
- Configurar Node.js. Feito.
- Configurar `.env`. Feito.
- Configurar acesso SSH ao GitHub. Feito.
- Criar script de execucao com log e lock. Feito.
- Criar cron de segunda a sexta. Feito.
- Verificar logs. Feito.

## Fase 5: qualidade de vida

- Adicionar lockfile. Feito no script de execucao.
- Adicionar logs estruturados. Parcial: `logs/cron.log` com timestamps.
- Adicionar alerta em caso de falha.
- Criar resumo mensal automatico.
- Publicar leitura via GitHub Pages.
