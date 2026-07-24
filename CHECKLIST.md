# Checklist do dia — Medical Timeline

Deadline de submissão: **17:00**. Marcar cada item à medida que se avança.
Contexto completo em [`README.md`](./README.md).

## 0. Antes de codar (ambos, ~15 min)

- [ ] Colega aceitou o convite do repo: https://github.com/Miguel-Sequeira07/swans-medical-timeline
- [ ] `git clone` local feito por ambos, `cd app && npm install` a correr sem erros
- [ ] Gemini API key obtida e colocada em `app/.env.local` (ver `app/.env.local.example`)
- [ ] Excel de amostra do hackathon (QR "Slides & Excel files") descarregado e guardado localmente para testes
- [ ] Confirmar rápido: schema em `app/src/types/event.ts` serve para os dois — se precisar de mudar, avisar o outro antes de mexer

## 1. Floor — bloqueia tudo o resto, fazer primeiro

- [ ] **Pessoa A** — upload de Excel na UI → `parseExcelFile()` → estado da app
- [ ] **Pessoa A** — testado com o Excel de amostra real (não só dados inventados)
- [ ] **Pessoa B** — `Timeline.tsx` a renderizar a lista de eventos recebida (ainda pode ser visual simples)
- [ ] **Ambos** — fluxo ponta-a-ponta a funcionar: upload → parse → timeline visível, sem hardcode dos dados de amostra
- [ ] Primeiro deploy no Vercel feito (mesmo que feio) — deploy cedo, iterar em produção

## 2. Pessoa A — Dados & AI

- [ ] Validação/erro claro quando o Excel não segue o formato esperado
- [ ] Modelo + UI para adicionar a **data do acidente** / milestones manuais (não vem do Excel)
- [ ] AI Q&A sobre o caso (`askCaseQuestion` já existe em `lib/ai.ts` — ligar à UI)
- [ ] AI: resumo do tratamento completo (`summarizeTreatment` — ligar à UI)
- [ ] AI: reescrever/editar um summary (manual ou com AI)
- [ ] Persistência local — guardar/carregar timelines anteriores (`localStorage`)
- [ ] Calcular custo aproximado por caso (tokens Gemini × preço) — precisa para a submissão

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
- [ ] Custo aproximado por caso processado
- [ ] Parágrafo curto: o que construíram e do que se orgulham
- [ ] Testado end-to-end com Excel novo, sem erros no browser
- [ ] Link submetido **antes das 17:00** (quanto mais cedo, mais cedo apresentam)
