# Especificação Técnica de Layout e Blocos - Dashboard Forense IA

## Gabarito Oficial de Veredito
- **Imagens IA (Manipuladas / Geradas):** 1, 4, 6 e 7
- **Imagens Reais (Fotografias de Procedência Real):** 2, 3, 5 e 8

---

## Estrutura Detalhada da Página 1 (Comparativo por Imagem)

A Página 1 deve ser organizada de forma clean e fluida, dividida internamente em 5 blocos visuais distintos. Cada bloco deve ter apenas o seu título e uma breve explicação contextual no topo.

### Bloco 1: Imagem em Análise
- **Conteúdo:** Exibição da imagem em teste (localizada na pasta `imagens/1.jpg`, `2.jpg`, etc.).
- **Controled de Navegação:** Botões de seta "Anterior" e "Próxima" + navegação pelas setas do teclado (Esquerda/Direita).
- **Indicador:** Exibir "Imagem X de 8".

### Bloco 2: Resposta dos Usuários vs. Veredito do Modelo
- **Título & Explicação:** Comparação direta entre a perceção humana (pesquisa escolar) e a análise preditiva da plataforma.
- **Sub-bloco Humano:**
  - Barra de progresso comparativa mostrando a % de usuários que votaram em "Real" vs "IA".
  - Destaque visual informando se a maioria dos humanos acertou ou errou em relação ao gabarito real.
- **Sub-bloco IA (Painel Multimodelo):**
  - Gráfico de Rosca/Donut com a porcentagem final do Veredito (ex: `71.52% - Forte Suspeita de IA`).
  - Cards do Painel Multimodelo:
    - **IA Principal (Recomendado):** Métrica calibrada para desvios espaciais de alta frequência (Ex: 75.98% - Risco Alto).
    - **IA Geral:** (Ex: 100% - Risco Alto).
    - **IA Multicategoria:** (Ex: 27.84% - Risco Baixo).
    - **IA Face Detection:** (Ex: 42.13% - Risco Médio).

### Bloco 3: Análise Forense Visível
- **Título & Explicação:** Visualização gráfica dos mapas de calor, frequências e artefatos extraídos do arquivo.
- **Grid de Imagens Forenses (da pasta `analise modelo/`):**
  - Exibir a composição de mapas como na referência:
    1. **Sinal Original** (Imagem fornecida)
    2. **Mapa de Gradientes** (Delineia transições e coerência de bordas)
    3. **Compressão ELA** (Diferença de compressão recomprimida)
    4. **Ruído de Alta Frequência** (Extração SRM do ruído do sensor físico)
    5. **Espectro de Fourier (FFT)** (Análise de frequências e padrões de grade)

### Bloco 4: Métricas do Sistema
- **Título & Explicação:** Valores numéricos extraídos pelos algoritmos computacionais.
- **Grid de Métricas (9 Cards com Destaque de Risco):**
  - Variância Ruído SRM (ex: `66.701`)
  - Simetria Fourier (FFT) (ex: `0.9565` - Destaque Risco)
  - Aberração Cromática (ex: `0.5553`)
  - Correlação R-G (ex: `0.9737`)
  - Correlação R-B (ex: `0.9574`)
  - Correlação G-B (ex: `0.9059`)
  - Média de Gradientes (ex: `74.2584`)
  - Desvio de Gradientes (ex: `73.4175`)
  - Média ELA % (ex: `2.5059` - Destaque Risco)

### Bloco 5: Indicadores Técnicos Detalhados
- **Título & Explicação:** Explicação interpretativa em texto combinada com a visualização do indicador específico.
- **Layout de Duas Colunas (Para cada indicador):**
  - **Coluna da Esquerda (Texto Técnico):** Categoria, nível de atenção (alta/média/baixa), título da anomalia, descrição técnica detalhada e o nível de desvio estrutural (extraídos do `indicadores.txt`).
  - **Coluna da Direita (Imagem do Indicador):** Visualização focada do indicador correspondente (ELA, FFT, Ruído SRM, Gradientes, Aberração Cromática).

---

## Estrutura da Página 2 (Dashboard Geral)
- **KPIs:** Total de Respostas (92), % Média de Acerto Humano, Imagem Mais Enganosa, Perfil Predominante.
- **Gráficos em Chart.js:**
  - Distribuição do Nível de Conhecimento em IA.
  - Média de Horas na Internet.
  - Taxa de Acerto Humano vs Gabarito Real por Imagem (1 a 8).
  - Matriz Geral de Acertos vs Erros da Escola.

---

## Estrutura da Página 3 (Respostas & Feedback)
- Tabela interativa alimentada pelas 92 respostas do CSV.
- Filtro por nome de usuário.
- Filtro por sentimento (Positivo, Neutro, Negativo).
- Filtro por tempo de internet/nível de IA.
- Expansão de modal para ver as respostas individuais das 8 imagens de cada aluno + Comentário Final.