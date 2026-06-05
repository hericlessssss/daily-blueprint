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
BOOK_TITLE="O Espelho de Segunda a Sexta"
BOOK_LANGUAGE=pt-BR
TIMEZONE=America/Sao_Paulo
PUBLISH_DAYS=1,2,3,4,5
MIN_FRAGMENTS_PER_RUN=1
MAX_FRAGMENTS_PER_RUN=3
GIT_AUTO_COMMIT=true
GIT_PUSH=true
```

O app carrega `.env` automaticamente a partir da raiz do projeto. Variaveis ja
exportadas no ambiente tem prioridade sobre valores do arquivo.

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

No clone real da VPS, a identidade foi configurada assim:

```bash
git config user.name "Hericles Francisco"
git config user.email "hericlessousa@live.com"
```

Sem essa configuracao, `git commit` falha com `Author identity unknown`.

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
- Teste real no clone `~/apps/daily-blueprint` gerou a entrada de `2026-06-05`,
  criou commit e fez push para `origin/main`.
- Script de cron foi testado com `PUBLISH_DAYS=0`, `LLM_PROVIDER=mock` e
  `GIT_AUTO_COMMIT=false`, confirmando log, lock e skip sem escrita.
- Cron real foi instalado com `CRON_TZ=America/Sao_Paulo`.

## Cron inicial

Cron instalado em dias uteis:

```cron
# daily-blueprint:start
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
CRON_TZ=America/Sao_Paulo
17 8 * * 1-5 /home/deploy/apps/daily-blueprint/scripts/run-generate.sh
# daily-blueprint:end
```

Esse exemplo roda de segunda a sexta as 08:17 no horario local configurado no
servidor.

O script `scripts/run-generate.sh` cria `logs/cron.log`, usa lock em
`logs/generate.lock` e evita duas execucoes simultaneas.

## Operacao basica

Comandos que devem existir no projeto:

```bash
npm install
npm run check
scripts/run-generate.sh
```

Para testar sem commitar/pushar, use:

```bash
LLM_PROVIDER=mock GIT_AUTO_COMMIT=false npm run generate
```

Para acompanhar logs:

```bash
tail -f /home/deploy/apps/daily-blueprint/logs/cron.log
```

## Falhas esperadas

- Ollama indisponivel.
- Modelo Ollama nao baixado.
- Push rejeitado por conflito remoto.
- VPS sem permissao SSH no GitHub.
- Entrada do dia ja existente.
- Execucao disparada em fim de semana.

Cada uma dessas falhas deve gerar log claro e impedir commits corrompidos.
