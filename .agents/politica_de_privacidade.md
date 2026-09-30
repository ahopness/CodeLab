# Política de Privacidade e Proteção de Dados — CodeLab

Este documento esclarece como a plataforma **CodeLab** trata os dados de alunos, monitores e professores da disciplina de Introdução à Programação, em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).

---

## 1. Princípio da Minimização de Dados

A plataforma coleta única e exclusivamente os dados estritamente necessários para viabilizar as atividades acadêmicas e a monitoria:

* **Nome Completo:** Utilizado para identificação do aluno nas turmas e nas listas de exercícios enviadas ao professor.
* **Endereço de E-mail:** Utilizado para envio de *Magic Links* de autenticação e recebimento de feedbacks e correções pedagógicas.
* **Códigos e Submissões:** Códigos em linguagem C99, entradas e saídas geradas pelos alunos durante as listas de exercícios, armazenados para fins pedagógicos de avaliação e monitoria.

**Não coletamos:** CPF, endereço residencial, dados bancários, telefone, biometria ou dados sensíveis.

---

## 2. Autenticação e Segurança (Sem Senhas)

* O CodeLab adota autenticação **Passwordless (Magic Links)**. Nenhuma senha de usuário é solicitada ou gravada em nossos bancos de dados.
* Os tokens de acesso são gerados com entropia criptográfica (32 bytes), possuem validade estrita de **15 minutos** e são de **uso único**.
* As sessões ativas são mantidas exclusivamente por meio de cookies com as bandeiras de segurança `HttpOnly`, `SameSite=Lax` e `Secure`.

---

## 3. Armazenamento e Compartilhamento de Informações

* **Banco de Dados:** Os registros relacionais são armazenados no **Cloudflare D1** (SQLite distribuído com criptografia em repouso e em trânsito).
* **Mídias e Vídeos:** Imagens de capa de turmas e vídeos de resolução de exercícios são armazenados no **Cloudflare R2**.
* **Disparo Transacional:** O envio de e-mails transacionais (links de login e feedbacks de correção) é processado através da API do **Resend**.
* **Compartilhamento:** Os dados dos alunos **nunca** são vendidos, alugados ou compartilhados com terceiros para fins comerciais. O acesso às respostas e códigos é restrito aos monitores e professores responsáveis pela turma.

---

## 4. Direitos dos Titulares de Dados

A qualquer momento, o titular dos dados (aluno ou professor) possui o direito de:
1. Confirmar a existência de tratamento de seus dados.
2. Solicitar a retificação de seus dados cadastrais (nome ou e-mail).
3. Solicitar a exclusão definitiva de sua conta, submissões e histórico de turmas da plataforma.

Para solicitações referentes à privacidade e dados, o usuário pode contatar diretamente o monitor ou professor responsável pela disciplina.