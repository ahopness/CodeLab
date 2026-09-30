import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { uploadToR2 } from '$lib/server/r2';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const user = locals.user;
	if (!user || user.role !== 'professor') {
		throw redirect(303, '/auth/login?role=professor');
	}

	const { turmaId, listaId } = params;
	const db = getDb(platform);

	// Validação de acesso à turma pelo professor
	const turma = await db
		.prepare('SELECT id, name, pin FROM classrooms WHERE id = ? AND teacher_id = ?')
		.bind(turmaId, user.id)
		.first<{ id: string; name: string; pin: string }>();

	if (!turma) throw error(404, 'Turma não encontrada ou acesso não autorizado.');

	// Dados da Lista
	const list = await db
		.prepare('SELECT id, name, description FROM exercise_lists WHERE id = ? AND classroom_id = ?')
		.bind(listaId, turmaId)
		.first<{ id: string; name: string; description: string | null }>();

	if (!list) throw error(404, 'Lista de exercícios não encontrada.');

	// Exercícios com contagem de submissões
	const exercises = await db
		.prepare(
			`SELECT e.id, e.title, e.description, e.initial_code, e.test_input, e.expected_output, e.video_link, e.order_index, e.created_at,
              (SELECT COUNT(*) FROM submissions s WHERE s.exercise_id = e.id) as submission_count,
              (SELECT COUNT(DISTINCT s.student_id) FROM submissions s WHERE s.exercise_id = e.id AND s.status = 'correct') as solved_students_count
       FROM exercises e
       WHERE e.list_id = ?
       ORDER BY e.order_index ASC, e.created_at ASC`
		)
		.bind(listaId)
		.all<{
			id: string;
			title: string;
			description: string;
			initial_code: string | null;
			test_input: string | null;
			expected_output: string;
			video_link: string | null;
			order_index: number;
			created_at: string;
			submission_count: number;
			solved_students_count: number;
		}>();

	return {
		turma,
		list,
		exercises: exercises.results || []
	};
};

export const actions: Actions = {
	createExercise: async ({ request, params, locals, platform }) => {
		const user = locals.user;
		if (!user || user.role !== 'professor') throw redirect(303, '/auth/login');

		const { listaId } = params;
		const formData = await request.formData();

		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim();
		const expected_output = formData.get('expected_output')?.toString().trim();
		const test_input = formData.get('test_input')?.toString().trim() || null;
		const initial_code = formData.get('initial_code')?.toString().trim() || null;
		let video_link = formData.get('video_link')?.toString().trim() || null;
		const videoFile = formData.get('video_file') as File | null;

		if (!title || title.length < 3) {
			return fail(400, { error: 'O título do exercício deve ter pelo menos 3 caracteres.' });
		}

		if (!description || description.length < 5) {
			return fail(400, { error: 'O enunciado do exercício deve ser fornecido.' });
		}

		if (!expected_output) {
			return fail(400, { error: 'Você deve inserir o "output esperado" para o teste automático do programa.' });
		}

		// Se o professor fez upload de vídeo para o R2
		if (videoFile && videoFile.size > 0 && videoFile.name) {
			try {
				const upload = await uploadToR2(platform, videoFile, 'videos');
				video_link = upload.url;
			} catch (err: any) {
				console.error('Falha no upload do vídeo no R2:', err);
			}
		}

		const db = getDb(platform);
		const exerciseId = crypto.randomUUID();

		// Pega próxima ordem
		const countResult = await db
			.prepare('SELECT COUNT(*) as count FROM exercises WHERE list_id = ?')
			.bind(listaId)
			.first<{ count: number }>();
		const nextOrder = (countResult?.count || 0) + 1;

		await db
			.prepare(
				`INSERT INTO exercises (id, list_id, title, description, initial_code, test_input, expected_output, video_link, order_index, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`
			)
			.bind(
				exerciseId,
				listaId,
				title,
				description,
				initial_code,
				test_input,
				expected_output,
				video_link,
				nextOrder
			)
			.run();

		return { success: true, createdExerciseId: exerciseId };
	}
};
