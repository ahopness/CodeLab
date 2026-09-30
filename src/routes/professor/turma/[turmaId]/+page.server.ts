import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const user = locals.user;
	if (!user || user.role !== 'professor') {
		throw redirect(303, '/auth/login?role=professor');
	}

	const { turmaId } = params;
	const db = getDb(platform);

	// Dados da Turma (garante que pertence ao professor)
	const turma = await db
		.prepare('SELECT id, name, header_image, pin, created_at FROM classrooms WHERE id = ? AND teacher_id = ?')
		.bind(turmaId, user.id)
		.first<{
			id: string;
			name: string;
			header_image: string | null;
			pin: string;
			created_at: string;
		}>();

	if (!turma) {
		throw error(404, 'Turma não encontrada ou acesso não autorizado.');
	}

	// Listas de exercícios da turma
	const lists = await db
		.prepare(
			`SELECT el.id, el.name, el.description, el.order_index, el.created_at,
              (SELECT COUNT(*) FROM exercises e WHERE e.list_id = el.id) as exercise_count
       FROM exercise_lists el
       WHERE el.classroom_id = ?
       ORDER BY el.order_index ASC, el.created_at ASC`
		)
		.bind(turmaId)
		.all<{
			id: string;
			name: string;
			description: string | null;
			order_index: number;
			created_at: string;
			exercise_count: number;
		}>();

	// Alunos matriculados na turma
	const students = await db
		.prepare(
			`SELECT u.id, u.name, u.email, ce.enrolled_at,
              (SELECT COUNT(DISTINCT s.exercise_id) FROM submissions s 
               JOIN exercises ex ON ex.id = s.exercise_id 
               JOIN exercise_lists el ON el.id = ex.list_id 
               WHERE el.classroom_id = ? AND s.student_id = u.id AND s.status = 'correct') as completed_exercises
       FROM classroom_enrollments ce
       JOIN users u ON u.id = ce.student_id
       WHERE ce.classroom_id = ?
       ORDER BY u.name ASC`
		)
		.bind(turmaId, turmaId)
		.all<{
			id: string;
			name: string;
			email: string;
			enrolled_at: string;
			completed_exercises: number;
		}>();

	return {
		turma,
		lists: lists.results || [],
		students: students.results || []
	};
};

export const actions: Actions = {
	createList: async ({ request, params, locals, platform }) => {
		const user = locals.user;
		if (!user || user.role !== 'professor') throw redirect(303, '/auth/login');

		const { turmaId } = params;
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;

		if (!name || name.length < 3) {
			return fail(400, { error: 'O nome da lista de exercícios deve ter pelo menos 3 caracteres.' });
		}

		const db = getDb(platform);
		const listId = crypto.randomUUID();

		await db
			.prepare(
				'INSERT INTO exercise_lists (id, classroom_id, name, description, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
			)
			.bind(listId, turmaId, name, description)
			.run();

		return { success: true, createdListId: listId };
	}
};
