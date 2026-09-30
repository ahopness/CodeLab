import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyMagicLink, createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
	const token = url.searchParams.get('token');
	const redirectUrl = url.searchParams.get('redirect');

	if (!token) {
		return { error: 'Token de acesso não fornecido ou ausente.' };
	}

	const { user } = await verifyMagicLink(platform, token);

	if (!user) {
		return { error: 'O link de acesso é inválido, já foi utilizado ou expirou (15 minutos).' };
	}

	// Cria sessão com cookie HttpOnly
	await createSession(platform, cookies, user.id);

	if (redirectUrl) {
		throw redirect(303, redirectUrl);
	}

	if (user.role === 'professor') {
		throw redirect(303, '/professor');
	}

	throw redirect(303, '/turmas');
};
