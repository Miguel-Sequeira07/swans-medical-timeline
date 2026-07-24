# Custo aproximado por caso

Medido a 24 jul 2026, com uma chave real do Gemini (`gemini-3.6-flash`,
`thinkingLevel: minimal`), preços oficiais: $1.50 / 1M tokens de input,
$7.50 / 1M tokens de output. Não é estimativa por caracteres — são os
`usageMetadata` reais devolvidos pela API para os 5 Excel de amostra em
`sample-data/`.

## Números medidos

| Caso | Linhas | Tokens de input (contexto do caso) | Custo de 1 chamada (resumo ou pergunta) |
|---|---|---|---|
| Middleswarth (menor) | 49 | ~7.063 | ~$0,014 |
| Garrison (maior) | 820 | ~162.969 | ~$0,245–0,247 |

O output é sempre pequeno (350-450 tokens para um resumo, 40-50 para uma
resposta factual) — **o custo é quase todo o input**, ou seja, quase todo
o custo é proporcional ao tamanho do caso (nº de linhas × tamanho dos
Summary), não ao que se pergunta.

## Cenário de uso típico (1 resumo + 3 perguntas)

| Caso | Custo total |
|---|---|
| Caso pequeno (~49 eventos) | ~$0,05 |
| Caso grande (~820 eventos) | ~$1,00 |

**Para a submissão**: "Approximate cost to run one case: roughly
$0.05–$1.00 depending on case size (49–820 medical events in our
samples), for one AI summary plus a few follow-up questions."

## Limitação conhecida (documentar como assumption, não corrigir hoje)

Cada pergunta de Q&A reenvia o **contexto completo do caso** (todos os
eventos), porque é assim que `lib/ai.ts` está implementado agora — não há
cache de contexto nem RAG/filtragem. Isto significa que o custo cresce
linearmente com o número de perguntas feitas: 10 perguntas num caso
grande custam ~10× o custo de uma única chamada (~$2,45), não uma fração
disso. Para o caso de uso real (um advogado a explorar um caso), isto é
aceitável — mas é a primeira coisa a otimizar (context caching da API
Gemini, ou só enviar os eventos relevantes à pergunta) se sobrar tempo.
