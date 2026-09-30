import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const user = locals.user;
	if (!user) throw redirect(303, '/auth/login');

	const { turmaId, listaId } = params;
	const db = getDb(platform);

	// Dados da Turma
	const turma = await db
		.prepare('SELECT id, name, pin, teacher_id FROM classrooms WHERE id = ?')
		.bind(turmaId)
		.first<{ id: string; name: string; pin: string; teacher_id: string }>();

	if (!turma) throw error(404, 'Turma não encontrada.');

	// Dados da Lista
	const list = await db
		.prepare('SELECT id, name, description FROM exercise_lists WHERE id = ? AND classroom_id = ?')
		.bind(listaId, turmaId)
		.first<{ id: string; name: string; description: string | null }>();

	if (!list) throw error(404, 'Lista de exercícios não encontrada.');

	// Questões da Lista
	const exercises = await db
		.prepare(
			`SELECT id, list_id, title, description, initial_code, test_input, expected_output, video_link, order_index
       FROM exercises
       WHERE list_id = ?
       ORDER BY order_index ASC, created_at ASC`
		)
		.bind(listaId)
		.all<{
			id: string;
			list_id: string;
			title: string;
			description: string;
			initial_code: string | null;
			test_input: string | null;
			expected_output: string;
			video_link: string | null;
			order_index: number;
		}>();

	// Submissões anteriores do aluno nesta lista
	const submissions = await db
		.prepare(
			`SELECT s.id, s.exercise_id, s.code, s.stdin, s.stdout, s.status, s.submitted_at,
              (SELECT f.feedback_text FROM feedbacks f WHERE f.submission_id = s.id ORDER BY f.sent_at DESC LIMIT 1) as feedback_text
       FROM submissions s
       JOIN exercises e ON e.id = s.exercise_id
       WHERE e.list_id = ? AND s.student_id = ?
       ORDER BY s.submitted_at DESC`
		)
		.bind(listaId, user.id)
		.all<{
			id: string;
			exercise_id: string;
			code: string;
			stdin: string | null;
			stdout: string | null;
			status: string;
			submitted_at: string;
			feedback_text: string | null;
		}>();

	return {
		turma,
		list,
		exercises: exercises.results || [],
		submissions: submissions.results || []
	};
};
