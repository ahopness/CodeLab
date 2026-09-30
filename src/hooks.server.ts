import type { Handle } from '@sveltejs/kit';
import { getUserFromSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Carrega usuário da sessão atual
	const user = await getUserFromSession(event.platform, event.cookies);
	event.locals.user = user;

	const path = event.url.pathname;

	// Rotas protegidas
	const isProtectedRoute =
		path.startsWith('/turmas') ||
		path.startsWith('/professor');

	if (isProtectedRoute && !user) {
		const targetRole = path.startsWith('/professor') ? 'professor' : 'aluno';
		throw redirect(303, `/auth/login?role=${targetRole}&redirect=${encodeURIComponent(path)}`);
	}

	// Proteção de rota exclusiva para professores/monitores
	if (path.startsWith('/professor') && user?.role !== 'professor') {
		throw redirect(303, '/turmas');
	}

	// Redireciona professores que tentarem acessar a listagem de turmas de aluno
	if (path === '/turmas' && user?.role === 'professor') {
		throw redirect(303, '/professor');
	}

	const response = await resolve(event);
	return response;
};
