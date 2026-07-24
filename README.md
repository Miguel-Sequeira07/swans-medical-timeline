# Medical Timeline — Applied AI Hackathon (Swans, 24 Jul 2026)

App que digere um Excel de eventos médicos (casos de danos pessoais) e produz uma
**timeline visual e utilizável** do tratamento do cliente, para advogados usarem
com júris, clientes e seguradoras.

Contexto completo do desafio: [`Hackathon Slides July 2026.pdf`](./Hackathon%20Slides%20July%202026.pdf).

- **Deadline de submissão:** hoje, **17:00**
- **Top 5 apresentam:** 18:00 (ordem = ordem de submissão)
- **Vencedores:** ~19:00

## O desafio em 1 frase

Input: um Excel (uma linha = um encontro médico, colunas: `Encounter Date`,
`Primary Provider`, `Facility`, `Body Parts`, `Medicine Type`, `Record Type`,
`Summary`, `Link To Pdf`).

Output: uma timeline visual do tratamento.

**Regra de ouro:** a app tem de funcionar com **qualquer** Excel neste formato —
os juízes testam com um caso nunca visto. Nada de hardcode aos dados de amostra.

**Não** está no Excel: a data do acidente. A app deve permitir ao utilizador
adicioná-la manualmente como marco.

## Floor (mínimo obrigatório)

1. Carregar o Excel fornecido
2. Parse para eventos estruturados
3. Renderizar uma timeline clara onde cada evento é visível

Isto tem de estar feito e robusto **antes** de qualquer feature extra.

## Ceiling (onde se ganha) — backlog de features

Por ordem de valor esperado (ver critérios de avaliação abaixo):

- [ ] Marcar data do acidente / milestones manuais
- [ ] Filtrar e pesquisar (provider, tipo de medicina, data, keyword)
- [ ] Agrupar eventos (por provider, tipo de medicina, parte do corpo)
- [ ] Clicar num evento → abrir o PDF fonte (`Link To Pdf`)
- [ ] Vista compacta (overview para slide) + vista detalhada (walkthrough)
- [ ] Vista "antes/depois" do acidente
- [ ] Flag automática/manual de datas-chave (cirurgia, MRI, alta)
- [ ] AI: Q&A sobre o caso ("quando foi o primeiro MRI?", "quantas sessões de fisio?")
- [ ] AI: gerar resumo médico do tratamento completo
- [ ] AI: reescrever/editar um summary (manual ou com AI)
- [ ] Exportar para PDF e PowerPoint
- [ ] Guardar/aceder a timelines anteriores (persistência local)

Não é preciso fazer tudo — critério de avaliação valoriza **profundidade**
sobre checklist superficial. Escolham menos features e façam-nas bem.

## Stack

- **Next.js + React + TypeScript** (`app/`), Tailwind CSS
- **Gemini API** para as features de AI
- Parsing de Excel: `xlsx` (SheetJS), no cliente
- Export: `jspdf` (PDF) / `pptxgenjs` (PowerPoint)
- Persistência: `localStorage` (client-side, simples e válido para o desafio —
  documentar isto na submissão)
- Deploy: Vercel

## Estrutura

```
app/                     ← projeto Next.js
  src/
    types/event.ts       ← schema partilhado (fonte da verdade dos dados)
    lib/parse-excel.ts   ← Excel → MedicalEvent[]
    lib/ai.ts            ← integração Gemini
    components/timeline/ ← componente principal da timeline
    app/                 ← rotas / páginas
```

## Divisão de trabalho (2 pessoas)

Divisão por **domínio de feature** (não frontend/backend puro), para que cada
um consiga demonstrar uma fatia vertical completa e funcional a qualquer
momento do dia — importante porque a submissão é "o que estiver pronto às 17:00".

### Fase 0 — em conjunto (~20 min)
Alinhar o schema em `app/src/types/event.ts` (já criado como ponto de partida)
e o formato do Excel de amostra. Depois de acordado, não mexer mais no schema
sem avisar o outro.

### Pessoa A — Dados & AI
- Upload + parsing do Excel (`lib/parse-excel.ts`), validação, tratamento de
  ficheiros fora do formato esperado
- Modelo e UI para adicionar a data do acidente / milestones manuais
- Integração Gemini (`lib/ai.ts`): Q&A, resumo do tratamento, rephrase de summary
- Persistência local (guardar/carregar timelines anteriores)
- Cálculo de custo aproximado por caso (para a submissão)

### Pessoa B — Timeline & UX
- Componente de timeline (o entregável central — prioridade #1 do floor)
- Filtros, pesquisa, agrupamento
- Vista compacta vs detalhada, vista antes/depois
- Click num evento → abrir PDF fonte
- Export PDF / PowerPoint
- Polish visual, responsividade, "keeper test"

### Integração contínua
Commits pequenos e frequentes na `main` (ou branches curtas tipo
`feat/timeline`, `feat/ai-qa`), merge assim que algo funciona — sem tempo
para branches longas hoje.

## Checklist de submissão (17:00)

- [ ] Link da app deployed (não localhost) — Vercel/Netlify
- [ ] Lista de assumptions (ex: "assume uma Gemini API key")
- [ ] Nota sobre onde os dados ficam (client-side / localStorage é válido)
- [ ] Custo aproximado por caso processado
- [ ] Parágrafo curto: o que construíram e do que se orgulham
- [ ] Testar com um Excel diferente da amostra antes de submeter (regra de ouro)

## Estado do projeto (atualizar ao longo do dia)

**Já feito:**
- Repo criado e no GitHub: https://github.com/Miguel-Sequeira07/swans-medical-timeline-hackathon
- Scaffold Next.js + TypeScript + Tailwind, a compilar sem erros (`npx tsc --noEmit`)
- Dependências instaladas: `xlsx`, `@google/generative-ai`, `jspdf`, `pptxgenjs`
- Schema partilhado em `src/types/event.ts` (`MedicalEvent`, `Milestone`, `Case`)
- `src/lib/parse-excel.ts` — parser Excel → `MedicalEvent[]` (funcional, por validar com Excel real)
- `src/lib/ai.ts` — stub Gemini com `askCaseQuestion` e `summarizeTreatment` (por testar, precisa de API key)
- `src/components/timeline/Timeline.tsx` — timeline mínima em lista (ponto de partida, não é o floor final)

**Por fazer a seguir (ordem sugerida):**
1. Obter/gerar uma Gemini API key e colocar em `app/.env.local`
2. Confirmar o Excel de amostra do hackathon (QR "Slides & Excel files" nos slides) e testar o parser com ele
3. Pessoa A: ligar upload de ficheiro → `parseExcelFile` → estado da app
4. Pessoa B: construir a timeline real (visual, não lista simples) a partir do `Timeline.tsx`
5. Só depois: features do "ceiling" (ver backlog acima), escolher poucas e bem feitas
6. Deploy no Vercel assim que houver algo a mostrar (deploy cedo, iterar em produção)

## Setup local

```bash
cd app
npm install
npm run dev
```

Variável de ambiente necessária (`app/.env.local`, não committar):

```
GOOGLE_GENERATIVE_AI_API_KEY=...
```
