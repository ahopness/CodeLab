import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, depends }) => {
	depends('app:user');
	return {
		user: locals.user,
		pathname: url.pathname
	};
};
