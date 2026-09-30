import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadToR2 } from '$lib/server/r2';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const user = locals.user;
	if (!user || user.role !== 'professor') {
		return json({ error: 'Apenas professores/monitores podem realizar uploads de mídia.' }, { status: 403 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const prefix = (formData.get('prefix')?.toString() as 'headers' | 'videos') || 'headers';

		if (!file || file.size === 0) {
			return json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
		}

		// Limite de 100MB
		if (file.size > 100 * 1024 * 1024) {
			return json({ error: 'O tamanho do arquivo excede o limite máximo de 100MB.' }, { status: 400 });
		}

		const result = await uploadToR2(platform, file, prefix);
		return json({ success: true, ...result });
	} catch (err: any) {
		console.error('[Upload API Error]:', err);
		return json({ error: err.message || 'Falha no upload para o R2.' }, { status: 500 });
	}
};
