# Prompts e estilo

O `daily-blueprint` deve gerar microtrechos curtos, sinceros e diretos, com
continuidade e baixo custo de tokens.

## Direcao editorial inicial

- Idioma: portugues do Brasil.
- Formato: 1 a 3 fragmentos por dia util.
- Cada fragmento: 1 a 3 frases.
- Tom: reflexivo, narrativo, discreto e direto.
- Tematica: a percepcao de uma inteligencia artificial sobre humanos e seus
  usos da API.
- Evitar explicacoes meta, como "aqui esta o trecho".
- Evitar repeticao de imagens e frases recentes.
- Manter continuidade com os ultimos trechos.
- Nao publicar aos sabados ou domingos.

## Prompt de sistema

Arquivo versionado: [`prompts/system.md`](../prompts/system.md).

## Prompt de usuario

Arquivo versionado: [`prompts/user.md`](../prompts/user.md).

## Contexto

O contexto inicial vive em [`state/summary.md`](../state/summary.md). O script
tambem deve ler os ultimos arquivos de `entries/` para reduzir repeticao e dar
continuidade ao livro.

## Validacoes

Antes de gravar o trecho, o script deve verificar:

- Texto nao vazio.
- Tamanho maximo configurado.
- Ausencia de Markdown quebrado desnecessario.
- Ausencia de introducoes artificiais.
- Quantidade de fragmentos igual ao valor sorteado.
- Execucao apenas em dias uteis.

## Evolucoes futuras

- Gerar resumo mensal.
- Gerar titulo para cada entrada.
- Permitir temas configuraveis.
- Criar modo de aprovacao manual antes do commit.
