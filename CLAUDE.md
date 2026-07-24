# Contexto do projeto — Medical Timeline (Applied AI Hackathon, Swans)

Lê isto antes de mexer em código. Detalhe completo em [`README.md`](./README.md)
e [`Hackathon Slides July 2026.pdf`](./Hackathon%20Slides%20July%202026.pdf).
Checklist do dia em [`CHECKLIST.md`](./CHECKLIST.md).

## O que estamos a construir

Uma app que recebe um Excel de eventos médicos (um caso de danos pessoais nos
EUA) e produz uma **timeline visual e utilizável** do tratamento, para
advogados usarem com júris, clientes e seguradoras.

Deadline de submissão: **hoje às 17:00**.

## A regra de ouro (não quebrar isto)

A app tem de funcionar com **qualquer** Excel no formato descrito abaixo, não
só com o ficheiro de amostra. Os juízes testam no fim com um caso nunca visto.
**Nunca hardcode** valores da amostra (nomes de providers, tipos de medicina,
datas específicas, etc.) — só a *forma* das colunas é garantida.

## Formato do Excel de input

Uma linha = um encontro médico:

```
Encounter Date | Primary Provider | Facility | Body Parts | Medicine Type | Record Type | Summary | Link To Pdf
```

**Não está no Excel:** a data do acidente. A app tem de permitir ao
utilizador adicioná-la manualmente como marco.

## Ordem de prioridade

1. **Floor** (obrigatório, antes de tudo): carregar o Excel → parse para
   eventos estruturados → renderizar timeline onde cada evento é visível.
2. **Ceiling** (onde se ganha): profundidade em poucas features bem feitas,
   não checklist superficial. Lista completa no `README.md`.

## Schema partilhado — não mudar sem avisar o resto da equipa

`app/src/types/event.ts` define `MedicalEvent`, `Milestone`, `Case`. É a
fronteira entre o trabalho da Pessoa A (dados/AI) e da Pessoa B
(timeline/UX). Ler esse ficheiro antes de escrever qualquer código que toque
em dados.

## Stack

Next.js + React + TypeScript (`app/`), Tailwind CSS, `xlsx` para parsing,
`@google/genai` (Gemini, modelo `gemini-3.6-flash` — **não** o pacote
`@google/generative-ai`, descontinuado, nem `gemini-2.0-flash`, desligado
a 1 jun 2026) para AI, `jspdf`/`pptxgenjs` para export, `localStorage`
para persistência client-side. Deploy no Vercel.

## Idioma: tudo o que o utilizador vê é em inglês

Os utilizadores reais são advogados/júris nos EUA, e os juízes do
hackathon usam a app diretamente — confirmado a testar com uma API key
real que um prompt em português faz o Gemini responder em português, o
que seria inutilizável. Regra: **UI, mensagens de erro, e prompts/output
de AI em inglês, sempre.** Comentários de código, commits e documentação
interna (este ficheiro, README, CHECKLIST, docs/) continuam em português
— é só o que o utilizador final vê que muda.

## Quem faz o quê

- **Pessoa A — Dados & AI**: contexto detalhado em [`docs/pessoa-a-contexto.md`](./docs/pessoa-a-contexto.md)
- **Pessoa B — Timeline & UX**: contexto detalhado em [`docs/pessoa-b-contexto.md`](./docs/pessoa-b-contexto.md)

## Convenções de trabalho

- Commits pequenos e frequentes, push direto para `master` (sem branches
  longas — não há tempo hoje).
- Antes de dar uma feature por fechada, testar com um Excel diferente da
  amostra.
- Deploy cedo no Vercel, iterar em produção.
