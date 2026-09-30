# C99 CodeLab — Protótipo de Editor & Executor C no Navegador

Protótipo funcional criado para a monitoria de **Introdução à Programação**, permitindo que alunos escrevam, compilem, executem e testem código C99 diretamente no navegador, com custo de servidor **R$ 0,00**.

---

## 🚀 Como Executar

O projeto é 100% estático (HTML, CSS e JavaScript puros) com todas as dependências baixadas localmente na pasta `lib/`. Não necessita de `npm install` ou build steps.

### Opção A: Servidor HTTP Local (Recomendado para habilitar Web Worker com timeout)
```bash
# Com Python 3:
python3 -m http.server 8080 --directory prototype

# Ou com Node.js (npx):
npx serve prototype
```
Acesse no navegador: `http://localhost:8080`

### Opção B: Abertura Direta do Arquivo
Abra o arquivo `prototype/index.html` com duplo clique em qualquer navegador moderno. O sistema possui fallback automático caso a política do navegador restrinja Web Workers em URLs `file://`.

---

## 🛠️ Recursos Implementados

1. **Editor de Código Profissional:**
   - Baseado no **CodeMirror** com tema Dark (Dracula).
   - Destaque de sintaxe para C99 (palavras-chave, tipos, strings, números).
   - Numeração de linhas, fechamento automático de chaves/parênteses e indentação inteligente (Tab = 4 espaços).
   - Atalho de execução rápida: `Ctrl + Enter` (ou `Cmd + Enter`).

2. **Entrada Padrão (`stdin`) para `scanf`:**
   - Área dedicada para o aluno inserir valores prévios que serão consumidos pelo `scanf("%d", ...)`.

3. **Terminal de Saída (`stdout` / `stderr`):**
   - Captura em tempo real de `printf`, mensagens de erro de compilação/sintaxe e código de retorno (*Exit Code*).
   - Contador de tempo de execução em milissegundos.

4. **Proteção contra Loop Infinito:**
   - A execução roda em segundo plano em um **Web Worker**.
   - Timeout automático de **5 segundos**: se o aluno escrever um `while(1)` ou recursão infinita, o worker é finalizado sem travar a aba do navegador.

5. **Exemplos Didáticos Integrados:**
   - *Exemplo 1:* Olá Mundo (`printf` básico).
   - *Exemplo 2:* Leitura de Dados (`scanf` com múltiplos valores).
   - *Exemplo 3:* Estruturas de Controle (`for`, `if/else`, acumuladores).
   - *Exemplo 4:* Vetores e Ponteiros (passagem por referência e `swap`).
   - *Exemplo 5:* Matrizes e Recursão (percorrimento 2D e sequência de Fibonacci).

6. **Fluxo de Monitoria:**
   - Botão **"Copiar Solução Formatada"**: gera um bloco formatado com o código C, o `stdin` usado e a saída gerada no terminal, facilitando o envio de dúvidas e feedbacks.
