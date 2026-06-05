# Setup da VPS

Este documento descreve o plano para rodar o `daily-blueprint` em uma VPS da
Hostinger.

## Dependencias esperadas

- Git
- Node.js LTS
- npm
- Ollama
- Modelo local baixado, inicialmente `qwen3:1.7b`
- Acesso SSH ao GitHub

## Diretorio sugerido no servidor

```text
/opt/daily-blueprint
```

Tambem podemos usar um diretorio dentro do usuario da VPS, como:

```text
/home/<usuario>/apps/daily-blueprint
```

## Variaveis de ambiente

As variaveis devem ficar em um arquivo `.env` no servidor, nunca commitado.

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:1.7b
BOOK_TITLE=Daily Blueprint
BOOK_LANGUAGE=pt-BR
TIMEZONE=America/Sao_Paulo
PUBLISH_DAYS=1,2,3,4,5
MIN_FRAGMENTS_PER_RUN=1
MAX_FRAGMENTS_PER_RUN=3
GIT_AUTO_COMMIT=true
GIT_PUSH=true
```

## GitHub

Para que os commits sejam atribuidos corretamente:

- Configurar `user.name` com o nome publico desejado.
- Configurar `user.email` com um e-mail associado a conta GitHub.
- Fazer commits diretamente na branch default, provavelmente `main`.
- Preferir SSH deploy key ou token com permissao minima.

Exemplo:

```bash
git config user.name "Hericles Francisco"
git config user.email "email-associado-ao-github@example.com"
```

## Ollama

Instalacao e modelo inicial:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen3:1.7b
```

Teste local na VPS:

```bash
curl http://localhost:11434/api/generate -d '{"model":"qwen3:1.7b","prompt":"Escreva uma frase curta em portugues.","stream":false}'
```

Se a VPS tiver pouca memoria, testar `qwen3:0.6b`. Se houver folga e a qualidade
precisar melhorar, testar `qwen3:4b`.

Resultado observado na VPS Hostinger:

- Ollama instalado em `/usr/local`.
- Servico systemd `ollama.service` criado e iniciado.
- API local disponivel em `127.0.0.1:11434`.
- Sem GPU detectada; Ollama roda em modo CPU-only.
- `ollama pull qwen3:1.7b` baixou cerca de 1.4 GB e concluiu com sucesso.
- Teste com `curl /api/generate` respondeu corretamente.
- Duracao observada para uma frase curta: cerca de 16s em CPU.
- A resposta do Qwen pode incluir campo `thinking`; o projeto usa apenas o
  campo `response`.
- Smoke test da aplicacao em `~/daily-blueprint-smoke` passou `npm ci`,
  `npm run check` e `npm run generate` com `GIT_AUTO_COMMIT=false`.
- O smoke test criou `entries/2026-06-05.md` e atualizou `README.md` na copia
  temporaria.

## Cron inicial

Exemplo de job em dias uteis:

```cron
17 8 * * 1-5 cd /opt/daily-blueprint && npm run generate >> logs/cron.log 2>&1
```

Esse exemplo roda de segunda a sexta as 08:17 no horario local configurado no
servidor.

## Operacao basica

Comandos que devem existir no projeto:

```bash
npm install
npm run generate
npm run check
```

Para testar sem commitar/pushar, use:

```bash
LLM_PROVIDER=mock GIT_AUTO_COMMIT=false npm run generate
```

## Falhas esperadas

- Ollama indisponivel.
- Modelo Ollama nao baixado.
- Push rejeitado por conflito remoto.
- VPS sem permissao SSH no GitHub.
- Entrada do dia ja existente.
- Execucao disparada em fim de semana.

Cada uma dessas falhas deve gerar log claro e impedir commits corrompidos.
