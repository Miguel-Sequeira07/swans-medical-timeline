# Checklist do dia — Medical Timeline

Deadline de submissão: **17:00**. Marcar cada item à medida que se avança.
Contexto completo em [`README.md`](./README.md) e [`CLAUDE.md`](./CLAUDE.md).
Contexto individual: [`docs/pessoa-a-contexto.md`](./docs/pessoa-a-contexto.md) ·
[`docs/pessoa-b-contexto.md`](./docs/pessoa-b-contexto.md) — cola no teu
assistente de AI no início do dia.

## 0. Antes de codar (ambos, ~15 min)

- [ ] Colega aceitou o convite do repo: https://github.com/Miguel-Sequeira07/swans-medical-timeline
- [ ] `git clone` local feito por ambos, `cd app && npm install` a correr sem erros
- [ ] Gemini API key obtida e colocada em `app/.env.local` (ver `app/.env.local.example`)
- [ ] Excel de amostra do hackathon (QR "Slides & Excel files") descarregado e guardado localmente para testes
- [ ] Confirmar rápido: schema em `app/src/types/event.ts` serve para os dois — se precisar de mudar, avisar o outro antes de mexer

## Descobertas ao validar com dados reais (5 Excel em `sample-data/`)

- [x] **Bug corrigido:** `Link To Pdf` não é texto com o URL — é a palavra
  "pdf" com um **hyperlink** por baixo da célula. `parse-excel.ts` já lê o
  hyperlink real (`cell.l.Target`), não o texto visível.
- **Linhas sem data existem de verdade** (ex.: "Administrative Record" sem
  `Encounter Date`, 7 casos no ficheiro Caldwell). O parser devolve
  `Date(NaN)` para essas — a timeline (Pessoa B) tem de as mostrar sem
  rebentar (ex. secção "sem data"), não assumir que toda a linha tem data.
- **Escala varia muito**: 49 a 820 eventos por caso nos 5 ficheiros de
  amostra. Testar a timeline com o Garrison (820 linhas) para performance/
  legibilidade, não só com casos pequenos.
- 2 dos 5 ficheiros (`Middleswarth`, `Rogers`) têm links reais para PDFs
  que existem em `sample-data/Medical Records/` — bons para testar
  "clicar num evento → abrir PDF fonte" de ponta a ponta.

## 1. Floor — bloqueia tudo o resto, fazer primeiro

- [x] **Pessoa A** — upload de Excel na UI → `parseExcelFile()` → estado da app
- [x] **Pessoa A** — testado com os 5 Excel de amostra reais (não só dados inventados)
- [ ] **Pessoa B** — `Timeline.tsx` a renderizar a lista de eventos recebida (ainda pode ser visual simples)
- [ ] **Ambos** — fluxo ponta-a-ponta a funcionar: upload → parse → timeline visível, sem hardcode dos dados de amostra
      (falta só a Pessoa B ligar a timeline real — o resto já está feito e em `master`)
- [ ] Primeiro deploy no Vercel feito (mesmo que feio) — deploy cedo, iterar em produção

## 2. Pessoa A — Dados & AI

- [x] Validação/erro claro quando o Excel não segue o formato esperado
- [x] Modelo + UI para adicionar a **data do acidente** / milestones manuais (não vem do Excel)
- [x] AI Q&A sobre o caso (`askCaseQuestion` em `lib/ai.ts`, ligado via `/api/case-qa` e `CaseAssistant.tsx`)
- [x] AI: resumo do tratamento completo (`summarizeTreatment`, ligado via `/api/case-summary`)
- [x] AI: `rephraseSummary` existe e tem rota (`/api/rephrase-summary`), **mas sem botão na UI ainda** —
      faz mais sentido por evento dentro da `Timeline.tsx`, por isso fica para a Pessoa B ligar (ou quem
      tiver tempo) em vez de duplicar UI fora da timeline
- [x] Persistência local — guardar/carregar timelines anteriores (`localStorage`, `useSyncExternalStore`)
- [x] Custo aproximado por caso, medido com dados reais — [`docs/custo-por-caso.md`](./docs/custo-por-caso.md)

## 3. Pessoa B — Timeline & UX

- [ ] Timeline visual real (não lista simples): eixo temporal, densidade de eventos legível
- [ ] Filtros: provider, tipo de medicina, data, keyword
- [ ] Agrupamento: por provider / tipo de medicina / parte do corpo
- [ ] Clicar num evento → abrir `pdfUrl` (o PDF fonte)
- [ ] Vista compacta (overview) vs vista detalhada (walkthrough)
- [ ] Vista "antes/depois" do acidente (usa o milestone da Pessoa A)
- [ ] Export para PDF
- [ ] Export para PowerPoint
- [ ] Responsivo, sem instruções complexas para usar ("ease of use" é critério de avaliação)

## 4. Integração contínua (ambos, o dia todo)

- [ ] Commits pequenos, push frequente para `master`
- [ ] Sem branches longas — merge assim que uma feature funciona
- [ ] Redeploy no Vercel a cada marco importante
- [ ] Testar a app com um Excel **diferente** da amostra antes de dar qualquer feature por fechada (regra de ouro do desafio)

## 5. Antes de submeter (17:00)

- [ ] Link da app **deployed**, não localhost
- [ ] Lista de assumptions (ex.: "assume uma Gemini API key")
- [ ] Nota sobre onde os dados ficam (client-side / localStorage é resposta válida)
- [x] Custo aproximado por caso processado — números reais medidos em
      [`docs/custo-por-caso.md`](./docs/custo-por-caso.md) (~$0,05 a ~$1,00
      por caso, conforme o tamanho)
- [ ] Parágrafo curto: o que construíram e do que se orgulham
- [ ] Testado end-to-end com Excel novo, sem erros no browser
- [ ] Link submetido **antes das 17:00** (quanto mais cedo, mais cedo apresentam)
