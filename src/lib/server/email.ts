/**
 * Serviço de envio de e-mails transacionais (Resend API e simulador local)
 */

interface SendEmailParams {
	to: string;
	subject: string;
	html: string;
	text: string;
	from?: string;
}

export async function sendEmail(
	params: SendEmailParams,
	apiKey?: string,
	fromEmail?: string
): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
	const key = apiKey || process.env.RESEND_API_KEY;
	const from =
		params.from ||
		fromEmail ||
		process.env.RESEND_FROM_EMAIL ||
		'CodeLab <onboarding@resend.dev>';

	if (!key || key.trim() === '') {
		console.log('----------------------------------------------------');
		console.log('[E-MAIL SIMULADO - AMBIENTE DE DESENVOLVIMENTO]');
		console.log(`De: ${from}`);
		console.log(`Para: ${params.to}`);
		console.log(`Assunto: ${params.subject}`);
		console.log(`Texto: \n${params.text}`);
		console.log('----------------------------------------------------');
		return { success: true, simulated: true };
	}

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${key}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from,
				to: [params.to],
				subject: params.subject,
				html: params.html,
				text: params.text
			})
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('[Resend Error]:', response.status, errorData);
			return { success: false, error: errorData };
		}

		return { success: true };
	} catch (err: any) {
		console.error('[Email Dispatch Exception]:', err);
		return { success: false, error: err.message || String(err) };
	}
}

/**
 * Envio de e-mail com Magic Link de autenticação
 */
export async function sendMagicLinkEmail(
	to: string,
	name: string,
	verifyUrl: string,
	apiKey?: string,
	fromEmail?: string
) {
	const subject = 'Seu link de acesso ao CodeLab';
	const text = `Olá, ${name}!\n\nClique no link abaixo para entrar no CodeLab:\n${verifyUrl}\n\nEste link é de uso único e expira em 15 minutos.\nSe você não solicitou este acesso, desconsidere esta mensagem.`;

	const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #18181b;">
      <div style="border-bottom: 2px solid #18181b; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0; color: #18181b;">CodeLab</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.5; color: #27272a;">Olá, <strong>${name}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5; color: #52525b;">Você solicitou acesso à plataforma. Clique no botão abaixo para entrar sem senha:</p>
      <div style="margin: 28px 0;">
        <a href="${verifyUrl}" style="background-color: #18181b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 15px; font-weight: 500; display: inline-block;">
          Entrar no CodeLab &rarr;
        </a>
      </div>
      <p style="font-size: 13px; color: #71717a; line-height: 1.4;">Ou copie e cole o link a seguir no seu navegador:<br><a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a></p>
      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 32px 0 16px;">
      <p style="font-size: 12px; color: #a1a1aa; margin: 0;">Este link de acesso único expira em 15 minutos. Se não foi você quem solicitou, ignore este e-mail.</p>
    </div>
  `;

	return await sendEmail({ to, subject, html, text }, apiKey, fromEmail);
}

/**
 * Envio de e-mail com Feedback de correção do professor
 */
export async function sendFeedbackEmail(
	to: string,
	studentName: string,
	exerciseTitle: string,
	teacherName: string,
	feedbackText: string,
	studentCode?: string,
	apiKey?: string,
	fromEmail?: string
) {
	const subject = `Feedback da Monitoria: ${exerciseTitle}`;
	const text = `Olá, ${studentName}!\n\nO professor ${teacherName} analisou sua resolução para o exercício "${exerciseTitle}" e deixou o seguinte feedback:\n\n${feedbackText}\n\nBons estudos no CodeLab!`;

	const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; color: #18181b;">
      <div style="border-bottom: 2px solid #18181b; padding-bottom: 12px; margin-bottom: 24px;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0; color: #18181b;">Feedback da Monitoria — CodeLab</h1>
      </div>
      <p style="font-size: 16px; line-height: 1.5; color: #27272a;">Olá, <strong>${studentName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.5; color: #52525b;">O professor <strong>${teacherName}</strong> avaliou seu código no exercício <em>${exerciseTitle}</em>:</p>
      
      <div style="background-color: #f4f4f5; border-left: 4px solid #18181b; padding: 16px; margin: 20px 0; border-radius: 2px;">
        <p style="margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap; color: #18181b;">${feedbackText}</p>
      </div>

      ${
				studentCode
					? `
        <div style="margin-top: 24px;">
          <p style="font-size: 13px; font-weight: 600; text-transform: uppercase; color: #71717a; margin-bottom: 8px;">Código analisado:</p>
          <pre style="background: #18181b; color: #f4f4f5; padding: 14px; border-radius: 4px; font-size: 12px; overflow-x: auto; font-family: monospace;"><code>${studentCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
      `
					: ''
			}

      <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 32px 0 16px;">
      <p style="font-size: 12px; color: #a1a1aa; margin: 0;">CodeLab — Plataforma de Monitoria e Resolução de Exercícios</p>
    </div>
  `;

	return await sendEmail({ to, subject, html, text }, apiKey, fromEmail);
}
