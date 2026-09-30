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
- **LGPD por Design (Zero Retenção de CPF)**: O CPF do participante nunca trafega nem é armazenado nos servidores. O hash unidirecional SHA-256 é computado para garantir a unicidade de presença de forma anônima e irreversível.
- **Emissão Instantânea de Certificados via Cliente**: Renderização de PDFs em alta fidelidade diretamente no navegador via `pdf-lib`, fundindo metadados do evento, código de autenticidade e dados do participante instantaneamente sem sobrecarga no servidor.
- **Calibração Visual com Mira Reticular**: Ferramenta interativa de ajuste milimétrico para posicionar campos (nome do participante, data, autenticação e carga horária) sobre o template PDF do certificado.
- **Credenciamento Ágil via QR Code**: Validação pontual de presenças para eventos presenciais com controle de janela temporal de tolerância (±15 minutos em relação ao horário do evento).
- **Autenticação Passwordless Segura (Magic Links)**: Acesso administrativo sem senhas via tokens criptográficos descartáveis de uso único enviados por e-mail com a API do Resend e sessões assinadas com HMAC via cookies `HttpOnly`.
- **Exportação Segura de Listas de Presença**: Download de relatórios em formato CSV sanitizado contra vulnerabilidades de injeção de fórmulas (*CSV Formula Injection*).
- **Arquitetura Serverless de Custo Zero**: Implementação nativa sobre a infraestrutura da Cloudflare (Pages, Cloudflare D1 SQLite e Cloudflare R2 Object Storage), com suporte a fallback local via Node 24 SQLite.
// COLOCAR MAIS AQUI

## Diretórios do Projeto
```

```

## Tecnologias e Bibliotecas

| Tecnologia / Biblioteca | Finalidade no Vellum |
|---|---|
| **SvelteKit 2 & Svelte 5 (Runes)** | Framework reativo de alta performance com arquitetura baseada em Runes (`$state`, `$derived`, `$props`). |
| **Tailwind CSS v4** | Estilização utilitária de última geração configurada para a estética editorial *anti-card*. |
| **Cloudflare Pages & Workers** | Hospedagem *edge serverless* de latência ultrabaixa e escalabilidade sob demanda com custo zero. |
| **Cloudflare D1 (SQLite)** | Banco de dados relacional distribuído com suporte a migrações automáticas e fallback para `node:sqlite`. |
| **Cloudflare R2 Storage** | Armazenamento de objetos compatível com S3 para logos institucionais e templates de certificados. |

## Ambiente e Execução Local

### Pré-requisitos
- **Node.js**: v24.x ou superior
- **NPM**: v10.x ou superior

## Configuração do Ambiente e Variáveis

Para a execução local e publicação na Cloudflare Pages, configure as variáveis de ambiente necessárias. Em ambiente de desenvolvimento local, crie um arquivo `.env` na raiz do projeto baseado no exemplo abaixo:

```env

```

### Variáveis no Cloudflare Pages (Produção)
No painel da Cloudflare (*Settings > Environment Variables* do projeto Pages):

As configurações de banco de dados (`d1_databases`) e bucket de arquivos (`r2_buckets`) estão declaradas no arquivo `wrangler.toml`.
