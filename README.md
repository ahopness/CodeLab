<div align="center">
  <p><h2>Codelab</h2></p>
  <p><h3>Sua plataforma de aprendizado de programação</h3></p>
  <img width="256" height="256" alt="logo" src="https://github.com/user-attachments/assets/061258a1-c67a-45d7-97b6-a4f6d61d3326" />
  <br><br>
</div>

**TRIVIA**: Como monitor de programação na minha faculdade, é sempre muito difícil manter noção de como os aluno estão programando, então fiz esse programa pra analisar e dar feedback pra eles com o mínimo de fricção possível.

## Screenshots
<div align="center">
  <img width="400" src="https://github.com/user-attachments/assets/85d96676-1b54-475a-a3f8-f21842fd25e0" />
  <img width="400" src="https://github.com/user-attachments/assets/05ece01f-5521-4c4c-b3d3-9efb0967faf3" />
  <img width="400" src="https://github.com/user-attachments/assets/524a25d8-da5c-4ea0-a344-f231571efa70" />
  <img width="400" src="https://github.com/user-attachments/assets/7636dcd6-dee1-4f0b-a930-09d76aecd9b3" />
  <img width="400" src="https://github.com/user-attachments/assets/1af8c92f-b1f6-4bef-988e-5578b0ef7be2" />
  <img width="400" src="https://github.com/user-attachments/assets/41dd3ae8-6d61-442c-beb3-ce7aad670bb3" />
</div>

## Funções Principais
- **Execução e Interpretação C99 no Cliente**: Interpretação de código C99 isolada em Web Worker no navegador via JSCPP, com timeout de 5 segundos contra loops infinitos e sem consumo de CPU no servidor.
- **Workspace Editorial em 2 Colunas**: Divisão ergonômica com enunciado e vídeo na coluna esquerda, e editor CodeMirror C99, terminal de saída, entrada padrão (`stdin`) e verificação automática com a saída esperada na coluna direita.
- **Inscrição de Turmas por PIN de 6 Dígitos**: Sistema ágil de matrícula em que estudantes entram nas turmas informando o código PIN numérico gerado pelo professor.
- **Listas de Exercícios com Vídeo de Apoio**: Cadastro modular de exercícios com suporte a saídas esperadas para correção e vídeos explicativos hospedados no Cloudflare R2 ou links externos.
- **Revisão Docente e Feedback por E-mail**: Painel do professor com histórico de submissões, comparação de stdout e envio de orientações pedagógicas por e-mail diretamente via Resend API.
- **Controle de Submissão Única (Upsert)**: Cada estudante mantém apenas 1 submissão registrada por questão, permitindo reenvio e correções contínuas sem duplicar registros no banco de dados.
- **Autenticação Passwordless Segura (Magic Links)**: Acesso sem senhas por tokens descartáveis temporários enviados por e-mail e cookies de sessão `HttpOnly` com separação de perfis (Estudante e Professor/Monitor).
- **Arquitetura Serverless de Custo Zero**: Operação completa sobre a infraestrutura da Cloudflare (Pages, Cloudflare D1 SQLite e Cloudflare R2 Object Storage).

## Diretórios do Projeto
```text
.
├── .agents/          # Documentação técnica e diretrizes de arquitetura
├── migrations/       # Migrações SQL do Cloudflare D1
├── src/
│   ├── lib/
│   │   ├── components/   # Componentes da interface (ex: C99Workspace)
│   │   └── server/       # Módulos de backend (auth, db, email, r2)
│   ├── routes/           # Rotas do SvelteKit (auth, turmas, professor, api)
│   ├── app.css           # Estilos globais e Tailwind CSS
│   └── hooks.server.ts   # Interceptador de sessão e controle de rotas
├── static/           # Ativos públicos, bibliotecas locais (CodeMirror, JSCPP) e ícones
├── wrangler.toml     # Configuração de bindings D1, R2 e variáveis públicas
└── package.json
```

## Tecnologias e Bibliotecas

| Tecnologia / Biblioteca | Finalidade no CodeLab |
|---|---|
| **SvelteKit 2 & Svelte 5 (Runes)** | Framework reativo de alta performance com arquitetura baseada em Runes (`$state`, `$derived`, `$props`). |
| **Tailwind CSS** | Estilização utilitária configurada para a estética acadêmica editorial *anti-card*. |
| **Cloudflare Pages & Workers** | Hospedagem *edge serverless* de latência ultrabaixa e custo zero de execução. |
| **Cloudflare D1 (SQLite)** | Banco de dados relacional distribuído para armazenamento de usuários, turmas, exercícios e submissões. |
| **Cloudflare R2 Storage** | Armazenamento de objetos compatível com S3 para imagens de turmas e vídeos de resolução. |
| **JSCPP & CodeMirror** | Editor de código com realce de sintaxe C99 e interpretação no navegador sem necessidade de backend de compilação. |
| **Resend API** | Envio de links mágicos de autenticação e feedbacks pedagógicos por e-mail. |

## Ambiente e Execução Local

### Pré-requisitos
- **Node.js**: v24.x ou superior
- **NPM**: v10.x ou superior

## Configuração do Ambiente e Variáveis

Para a execução local e publicação na Cloudflare Pages, configure as variáveis de ambiente necessárias. Em ambiente de desenvolvimento local, crie um arquivo `.env` na raiz do projeto baseado no exemplo abaixo:

```env
# Exemplo de variáveis secretas (.env)
RESEND_API_KEY="re_123456789"
AUTH_SECRET="your-32-character-secret-key-goes-here"
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_ACCOUNT_ID=""
```

### Variáveis no Cloudflare Pages (Produção)
No painel da Cloudflare (*Settings > Environment Variables* do projeto Pages), declare as variáveis secretas:
- `RESEND_API_KEY`: Chave de API do Resend para envio dos e-mails.
- `AUTH_SECRET`: Chave secreta de alta entropia para assinatura e validação das sessões.
- `R2_ACCESS_KEY_ID`: ID da chave de acesso do Cloudflare R2.
- `R2_SECRET_ACCESS_KEY`: Chave secreta de acesso do Cloudflare R2.
- `R2_ACCOUNT_ID`: Identificador da conta Cloudflare para operações no bucket R2.

As configurações de banco de dados (`d1_databases`) e bucket de arquivos (`r2_buckets`) estão declaradas no arquivo `wrangler.toml`.
