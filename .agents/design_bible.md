# Design Bible — CodeLab

> **Conceito & Filosofia:**  
> Inspirado na sobriedade de publicações acadêmicas e cadernos de laboratório universitários. A interface prioriza clareza tipográfica, elegância editorial, ausência de ruídos visuais e foco absoluto no raciocínio lógico e na resolução do exercício em C.

---

## 1. Regra de Ouro: Filosofia Anti-Card (Sem Caixas / Sem Cards Flutuantes)

Interfaces modernas frequentemente abusam de cartões flutuantes (`cards`) com sombras excessivas, cantos arredondados grossos e elevações que poluem o espaço de foco do aluno.

**No CodeLab é expressamente adotado o estilo editorial anti-card:**
* ❌ **Não usar:** Caixas brancas flutuantes com sombras pesadas (`shadow-xl`, `rounded-2xl`, fundos cinzas destacados).
* ❌ **Não empilhar:** Múltiplos cards isolados para listas ou exercícios.
* ✅ **Usar:** Hierarquia puramente tipográfica, respiros generosos de espaçamento vertical (`py-8`, `my-6`) e divisores horizontais ultrafinos (*hairlines* de 1px `border-zinc-200`).
* ✅ **Estrutura:** As seções fluem naturalmente como páginas de um manual bem diagramado, organizadas por títulos serifados e linhas sutis.

---

## 2. Tipografia

A identidade visual é conduzida pelo contraste harmônico entre uma **Serif Expressiva** para títulos acadêmicos, uma **Sans-serif Neutra** de alta legibilidade para formulários e uma **Monospace Técnica** para código C e terminal.

### Famílias Tipográficas
1. **Títulos e Cabeçalhos (Display & Headings):**
   * **Fonte:** `Newsreader` ou `Playfair Display` (Serif).
   * **Propósito:** Expressar autoridade, solenidade acadêmica e clareza.
   * **Pesos:** 400 (Regular) e 600 (Semibold).

2. **Interface, Formulários e Textos Corridos:**
   * **Fonte:** `Inter` ou sistema nativo sans-serif (`system-ui, -apple-system, sans-serif`).
   * **Propósito:** Máxima legibilidade em instruções de exercícios e campos de entrada.
   * **Pesos:** 400 (Normal), 500 (Médio para rótulos e botões).

3. **Código C99, Terminal e Entradas:**
   * **Fonte:** `JetBrains Mono` ou `ui-monospace`.
   * **Propósito:** Exibição rigorosa de sintaxe C, linhas de código, tempos de execução e stdin/stdout.

---

## 3. Paleta de Cores & Elementos Visuais

```css
:root {
  --bg-primary: #fafafa;         /* Fundo da aplicação (off-white neutro) */
  --bg-surface: #ffffff;         /* Fundo de campos e áreas de leitura */
  --border-hairline: #e4e4e7;    /* Divisórias ultrafinas (Zinc 200) */
  --border-focus: #18181b;       /* Foco neutro marcante (Zinc 900) */
  --text-primary: #18181b;       /* Títulos e textos principais (Zinc 900) */
  --text-muted: #71717a;         /* Metadados e enunciados secundários (Zinc 500) */
  --text-subtle: #a1a1aa;        /* Placeholders e divisores (Zinc 400) */
  --success: #15803d;            /* Indicador de acerto (Green 700) */
  --error: #b91c1c;              /* Indicador de erro de compilação/teste (Red 700) */
}
```

---

## 4. Iconografia do Sistema (`static/icons/`)

A interface utiliza o conjunto de ícones pixelados/minimalistas presentes na pasta `static/icons/`, conferindo identidade retro-acadêmica e personalidade acolhedora à monitoria:

| Ícone | Arquivo | Onde Aplicar |
| :--- | :--- | :--- |
| **Prédio / Campus** | `icons/icon_building.png` | Turmas, Instituição e cabeçalho principal |
| **Pessoas** | `icons/icon_people.png` | Matrículas de alunos, lista de participantes |
| **Pasta** | `icons/icon_folder.png` | Listas de exercícios |
| **Arquivos** | `icons/icon_files.png` / `icon_file.png` | Exercícios e detalhes de questões |
| **Caneta** | `icons/icon_pen.png` | Edição de exercícios pelo professor |
| **Mesa de Estudos** | `icons/icon_desk.png` | Workspace do aluno |
| **Anotação** | `icons/icon_note.png` | Submissões e envio de feedbacks |
| **Porta** | `icons/icon_door.png` | Logout / Sair da turma |
| **Lâmpada Acesa** | `icons/icon_light_on.png` | Sucesso no teste (`output == expected_output`) |
| **Lâmpada Apagada** | `icons/icon_light_off.png` | Falha ou erro no teste do exercício |
| **Carregando** | `icons/icon_loading.gif` | Indicador de compilação/execução no Web Worker |
| **Ajuda** | `icons/icon_question.png` | Dúvidas sobre o funcionamento da plataforma |

---

## 5. Especificação do Workspace de Código (2 Colunas)

Conforme os requisitos da monitoria, o editor do aluno organiza-se em **duas colunas funcionais**:

```
+------------------------------------+------------------------------------+
| COLUNA 1: ENUNCIADO & ORIENTAÇÕES  | COLUNA 2: WORKSPACE VERTICAL       |
+------------------------------------+------------------------------------+
| [Q1] [Q2] [Q3] (Seletor de questão)| 1. EDITOR C99 (CodeMirror)         |
|                                    |    - Numeração de linhas           |
| Titulo do Exercício                |    - Atalho: Ctrl + Enter          |
| Enunciado completo com exemplos    |    - Botões: Executar / Resetar    |
|                                    |------------------------------------|
| Saída esperada de referência       | 2. TERMINAL (stdout / stderr)      |
|                                    |    - Status: [✅ Correto / ❌ Erro]|
| [▶ Assistir Vídeo de Resolução]    |    - Tempo em ms                   |
|                                    |------------------------------------|
| [📤 Enviar Resolução p/ Professor] | 3. CAMPO DE ENTRADA (stdin)        |
|                                    |    - Valores para scanf()          |
+------------------------------------+------------------------------------+
```

### Regras de Responsividade:
* **Desktop (telas >= 1024px):** Layout rigoroso de 2 colunas lado a lado, com scroll independente em cada coluna.
* **Telas menores / Mobile:** As duas colunas se empilham ordenadamente (Enunciado acima, Workspace de código abaixo) mantendo a usabilidade com área de toque mínima de 44px.
