/**
 * C99 CodeLab — Frontend Controller (Vanilla JS + CodeMirror + JSCPP)
 */

// Catálogo de Exercícios e Exemplos para Monitoria
const EXAMPLES = {
  hello: {
    title: "Olá Mundo",
    stdin: "",
    code: `#include <stdio.h>

int main() {
    printf("Ola! Bem-vindo ao C99 CodeLab!\\n");
    printf("Ambiente no navegador para a monitoria (Client-Side).\\n");
    return 0;
}
`,
  },
  scanf: {
    title: "Leitura de Dados (scanf)",
    stdin: "25 17",
    code: `#include <stdio.h>

int main() {
    int valor1, valor2;
    printf("Digite dois numeros inteiros: ");
    
    if (scanf("%d %d", &valor1, &valor2) == 2) {
        printf("\\nValores recebidos: %d e %d\\n", valor1, valor2);
        printf("Soma: %d + %d = %d\\n", valor1, valor2, valor1 + valor2);
        printf("Subtracao: %d - %d = %d\\n", valor1, valor2, valor1 - valor2);
        printf("Multiplicacao: %d * %d = %d\\n", valor1, valor2, valor1 * valor2);
    } else {
        printf("\\n[Erro] Falha ao ler os dados do stdin.\\n");
    }
    
    return 0;
}
`,
  },
  loop: {
    title: "Laços e Condicionais",
    stdin: "10",
    code: `#include <stdio.h>

int main() {
    int limite = 8;
    int soma_pares = 0;
    
    printf("Classificando numeros de 1 ate %d:\\n", limite);
    for (int i = 1; i <= limite; i++) {
        if (i % 2 == 0) {
            printf("  -> %d e PAR\\n", i);
            soma_pares += i;
        } else {
            printf("  -> %d e IMPAR\\n", i);
        }
    }
    
    printf("\\nSoma total dos pares: %d\\n", soma_pares);
    return 0;
}
`,
  },
  pointers: {
    title: "Vetores e Ponteiros",
    stdin: "",
    code: `#include <stdio.h>

// Passagem de ponteiros por referencia
void trocar(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// Manipulacao de array via ponteiro
void dobrar_elementos(int *v, int tamanho) {
    for (int i = 0; i < tamanho; i++) {
        v[i] = v[i] * 2;
    }
}

int main() {
    int x = 10, y = 99;
    printf("Antes da troca: x = %d, y = %d\\n", x, y);
    trocar(&x, &y);
    printf("Depois da troca: x = %d, y = %d\\n\\n", x, y);

    int dados[5] = {1, 2, 3, 4, 5};
    printf("Array original: ");
    for (int i = 0; i < 5; i++) printf("%d ", dados[i]);
    printf("\\n");

    dobrar_elementos(dados, 5);
    printf("Array dobrado:  ");
    for (int i = 0; i < 5; i++) printf("%d ", dados[i]);
    printf("\\n");

    return 0;
}
`,
  },
  recursion: {
    title: "Matrizes e Recursão",
    stdin: "",
    code: `#include <stdio.h>

// Funcao recursiva para calculo de Fibonacci
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    // Matriz 2x3
    int matriz[2][3] = { {10, 20, 30}, {40, 50, 60} };

    printf("=== Percorrendo Matriz 2x3 ===\\n");
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 3; j++) {
            printf("[%d][%d] = %d   ", i, j, matriz[i][j]);
        }
        printf("\\n");
    }

    printf("\\n=== Teste de Recursao ===\\n");
    for (int i = 0; i <= 7; i++) {
        printf("Fibonacci(%d) = %d\\n", i, fibonacci(i));
    }

    return 0;
}
`,
  },
  benchmark: {
    title: "Teste Geral (Algoritmos e Análise)",
    stdin: "6 45 12 89 23 7 60 23",
    code: `#include <stdio.h>

// 1. Passagem por referencia via ponteiro
void trocar(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

// 2. Ordenacao com lacos aninhados e ponteiros
void bubble_sort(int *vetor, int tamanho) {
    for (int i = 0; i < tamanho - 1; i++) {
        for (int j = 0; j < tamanho - i - 1; j++) {
            if (vetor[j] > vetor[j + 1]) {
                trocar(&vetor[j], &vetor[j + 1]);
            }
        }
    }
}

// 3. Algoritmo recursivo: Busca Binaria
int busca_binaria(int *vetor, int inicio, int fim, int chave) {
    if (inicio > fim) {
        return -1; // Nao encontrado
    }
    int meio = inicio + (fim - inicio) / 2;
    if (vetor[meio] == chave) {
        return meio;
    }
    if (vetor[meio] > chave) {
        return busca_binaria(vetor, inicio, meio - 1, chave);
    }
    return busca_binaria(vetor, meio + 1, fim, chave);
}

// 4. Algoritmo recursivo: MDC de Euclides
int mdc(int a, int b) {
    if (b == 0) return a;
    return mdc(b, a % b);
}

// 5. Calculo de estatisticas basicas
void estatisticas(int *vetor, int n, int *soma, float *media, int *menor, int *maior) {
    *soma = 0;
    *menor = vetor[0];
    *maior = vetor[0];

    for (int i = 0; i < n; i++) {
        *soma += vetor[i];
        if (vetor[i] < *menor) *menor = vetor[i];
        if (vetor[i] > *maior) *maior = vetor[i];
    }
    *media = (float)(*soma) / n;
}

int main() {
    int n, valor_busca;
    int vetor[10];

    printf("===========================================\\n");
    printf("   SISTEMA DE ANALISE NUMERICA (C99)       \\n");
    printf("===========================================\\n\\n");

    // Leitura dos dados via stdin
    printf("[1/5] Lendo configuracoes de entrada...\\n");
    if (scanf("%d", &n) != 1 || n <= 0 || n > 10) {
        printf("Quantidade de elementos invalida.\\n");
        return 1;
    }

    printf("Lendo %d valores para o vetor:\\n", n);
    for (int i = 0; i < n; i++) {
        int item;
        scanf("%d", &item);
        vetor[i] = item;
    }

    scanf("%d", &valor_busca);

    // Exibicao do vetor original
    printf("\\n-> Vetor Original: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", vetor[i]);
    }
    printf("\\n");

    // Calculo de estatisticas via ponteiros
    int soma, menor, maior;
    float media;
    estatisticas(vetor, n, &soma, &media, &menor, &maior);

    printf("\\n[2/5] Estatisticas Gerais:\\n");
    printf("  - Soma Total: %d\\n", soma);
    printf("  - Media:      %.2f\\n", media);
    printf("  - Menor:      %d\\n", menor);
    printf("  - Maior:      %d\\n", maior);

    // Ordenacao Bubble Sort
    bubble_sort(vetor, n);
    printf("\\n[3/5] Vetor Ordenado (Bubble Sort):\\n  -> ");
    for (int i = 0; i < n; i++) {
        printf("%d ", vetor[i]);
    }
    printf("\\n");

    // Busca Binaria Recursiva
    printf("\\n[4/5] Busca Binaria Recursiva:\\n");
    int posicao = busca_binaria(vetor, 0, n - 1, valor_busca);
    if (posicao != -1) {
        printf("  - Valor %d encontrado no indice %d do vetor ordenado!\\n", valor_busca, posicao);
    } else {
        printf("  - Valor %d NAO foi encontrado no vetor.\\n", valor_busca);
    }

    // Matriz 2D e operacoes
    printf("\\n[5/5] Operacoes com Matriz 3x3:\\n");
    int matriz[3][3] = {
        { 1, 2, 3 },
        { 4, 5, 6 },
        { 7, 8, 9 }
    };

    int soma_diag_principal = 0;
    int soma_diag_secundaria = 0;

    for (int i = 0; i < 3; i++) {
        printf("  | ");
        for (int j = 0; j < 3; j++) {
            printf("%2d ", matriz[i][j]);
            if (i == j) soma_diag_principal += matriz[i][j];
            if (i + j == 2) soma_diag_secundaria += matriz[i][j];
        }
        printf("|\\n");
    }

    printf("  -> Soma Diagonal Principal:  %d\\n", soma_diag_principal);
    printf("  -> Soma Diagonal Secundaria: %d\\n", soma_diag_secundaria);

    // Recursao: MDC entre o maior e o menor valor
    int resultado_mdc = mdc(maior, menor);
    printf("\\n-> MDC(Maior=%d, Menor=%d) = %d\\n", maior, menor, resultado_mdc);

    printf("\\n===========================================\\n");
    printf("   EXECUCAO CONCLUIDA COM SUCESSO!         \\n");
    printf("===========================================\\n");

    return 0;
}
`,
  },
};

