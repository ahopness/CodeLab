import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteUserAccount } from '$lib/server/auth';

export const POST: RequestHandler = async ({ platform, locals, cookies }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(303, '/');
	}

	await deleteUserAccount(platform, cookies, user.id, user.role);
	throw redirect(303, '/');
};

export const GET: RequestHandler = async () => {
	throw redirect(303, '/');
};
