import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { createMagicLink } from '$lib/server/auth';
import { sendMagicLinkEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		const redirectUrl = url.searchParams.get('redirect');
		if (redirectUrl) throw redirect(303, redirectUrl);
		if (locals.user.role === 'professor') {
			throw redirect(303, '/professor');
		}
		throw redirect(303, '/turmas');
	}

	const roleParam = url.searchParams.get('role');
	const defaultRole = roleParam === 'professor' ? 'professor' : 'aluno';

	return {
		defaultRole,
		redirect: url.searchParams.get('redirect') || ''
	};
};

export const actions: Actions = {
	default: async ({ request, platform, url }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim().toLowerCase();
		const name = formData.get('name')?.toString().trim();
		const role = formData.get('role')?.toString().trim();

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Por favor, insira um endereço de e-mail válido.', email, name, role });
		}

		if (!role || (role !== 'aluno' && role !== 'professor')) {
			return fail(400, { error: 'Selecione se você é Aluno ou Professor.', email, name, role });
		}

		const db = getDb(platform);

		// Busca usuário existente
		let user = await db
			.prepare('SELECT id, name, email, role FROM users WHERE email = ?')
			.bind(email)
			.first<{ id: string; name: string; email: string; role: 'aluno' | 'professor' }>();

		if (!user) {
			if (!name || name.length < 2) {
				return fail(400, {
					error: 'Por ser seu primeiro acesso, informe seu nome completo.',
					email,
					role,
					needsName: true
				});
			}

			const userId = crypto.randomUUID();
			await db
				.prepare('INSERT INTO users (id, name, email, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))')
				.bind(userId, name, email, role)
				.run();

			user = { id: userId, name, email, role };
		}

		// Gera token do Magic Link
		const { rawToken } = await createMagicLink(platform, user.id);
		const origin = url.origin;
		const redirectParam = formData.get('redirect')?.toString();
		const redirectQuery = redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '';
		const verifyUrl = `${origin}/auth/verify?token=${rawToken}${redirectQuery}`;

		// Disparo do e-mail
		const apiKey = platform?.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
		const fromEmail = platform?.env?.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
		const emailResult = await sendMagicLinkEmail(user.email, user.name, verifyUrl, apiKey, fromEmail);

		return {
			success: true,
			email: user.email,
			name: user.name,
			simulatedUrl: emailResult.simulated ? verifyUrl : null
		};
	}
};