// Estado da Aplicação
let editor = null;
let currentWorker = null;
let executionStartTime = 0;
let executionTimerId = null;

// Elementos da Interface
const exampleSelect = document.getElementById("example-select");
const btnRun = document.getElementById("btn-run");
const btnClearOutput = document.getElementById("btn-clear-output");
const btnReset = document.getElementById("btn-reset");
const btnExportSolution = document.getElementById("btn-export-solution");
const stdinInput = document.getElementById("stdin-input");
const outputConsole = document.getElementById("output-console");
const statusIndicator = document.getElementById("status-indicator");
const statExitCode = document.getElementById("stat-exit-code");
const statTime = document.getElementById("stat-time");
const cursorPos = document.getElementById("cursor-pos");

// Inicialização do CodeMirror
function initEditor() {
  const textarea = document.getElementById("code-editor");
  editor = CodeMirror.fromTextArea(textarea, {
    mode: "text/x-csrc",
    theme: "dracula",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    indentUnit: 4,
    tabSize: 4,
    lineWrapping: false,
    extraKeys: {
      "Ctrl-Enter": () => executeCode(),
      "Cmd-Enter": () => executeCode(),
      Tab: (cm) => {
        if (cm.somethingSelected()) {
          cm.indentSelection("add");
        } else {
          cm.replaceSelection("    ", "end");
        }
      },
    },
  });

  // Atualizar indicador de cursor
  editor.on("cursorActivity", () => {
    const pos = editor.getCursor();
    cursorPos.textContent = `Linha ${pos.line + 1}, Coluna ${pos.ch + 1}`;
  });

  // Carregar primeiro exemplo
  loadExample("hello");
}

