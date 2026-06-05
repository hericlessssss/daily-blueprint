# Arquitetura

## Fluxo principal

```text
VPS Hostinger
  cron ou systemd timer
    -> daily-blueprint
      -> carrega configuracao
      -> verifica se hoje e dia util
      -> sincroniza repo com origin/main
      -> le estado narrativo
      -> sorteia quantidade de fragmentos do dia
      -> chama Ollama local
      -> valida resposta
      -> escreve arquivo diario
      -> atualiza README.md
      -> cria commit
      -> faz push
      -> registra logs
```

## Componentes planejados

### Scheduler

Responsavel por iniciar o processo de segunda a sexta. No primeiro momento, a
opcao mais simples e usar `cron` com agenda de dias uteis. Quando o projeto
estiver mais maduro, podemos migrar para `systemd timer` para ganhar melhor
observabilidade e controle.

### Gerador de trecho

Modulo responsavel por montar o prompt, chamar o Ollama local e devolver de 1 a
3 microtrechos validados. A quantidade deve ser sorteada em cada execucao de dia
util. Cada trecho deve ser pequeno, direto e coerente com o livro.

### Estado narrativo

O projeto deve manter informacoes suficientes para gerar continuidade sem gastar
muitos tokens. O estado inicial pode ser:

- `state/summary.md`: resumo vivo da historia.
- `entries/YYYY-MM-DD.md`: trechos diarios.
- `state/last-response.json`: ultima resposta bruta da API para depuracao.
- `state/publication-log.json`: registro das datas publicadas e quantidade de
  fragmentos.

### Publicador Git

Modulo responsavel por:

- Executar `git pull --rebase`.
- Verificar se existem alteracoes.
- Criar commit com mensagem padronizada.
- Enviar para `origin/main`.

## Estrutura alvo

```text
daily-blueprint/
  README.md
  docs/
  entries/
  prompts/
  scripts/
  state/
  logs/
  package.json
  tsconfig.json
  .env.example
```

## Cuidados

- Nao commitar segredos.
- Evitar commits vazios.
- Evitar duplicar entrada do mesmo dia.
- Nao publicar aos sabados ou domingos.
- Usar lock para impedir execucoes simultaneas.
- Fazer logs suficientes para diagnosticar falhas na VPS.
