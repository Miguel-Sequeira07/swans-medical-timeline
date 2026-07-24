# Contexto — Pessoa A: Dados & AI

Cola isto no teu assistente de AI (Claude Code, Codex, etc.) no início do dia,
ou pede-lhe para ler este ficheiro. Contexto geral do projeto em
[`../CLAUDE.md`](../CLAUDE.md) e [`../README.md`](../README.md) — lê primeiro
se ainda não leste.

## A tua fatia do produto

Tudo o que entra dados no sistema e tudo o que usa AI. Se falhar, a Pessoa B
não tem o que mostrar na timeline — por isso o **floor é a tua prioridade
absoluta** antes de qualquer feature de AI.

## Ficheiros que és dono/a

- `app/src/lib/parse-excel.ts` — Excel → `MedicalEvent[]` (já existe um
  parser inicial, valida/robustece)
- `app/src/lib/ai.ts` — integração Gemini (`askCaseQuestion`,
  `summarizeTreatment` já existem como stubs, por testar e ligar à UI)
- `app/src/types/event.ts` — schema partilhado (não mudes sozinho/a, é
  fronteira com a Pessoa B — avisa antes de alterar)
- Componentes de upload, formulário de milestone/data do acidente, e
  qualquer painel de AI (Q&A, resumo, rephrase) na UI

## Ordem de trabalho recomendada

1. **Floor**: componente de upload de ficheiro → chama `parseExcelFile()` →
   guarda o resultado no estado da app, de forma que a Pessoa B o consiga
   consumir (`Case.events`). Testa com o Excel de amostra real do hackathon
   (QR code "Slides & Excel files" nos slides), não só com dados inventados.
2. Validação: o que acontece se o Excel não tiver as colunas certas, tiver
   linhas vazias, datas em formatos diferentes? Erro claro para o utilizador,
   nunca crash silencioso.
3. Data do acidente / milestones manuais: não vem do Excel. Cria o modelo
   (`Milestone` já existe em `event.ts`) e uma UI simples para adicionar.
   A Pessoa B vai usar isto para a vista "antes/depois".
4. Gemini: obter API key em https://aistudio.google.com/apikey, colocar em
   `app/.env.local` (`GOOGLE_GENERATIVE_AI_API_KEY=...`, nunca committar).
   Testar `askCaseQuestion` e `summarizeTreatment` com dados reais.
5. Ligar as funções de AI à UI: um campo de pergunta livre (Q&A), um botão
   "gerar resumo do tratamento", e uma forma de reescrever um summary
   (manual ou com AI) — decidir com a Pessoa B onde isto vive na interface.
6. Persistência local: guardar/carregar casos anteriores via `localStorage`
   (client-side é uma resposta válida para a submissão, documentar isso).
7. Custo aproximado por caso: contar tokens/chamadas Gemini típicas por caso
   e estimar custo — é um item obrigatório da submissão final.

## Regras que não podes esquecer

- **Nunca hardcode** valores do Excel de amostra (nomes, datas, providers).
  A app é testada no fim com um Excel diferente.
- Dados médicos são sensíveis — documenta claramente onde ficam guardados
  (é suposto responder "client-side, perdido ao refresh" se for esse o caso;
  é uma resposta perfeitamente válida, só tem de estar documentada).
- Se mudares `event.ts`, avisa a Pessoa B imediatamente — o componente de
  timeline dela depende diretamente desse schema.

## Definição de "pronto" para cada peça

- Upload + parse: funciona com o Excel de amostra E com um Excel modificado
  manualmente (linhas a menos, ordem de colunas igual mas valores diferentes).
- AI: respostas relevantes e factuais, sem inventar datas que não existem
  nos dados (checar isto manualmente antes de dar por fechado).
- Milestone: a data do acidente sobrevive a um reload se a persistência
  estiver ligada; caso contrário, está claro na UI que é só da sessão.