// Carregar exemplo no editor
function loadExample(key) {
  const example = EXAMPLES[key];
  if (!example) return;

  editor.setValue(example.code);
  stdinInput.value = example.stdin;
  clearOutput();
  editor.clearHistory();
}

// Atualizar indicador de status visual
function setStatus(state, text) {
  statusIndicator.className = `status-badge ${state}`;
  statusIndicator.querySelector(".status-text").textContent = text;
}

// Limpar terminal de saída
function clearOutput() {
  outputConsole.innerHTML = '<span class="terminal-welcome">// Terminal limpo. Pressione "Executar Código" para rodar.</span>';
  statExitCode.textContent = "Aguardando";
  statExitCode.className = "stat-value";
  statTime.textContent = "—";
  setStatus("", "Pronto");
}

// Append texto ao terminal
function appendOutput(text, className = "terminal-stdout") {
  // Se for o texto inicial de boas-vindas, remove
  if (outputConsole.querySelector(".terminal-welcome")) {
    outputConsole.innerHTML = "";
  }
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  outputConsole.appendChild(span);
  
  // Auto scroll para o final
  const terminalBody = document.getElementById("terminal-body");
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Executar Código C
function executeCode() {
  if (currentWorker) {
    currentWorker.terminate();
    currentWorker = null;
  }

  const code = editor.getValue();
  const input = stdinInput.value;

  // Validação básica
  if (!code.trim()) {
    clearOutput();
    appendOutput("[Erro] O editor está vazio.\n", "terminal-stderr");
    return;
  }

  // Prepara interface para execução
  outputConsole.innerHTML = "";
  setStatus("running", "Executando...");
  statExitCode.textContent = "Rodando...";
  statExitCode.className = "stat-value";
  btnRun.disabled = true;
  executionStartTime = performance.now();

  const EXECUTION_TIMEOUT_MS = 5000;
  const runId = "run_" + Math.random().toString(36).slice(2);

  // Tenta executar via Web Worker usando o bundle nativo do JSCPP
  try {
    currentWorker = new Worker("./lib/JSCPP.es5.min.js");

    // Timeout de segurança contra loops infinitos
    const timeoutId = setTimeout(() => {
      if (currentWorker) {
        currentWorker.terminate();
        currentWorker = null;
        finalizeExecution(
          null,
          "Tempo limite excedido (5s). Possível loop infinito detectado!",
          true
        );
      }
    }, EXECUTION_TIMEOUT_MS);

    currentWorker.onmessage = function (e) {
      const data = e.data;
      if (!data) return;

      // Mensagem de escrita de stdout (printf)
      if (data.type === "stdio.write") {
        appendOutput(data.data, "terminal-stdout");
      }
      // Mensagem de conclusao
      else if (data.id === runId) {
        clearTimeout(timeoutId);
        if (currentWorker) {
          currentWorker.terminate();
          currentWorker = null;
        }

        if (data.err) {
          finalizeExecution(null, data.msg || "Erro na compilação/execução.", true);
        } else {
          finalizeExecution(typeof data.data === "number" ? data.data : 0, null, false);
        }
      }
    };

    currentWorker.onerror = function (err) {
      clearTimeout(timeoutId);
      if (currentWorker) {
        currentWorker.terminate();
        currentWorker = null;
      }
      console.warn("Web Worker falhou, usando execução síncrona:", err);
      runSynchronously(code, input);
    };

    // Protocolo nativo do JSCPP Worker: [id, "run", code, input]
    currentWorker.postMessage([runId, "run", code, input || ""]);
  } catch (workerErr) {
    console.warn("Falha ao instanciar Web Worker, usando execução síncrona:", workerErr);
    runSynchronously(code, input);
  }
}

// Execução síncrona (fallback para ambientes restritos como file://)
function runSynchronously(code, input) {
  try {
    let stdoutBuffer = "";
    const exitCode = window.JSCPP.run(code, input || "", {
      stdio: {
        write: function (text) {
          stdoutBuffer += text;
          appendOutput(text, "terminal-stdout");
        },
      },
    });

    finalizeExecution(exitCode, null, false);
  } catch (err) {
    finalizeExecution(null, err.message || String(err), true);
  }
}

// Finalizar ciclo de execução e atualizar métricas
function finalizeExecution(exitCode, errorMessage, isError) {
  btnRun.disabled = false;
  const elapsed = Math.round(performance.now() - executionStartTime);
  statTime.textContent = `${elapsed} ms`;

  if (isError) {
    setStatus("error", "Erro de Execução");
    statExitCode.textContent = "Erro";
    statExitCode.className = "stat-value fail";
    appendOutput(`\n[Erro]: ${errorMessage}\n`, "terminal-stderr");
  } else {
    setStatus("success", "Finalizado");
    statExitCode.textContent = `Exit Code: ${exitCode}`;
    statExitCode.className = exitCode === 0 ? "stat-value ok" : "stat-value fail";
    appendOutput(`\n\n[Processo finalizado com código ${exitCode} em ${elapsed}ms]\n`, "terminal-system");
  }
}

// Copiar Solução para Área de Transferência (Para envio ao monitor)
function copySolutionForFeedback() {
  const code = editor.getValue();
  const input = stdinInput.value;
  const output = outputConsole.innerText;

  const payload = `/* ==========================================================
 * EXERCÍCIO RESOLVIDO - MONITORIA DE INTRODUÇÃO À PROGRAMAÇÃO
 * Data: ${new Date().toLocaleString()}
 * ========================================================== */

${code}

/* --- DADOS DE ENTRADA (stdin) ---
${input || "(sem entradas)"}
-----------------------------------

--- SAÍDA OBTIDA NO TERMINAL ---
${output}
-------------------------------- */
`;

  navigator.clipboard.writeText(payload).then(
    () => {
      const origText = btnExportSolution.textContent;
      btnExportSolution.textContent = "✅ Solução Copiada!";
      setTimeout(() => {
        btnExportSolution.textContent = origText;
      }, 2000);
    },
    (err) => {
      alert("Não foi possível copiar automaticamente: " + err);
    }
  );
}

// Event Listeners
exampleSelect.addEventListener("change", (e) => loadExample(e.target.value));
btnRun.addEventListener("click", executeCode);
btnClearOutput.addEventListener("click", clearOutput);
btnReset.addEventListener("click", () => loadExample(exampleSelect.value));
btnExportSolution.addEventListener("click", copySolutionForFeedback);

// Inicializar na carga da página
window.addEventListener("DOMContentLoaded", initEditor);
