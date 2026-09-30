import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { generatePin } from '$lib/server/auth';
import { uploadToR2 } from '$lib/server/r2';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const user = locals.user;
	if (!user || user.role !== 'professor') {
		throw redirect(303, '/auth/login?role=professor');
	}

	const db = getDb(platform);

	// Turmas criadas pelo professor
	const turmas = await db
		.prepare(
			`SELECT c.id, c.name, c.header_image, c.pin, c.created_at,
              (SELECT COUNT(*) FROM classroom_enrollments ce WHERE ce.classroom_id = c.id) as student_count,
              (SELECT COUNT(*) FROM exercise_lists el WHERE el.classroom_id = c.id) as list_count
       FROM classrooms c
       WHERE c.teacher_id = ?
       ORDER BY c.created_at DESC`
		)
		.bind(user.id)
		.all<{
			id: string;
			name: string;
			header_image: string | null;
			pin: string;
			created_at: string;
			student_count: number;
			list_count: number;
		}>();

	return {
		turmas: turmas.results || []
	};
};

export const actions: Actions = {
	createTurma: async ({ request, locals, platform }) => {
		const user = locals.user;
		if (!user || user.role !== 'professor') throw redirect(303, '/auth/login');

		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const imageFile = formData.get('header_image') as File | null;
		const imageUrlInput = formData.get('header_image_url')?.toString().trim();

		if (!name || name.length < 3) {
			return fail(400, { error: 'O nome da turma deve ter pelo menos 3 caracteres.' });
		}

		let headerImage: string | null = imageUrlInput || null;

		// Se o usuário fez upload de imagem para o R2
		if (imageFile && imageFile.size > 0 && imageFile.name) {
			try {
				const upload = await uploadToR2(platform, imageFile, 'headers');
				headerImage = upload.url;
			} catch (err: any) {
				console.error('Falha no upload do cabeçalho da turma:', err);
			}
		}

		const db = getDb(platform);
		const turmaId = crypto.randomUUID();

		// Gera PIN aleatório único de 6 dígitos
		let pin = generatePin();
		let pinExists = true;
		let attempts = 0;

		while (pinExists && attempts < 5) {
			const check = await db.prepare('SELECT id FROM classrooms WHERE pin = ?').bind(pin).first();
			if (!check) {
				pinExists = false;
			} else {
				pin = generatePin();
				attempts++;
			}
		}

		await db
			.prepare(
				'INSERT INTO classrooms (id, teacher_id, name, header_image, pin, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))'
			)
			.bind(turmaId, user.id, name, headerImage, pin)
			.run();

		return { success: true, createdTurmaId: turmaId };
	}
};
