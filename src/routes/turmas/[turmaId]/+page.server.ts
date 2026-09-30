import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const user = locals.user;
	if (!user) throw redirect(303, '/auth/login');

	const { turmaId } = params;
	const db = getDb(platform);

	// Dados da turma
	const turma = await db
		.prepare(
			`SELECT c.id, c.name, c.header_image, c.pin, c.created_at, u.name as teacher_name
       FROM classrooms c
       JOIN users u ON u.id = c.teacher_id
       WHERE c.id = ?`
		)
		.bind(turmaId)
		.first<{
			id: string;
			name: string;
			header_image: string | null;
			pin: string;
			created_at: string;
			teacher_name: string;
		}>();

	if (!turma) {
		throw error(404, 'Turma não encontrada.');
	}

	// Listas de exercícios da turma com contagem de questões
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

	return {
		turma,
		lists: lists.results || []
	};
};
