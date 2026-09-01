# ACEx — Analisador de Padrões e Inconsistências em Imagens Geradas por IA

Documento de **Engenharia de Requisitos** do protótipo de software do projeto de
pesquisa *"Análise de padrões e inconsistência para identificação de imagens
geradas por IA"* (Centro Universitário Fundação Santo André, 2026).

Este README existe para **travar o escopo do software**. Tudo que não estiver
listado em "Requisitos Funcionais" está fora do escopo desta entrega, mesmo que
seja tecnicamente interessante. Ver a seção [Fora de escopo](#fora-de-escopo).

---

## 1. Contexto em uma frase

O software é um **instrumento de coleta e apoio ao experimento**, não um produto
comercial de detecção de deepfakes. Ele existe para responder à pergunta de
pesquisa: *um grupo de estudantes assistido pela ferramenta acerta mais do que um
grupo que usa só a percepção visual?*

Consequência direta de projeto: **prioridade é clareza da evidência exibida e
padronização das condições do teste**, não acurácia de estado-da-arte.

## 2. Objetivo do software (o que ele precisa fazer)

Receber uma imagem, executar três análises técnicas independentes (metadados
EXIF, padrões de compressão, Error Level Analysis) e apresentar os indícios de
forma compreensível por um estudante de ensino médio, sem emitir veredito
automático de "verdadeiro/falso".

## 3. Atores

| Ator | Descrição | Interage com |
|---|---|---|
| **Participante** | Estudante do ensino médio do Grupo B (com ferramenta). Uso pontual, sem cadastro. | RF-01 a RF-08 |
| **Aplicador** | Integrante da equipe do projeto que conduz a sessão em sala. | RF-09, RF-10 |
| **Pesquisador** | Integrante que faz curadoria do dataset e a análise estatística posterior. | RF-09 a RF-12 |

Não existe ator "administrador", "usuário cadastrado" ou "cliente".

## 4. Escopo

### 4.1 Dentro do escopo

- Aplicação web de página única, uso local ou em rede da escola.
- Análise de **uma imagem por vez**, formatos JPEG e PNG.
- Três módulos de análise: EXIF, compressão, ELA.
- Exibição didática dos indícios.
- Exportação dos resultados da sessão para análise estatística.

### 4.2 Fora de escopo

Itens abaixo **não devem ser implementados** nesta entrega. Estão listados
explicitamente porque foram identificados como desvios de escopo:

| Item fora de escopo | Por que |
|---|---|
| Treinar/embarcar uma CNN classificadora | A CNN aparece na fundamentação teórica (Nagm et al., 2024) como referência bibliográfica, **não** como objetivo específico do projeto. Os objetivos 1 e 4 falam em metadados, compressão e ELA. |
| Veredito automático "É IA / Não é IA" | O experimento mede o julgamento **humano assistido**. Um veredito automático anula a variável medida e invalida a comparação entre grupos. |
| Análise de vídeo ou áudio | Deepfake de vídeo/áudio é citado na introdução como contexto estatístico. O objeto de estudo é imagem estática. |
| Login, cadastro, perfis, histórico de usuário | Participação é anônima por exigência do Termo de Consentimento. Identificar usuário é risco ético, não funcionalidade. |
| Banco de dados relacional / backend com persistência de contas | Não há dado de usuário a persistir. Resultados saem em arquivo. |
| Análise em lote / API pública / "validação em larga escala" | O objetivo 2 pede **avaliar o potencial** de validação em larga escala (análise argumentativa no relatório), não **construir** a infraestrutura. |
| Detecção de *copy-move* por correspondência de blocos | Citado na introdução como caracterização do problema. Não consta nos objetivos específicos. |
| Verificação de proveniência (C2PA / assinatura criptográfica) | England et al. (2020) é discussão teórica sobre o futuro da área, não requisito. |
| Aplicativo mobile nativo | A metodologia prevê "site ou aplicação simples". Web responsiva atende. |
| Comparação com serviços externos de detecção | Introduz dependência de rede e variável não controlada no experimento. |

Regra de decisão para dúvidas futuras: *se o item não puder ser rastreado a um
dos quatro objetivos específicos da seção 5, ele está fora.*

## 5. Rastreabilidade — objetivos específicos do projeto

| ID | Objetivo específico (texto do projeto) | Requisitos que o atendem |
|---|---|---|
| **OE-1** | Implementar algoritmos de extração e análise de metadados e padrões de compressão para identificar assinaturas digitais de edição por IA | RF-02, RF-03, RF-04 |
| **OE-2** | Avaliar o impacto de ferramentas de verificação na mitigação de desinformação | RF-11, RF-12 (fornecem dados; a avaliação é textual, no relatório) |
| **OE-3** | Testes comparativos de acurácia entre software e discernimento humano | RF-09, RF-10, RF-11, RF-12 |
| **OE-4** | Investigar limitações do ELA frente a modelos generativos de alta fidelidade | RF-05, RF-06, RF-12 |

Todo requisito funcional abaixo aponta para pelo menos um OE. Requisito órfão =
escopo indevido.

---

## 6. Requisitos Funcionais

Formato: **RF-nn — Título** / descrição / entrada / saída / critério de aceite /
prioridade MoSCoW / OE atendido.

### RF-01 — Submissão de imagem
O sistema deve permitir que o Participante envie um arquivo de imagem para
análise, por seleção de arquivo ou arrastar-e-soltar.
- Entrada: arquivo `.jpg`, `.jpeg` ou `.png`, até 20 MB.
- Saída: imagem carregada e exibida em pré-visualização.
- Aceite: arquivo válido é aceito e pré-visualizado em até 3 s; arquivo de tipo
  ou tamanho inválido é rejeitado com mensagem explicando o motivo.
- Prioridade: **Must** · OE-1

### RF-02 — Extração de metadados EXIF
O sistema deve extrair e listar os campos EXIF presentes no arquivo.
- Entrada: imagem submetida.
- Saída: tabela chave/valor com, no mínimo: fabricante e modelo da câmera, data
  de captura, dimensões, abertura, ISO, tempo de exposição, GPS (se houver),
  campo `Software`.
- Aceite: para uma imagem de referência com EXIF conhecido, todos os campos da
  lista mínima presentes no arquivo são exibidos com valor correto.
- Prioridade: **Must** · OE-1

### RF-03 — Sinalização de ausência ou anomalia de metadados
O sistema deve indicar explicitamente quando o bloco EXIF estiver ausente,
incompleto ou contiver marcas de software de geração/edição.
- Entrada: EXIF extraído em RF-02.
- Saída: alerta classificado em três níveis textuais — *sem indício*,
  *atenção*, *indício forte* — com a justificativa em linguagem simples
  (ex.: "não há dados de câmera neste arquivo").
- Aceite: imagem sem EXIF → *atenção*; imagem com campo `Software` contendo nome
  de ferramenta de IA ou de edição → *indício forte*; foto de câmera íntegra →
  *sem indício*.
- Nota: o texto deve deixar claro que ausência de EXIF **não prova** geração por
  IA (redes sociais removem metadados).
- Prioridade: **Must** · OE-1

### RF-04 — Análise de padrões de compressão
O sistema deve analisar a estrutura de compressão do arquivo JPEG e apresentar os
indicadores obtidos.
- Entrada: imagem JPEG submetida.
- Saída: tabelas de quantização, fator de qualidade estimado, subamostragem de
  croma, presença de assinatura de recompressão múltipla.
- Aceite: para uma imagem salva em qualidade conhecida, o fator de qualidade
  estimado fica dentro de ±5 pontos do valor real.
- Observação: para PNG, o sistema deve informar que a análise não se aplica, em
  vez de exibir campos vazios.
- Prioridade: **Must** · OE-1

### RF-05 — Geração do mapa ELA
O sistema deve gerar e exibir o mapa de Error Level Analysis da imagem.
- Entrada: imagem submetida; qualidade de recompressão (padrão 90).
- Saída: imagem ELA renderizada ao lado da original.
- Aceite: o mapa é gerado em até 5 s para imagem de até 12 MP e é visualmente
  reproduzível entre execuções com os mesmos parâmetros.
- Prioridade: **Must** · OE-4

### RF-06 — Ajuste de parâmetros do ELA
O sistema deve permitir ajustar a qualidade de recompressão e o fator de
amplificação do mapa ELA.
- Entrada: qualidade (50–100), amplificação (1–50).
- Saída: mapa ELA regerado com os novos parâmetros.
- Aceite: alterar um parâmetro atualiza o mapa sem exigir novo envio do arquivo.
- Justificativa: o OE-4 exige investigar o comportamento do ELA; parâmetro fixo
  impede a investigação.
- Prioridade: **Should** · OE-4

### RF-07 — Painel consolidado de indícios
O sistema deve apresentar as três análises em uma única tela, cada uma com seu
nível de indício e sua explicação.
- Entrada: resultados de RF-02 a RF-06.
- Saída: painel com três blocos (EXIF, Compressão, ELA), cada um com nível
  (*sem indício* / *atenção* / *indício forte*) e texto explicativo.
- Aceite: nenhum ponto da tela exibe conclusão global do tipo "esta imagem é
  gerada por IA"; a decisão permanece com o Participante.
- Prioridade: **Must** · OE-3

### RF-08 — Camada explicativa didática
Cada indicador exibido deve ter um texto curto de apoio, acessível por ícone ou
seção expansível, explicando o que aquele dado significa e qual sua limitação.
- Entrada: indicador exibido.
- Saída: texto de 1–3 frases, linguagem de ensino médio, sem jargão não
  explicado.
- Aceite: todos os indicadores de RF-02, RF-04 e RF-05 possuem texto de apoio;
  nenhum texto excede 40 palavras.
- Prioridade: **Must** · OE-3

### RF-09 — Carga do conjunto padronizado de imagens
O sistema deve permitir ao Aplicador carregar previamente o conjunto de 20
imagens do experimento (10 reais, 10 sintéticas), identificadas por código.
- Entrada: pasta ou lista de arquivos com nomenclatura `IMG-01` a `IMG-20`.
- Saída: conjunto disponível para seleção durante a sessão.
- Aceite: as 20 imagens ficam acessíveis por código; o gabarito real/sintética
  **não** é visível ao Participante em nenhum momento da interface.
- Prioridade: **Must** · OE-3

### RF-10 — Registro da classificação do Participante
O sistema deve registrar, para cada imagem avaliada, a classificação escolhida
pelo Participante e o tempo gasto.
- Entrada: código do participante (anônimo, ex.: `B-07`), código da imagem,
  escolha (*real* / *artificial*), timestamp de início e de resposta.
- Saída: registro de resposta armazenado na sessão.
- Aceite: registro contém os cinco campos; nenhum dado pessoal é solicitado ou
  gravado.
- Prioridade: **Must** · OE-3

### RF-11 — Exportação dos dados da sessão
O sistema deve exportar todas as respostas da sessão em formato tabular aberto.
- Entrada: sessão encerrada pelo Aplicador.
- Saída: arquivo `.csv` com colunas: `participante`, `grupo`, `imagem`,
  `resposta`, `gabarito`, `acerto`, `tempo_segundos`.
- Aceite: o arquivo abre corretamente em planilha e em Python/pandas, com
  codificação UTF-8 e separador documentado.
- Prioridade: **Must** · OE-2, OE-3

### RF-12 — Exportação do laudo técnico da imagem
O sistema deve permitir exportar, para uma imagem analisada, um relatório com
todos os indicadores brutos coletados.
- Entrada: imagem analisada.
- Saída: arquivo `.json` (dados) e/ou `.pdf` (leitura) contendo EXIF completo,
  métricas de compressão, parâmetros e estatísticas do ELA.
- Aceite: o JSON é válido e contém todos os campos exibidos na interface, sem
  perda.
- Justificativa: alimenta a análise das limitações do ELA (OE-4) e a discussão
  sobre escalabilidade (OE-2).
- Prioridade: **Should** · OE-2, OE-4

---

## 7. Requisitos Não Funcionais

| ID | Requisito | Critério verificável |
|---|---|---|
| RNF-01 | **Desempenho** — análise completa de uma imagem | ≤ 5 s para imagem de até 12 MP em notebook comum da equipe |
| RNF-02 | **Operação offline** — a sessão na escola não pode depender de internet | Todas as funções de RF-01 a RF-12 operam sem acesso externo |
| RNF-03 | **Privacidade** — nenhuma imagem ou resposta sai do equipamento local | Ausência de chamadas de rede a terceiros; verificável por inspeção |
| RNF-04 | **Anonimato** — conformidade com o Termo de Consentimento | Nenhum campo de nome, e-mail, matrícula ou IP é coletado |
| RNF-05 | **Usabilidade** — utilizável por estudante do ensino médio sem treino | Participante conclui a análise de uma imagem sem intervenção do Aplicador |
| RNF-06 | **Compatibilidade** | Chrome e Firefox atualizados, resolução ≥ 1280×720 |
| RNF-07 | **Reprodutibilidade** — mesma imagem e parâmetros geram o mesmo resultado | Duas execuções produzem laudos JSON idênticos |
| RNF-08 | **Neutralidade** — a interface não induz a resposta | Revisão da equipe confirma ausência de veredito, ranking ou "score de IA" |
| RNF-09 | **Acessibilidade mínima** | Contraste adequado; textos legíveis em projeção |
| RNF-10 | **Instalação** | Executável/servível em ≤ 10 min por um integrante seguindo o passo a passo |

## 8. Casos de uso principais

**CDU-01 — Analisar imagem (Participante)**
1. Participante seleciona a imagem do código indicado pelo Aplicador. `RF-09`
2. Sistema executa EXIF, compressão e ELA. `RF-02, RF-04, RF-05`
3. Sistema exibe o painel de indícios com explicações. `RF-07, RF-08`
4. Participante classifica a imagem como real ou artificial. `RF-10`
5. Sistema registra a resposta e o tempo. `RF-10`

**CDU-02 — Preparar sessão (Aplicador)**
1. Aplicador carrega o conjunto de 20 imagens com gabarito. `RF-09`
2. Aplicador define os códigos anônimos dos participantes e o grupo (A/B). `RF-10`
3. Sistema disponibiliza a sessão.

**CDU-03 — Encerrar e exportar (Aplicador / Pesquisador)**
1. Aplicador encerra a sessão. `RF-11`
2. Sistema gera o CSV consolidado. `RF-11`
3. Pesquisador exporta os laudos técnicos das imagens de interesse. `RF-12`

Fluxos de exceção: arquivo inválido (RF-01), imagem PNG na análise de compressão
(RF-04), imagem sem EXIF (RF-03) — todos tratados com mensagem explicativa, nunca
com falha silenciosa.

## 9. Priorização (MoSCoW)

- **Must** — RF-01, RF-02, RF-03, RF-04, RF-05, RF-07, RF-08, RF-09, RF-10, RF-11
  → conjunto mínimo sem o qual o experimento não pode ser aplicado.
- **Should** — RF-06, RF-12 → necessários para a investigação do OE-4 e para a
  discussão do OE-2; entregar após o conjunto Must estar estável.
- **Could** — nenhum nesta entrega.
- **Won't** — todos os itens da seção 4.2.

## 10. Entregáveis por marco do cronograma

| Marco (cronograma do projeto) | Entregável de software |
|---|---|
| Desenvolvimento da aplicação | RF-01 a RF-05 funcionando isoladamente |
| Ajustes e melhorias (app) | RF-06 a RF-08; revisão de RNF-05 e RNF-08 |
| Apresentação em escola parceira | Build congelada com todos os *Must*; RF-09, RF-10 validados em ensaio |
| Execução e bateria de testes | Coleta real; RF-11 exportando dados válidos |
| Análise dos resultados | RF-12 alimentando a análise estatística |
| Montagem da apresentação / SAPex | Congelamento de código; nenhuma nova função |

## 11. Riscos de requisito

| Risco | Impacto | Mitigação |
|---|---|---|
| Reintrodução de CNN / veredito automático | Invalida o desenho experimental (OE-3) | Item marcado *Won't*; qualquer proposta exige rastreio a um OE |
| ELA inconclusivo em imagens generativas modernas | Pode parecer "falha do software" | É **resultado esperado e objeto do OE-4**; deve ser registrado, não corrigido |
| Imagens do dataset com EXIF removido por redes sociais | Falso indício de IA | Curadoria com arquivos originais; RF-03 exibe a ressalva |
| Ferramenta induzindo a resposta | Enviesa o Grupo B | RNF-08 + revisão de texto antes do congelamento |
| Parceria escolar não formalizada a tempo | Bloqueia coleta | Ensaio interno com a própria turma como plano B |

## 12. Estrutura do repositório

```
acex/
├─ README.md                        # este documento (requisitos)
├─ Projeto Acadêmico de Pesquisa.md # texto do projeto (fonte original)
├─ latex/
│  ├─ projeto-pesquisa.tex          # arquivo mestre: preâmbulo + ordem
│  ├─ build.ps1                     # compilação manual / modo -Watch
│  ├─ secoes/                       # uma seção por arquivo (ver abaixo)
│  ├─ figuras/                      # fig01-parceria.png ... fig20-*.png
│  └─ build/                        # gerado; não versionar
└─ docs/                            # material de apoio
```

### Divisão do documento LaTeX

O texto está quebrado em um arquivo por seção, dentro de `latex/secoes/`:

| Arquivo | Conteúdo |
|---|---|
| `00-capa.tex` | Capa, folha de rosto, folha de aprovação |
| `01-resumo-abstract.tex` | Resumo e Abstract |
| `02-listas-sumario.tex` | Listas de ilustrações/tabelas, siglas, sumário |
| `03-introducao.tex` | Introdução |
| `04-tema-justificativa.tex` | Tema e Justificativa |
| `05-objetivos.tex` | Objetivo geral e específicos |
| `06-metodologia.tex` | Metodologia |
| `07-recursos-cronograma.tex` | Recursos e cronograma |
| `08-referencias.tex` | Referências bibliográficas |
| `09-anexos.tex` | Anexos I a IV |

O arquivo mestre `projeto-pesquisa.tex` contém apenas o preâmbulo (pacotes,
margens, comandos próprios) e a lista de `\input`. A saída continua sendo um
**único PDF** — `\input` é inserção textual no momento da compilação.

Convenções para trabalho em grupo:

- **Edite só o arquivo da sua seção.** Duas pessoas em arquivos diferentes nunca
  geram conflito no git.
- **Avise antes de mexer no mestre.** O preâmbulo é compartilhado por todos; é o
  único ponto de colisão real.
- **Uma frase por linha.** O git compara linha a linha, então isso faz o diff
  apontar a frase exata que mudou, em vez de marcar o parágrafo inteiro.
- **Não versione `build/`.** Tudo ali é derivado e volta idêntico ao recompilar.
  O PDF entra no repositório só nos marcos de entrega, com nome versionado.
- Para compilar apenas a sua seção enquanto escreve, comente os outros `\input`
  no mestre — e lembre de descomentar antes de commitar.

## 13. Ver o PDF atualizado sem instalar nada

O repositório compila sozinho no GitHub Actions
([.github/workflows/build-pdf.yml](.github/workflows/build-pdf.yml)). Ninguém
precisa de LaTeX instalado para **ler** o documento — só para editá-lo.

**Estado atual do projeto:** aba *Actions* → execução mais recente da branch
`main` → seção *Artifacts* → baixar `projeto-pesquisa-<commit>`.

**Revisar uma proposta antes do merge:** todo pull request gera o PDF daquela
versão. Revise o resultado final, não o `.tex`.

**Marcos de entrega:** crie uma tag e o PDF ganha link fixo e imutável, numa
release:

```
git tag -a v1.0-escola -m "Apresentacao na escola parceira"
git push origin v1.0-escola
```

**Se o build falhar:** o log do LaTeX fica anexado como artefato `log-da-falha`,
com arquivo e linha do erro.

## 14. Como compilar o documento LaTeX

```
cd latex
pdflatex projeto-pesquisa.tex
pdflatex projeto-pesquisa.tex        # 2ª passada: gera o sumário
```

Requer uma distribuição TeX (MiKTeX ou TeX Live) com os pacotes `babel`,
`geometry`, `setspace`, `titlesec`, `enumitem`, `graphicx`, `longtable`,
`hyperref`. As figuras devem ser colocadas em `latex/figuras/` com os nomes
`fig01-parceria.png` a `fig20-ornitorrinco-real.png`; enquanto ausentes, o
documento compila e imprime um espaço reservado no lugar de cada figura.

---

**Nota metodológica.** Este documento descreve requisitos de software — o que o
sistema deve fazer e como verificar. Ele não define regras de negócio, porque o
projeto não tem negócio: é um instrumento de pesquisa acadêmica de uso único e
controlado.
