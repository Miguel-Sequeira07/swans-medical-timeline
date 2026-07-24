# Contexto — Pessoa B: Timeline & UX

Cola isto no teu assistente de AI (Claude Code, Codex, etc.) no início do dia,
ou pede-lhe para ler este ficheiro. Contexto geral do projeto em
[`../CLAUDE.md`](../CLAUDE.md) e [`../README.md`](../README.md) — lê primeiro
se ainda não leste.

## A tua fatia do produto

Tudo o que é visual e interativo. Esta é literalmente a razão do desafio
existir — "essa tabela, numa visual que se sente". É o que os juízes veem
nos primeiros 30 segundos, e é o critério de avaliação com mais peso.

## Ficheiros que és dono/a

- `app/src/components/timeline/Timeline.tsx` — o componente central (já
  existe uma versão mínima em lista, o "floor" real ainda está por fazer)
- Qualquer componente de filtro, agrupamento, vista compacta/detalhada,
  export
- `app/src/types/event.ts` — schema partilhado (não mudes sozinho/a, é
  fronteira com a Pessoa A — avisa antes de alterar)

## Ordem de trabalho recomendada

1. **Floor**: enquanto a Pessoa A não tem o parser real ligado à UI, trabalha
   com dados mock que sigam exatamente `MedicalEvent[]` (ver `event.ts`) —
   não bloqueiam um no outro. Assim que o parser real estiver pronto, troca
   os mocks pelos dados reais.
2. A timeline tem de responder em 30 segundos à pergunta "o que aconteceu a
   este cliente?" — isso é literalmente o critério de avaliação nº1
   ("primeira impressão"). Pensa em densidade visual: 80 eventos têm de caber
   sem virar uma parede de texto.
3. Depois do floor: filtros e agrupamento (provider, tipo de medicina, parte
   do corpo, data, keyword) — critério de avaliação valoriza profundidade,
   não quantidade, escolhe bem o que fazes primeiro.
4. Clicar num evento → abrir `event.pdfUrl` (nova aba).
5. Vista compacta (para um slide) vs vista detalhada (para andar com o
   cliente pelo caso) — dois modos de leitura do mesmo dado.
6. Vista "antes/depois" do acidente — depende do `Milestone` que a Pessoa A
   está a construir (tipo `"accident"`). Combina com ela/e como o milestone
   chega até à timeline.
7. Export PDF / PowerPoint — só depois de a timeline em si estar sólida.
8. Responsividade e polish — "ease of use" e "keeper test" são critérios de
   avaliação explícitos: sem instruções complexas, sem fricção.

## Regras que não podes esquecer

- **Nunca hardcode** suposições sobre os dados de amostra (nº de eventos,
  nomes específicos, datas específicas). A timeline tem de aguentar um Excel
  com 5 eventos ou com 200.
- Trata datas em falta/malformadas com cuidado — não deixes a timeline
  partir silenciosamente se um evento vier com data inválida.
- O júri usa a app com as próprias mãos — nada de fluxos que só funcionam
  "se souberes o truque".

## Definição de "pronto" para cada peça

- Timeline: legível com poucos eventos (5) e com muitos (80+), sem scroll
  infinito sem orientação nem sobreposição de texto.
- Filtros/agrupamento: não perdem eventos nem duplicam ao combinar filtros.
- Export: o ficheiro gerado abre e mostra a informação certa (testar
  abrindo, não só "correu sem erro").
