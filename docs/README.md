# daily-blueprint docs

Esta pasta documenta o processo de criacao do `daily-blueprint`: uma ferramenta
que gera trechos textuais em dias uteis, salva em Markdown e publica esse texto
no GitHub atraves de commits automatizados.

## Objetivo do projeto

Criar um repositorio que funcione como um livro vivo. De segunda a sexta:

1. O job acorda na VPS.
2. O script le o estado atual da narrativa.
3. Uma LLM gera de 1 a 3 microtrechos em portugues.
4. O projeto grava o conteudo em Markdown.
5. Um commit e criado e enviado para a branch principal.

## Principios

- O commit diario deve representar conteudo real.
- O projeto deve publicar apenas em dias uteis.
- O custo de tokens deve ser baixo.
- A automacao deve ser simples de operar em uma VPS.
- O projeto deve falhar com seguranca quando a API ou o Git falharem.
- A documentacao deve acompanhar as decisoes conforme o projeto cresce.

## Documentos

- [Conceito do livro](book-concept.md): premissa, voz e regras editoriais.
- [Arquitetura](architecture.md): desenho tecnico do fluxo.
- [Setup da VPS](setup-vps.md): como preparar o servidor para rodar o job.
- [Prompts e estilo](prompts.md): direcao editorial da geracao.
- [Roadmap](roadmap.md): etapas de implementacao.
- [Decisoes tecnicas](decisions.md): registro das escolhas feitas.
