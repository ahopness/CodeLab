import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const user = locals.user;
	if (!user) throw redirect(303, '/auth/login');
	if (user.role === 'professor') {
		throw redirect(303, '/professor');
	}

	const db = getDb(platform);

	// Turmas em que o aluno está matriculado
	const enrolled = await db
		.prepare(
			`SELECT c.id, c.name, c.header_image, c.pin, u.name as teacher_name, ce.enrolled_at,
              (SELECT COUNT(*) FROM exercise_lists el WHERE el.classroom_id = c.id) as list_count
       FROM classroom_enrollments ce
       JOIN classrooms c ON c.id = ce.classroom_id
       JOIN users u ON u.id = c.teacher_id
       WHERE ce.student_id = ?
       ORDER BY ce.enrolled_at DESC`
		)
		.bind(user.id)
		.all<{
			id: string;
			name: string;
			header_image: string | null;
			pin: string;
			teacher_name: string;
			enrolled_at: string;
			list_count: number;
		}>();

	return {
		enrolledTurmas: enrolled.results || []
	};
};

export const actions: Actions = {
	enroll: async ({ request, locals, platform }) => {
		const user = locals.user;
		if (!user) throw redirect(303, '/auth/login');

		const formData = await request.formData();
		const rawPin = formData.get('pin')?.toString() || '';
		const pin = rawPin.replace(/\D/g, '').trim();

		if (!pin || pin.length !== 6) {
			return fail(400, { error: 'O PIN da turma deve ser composto por exatamente 6 números.', pin });
		}

		const db = getDb(platform);

		// Busca turma pelo PIN
		const classroom = await db
			.prepare('SELECT id, name FROM classrooms WHERE pin = ?')
			.bind(pin)
			.first<{ id: string; name: string }>();

		if (!classroom) {
			return fail(404, {
				error: 'Nenhuma turma foi encontrada com este PIN. Confirme o código com seu professor.',
				pin
			});
		}

		// Verifica se já está matriculado
		const existing = await db
			.prepare('SELECT id FROM classroom_enrollments WHERE classroom_id = ? AND student_id = ?')
			.bind(classroom.id, user.id)
			.first<{ id: string }>();

		if (!existing) {
			const enrollmentId = crypto.randomUUID();
			await db
				.prepare(
					'INSERT INTO classroom_enrollments (id, classroom_id, student_id, enrolled_at) VALUES (?, ?, ?, datetime("now"))'
				)
				.bind(enrollmentId, classroom.id, user.id)
				.run();
		}

		// Redireciona diretamente para a turma inscrita
		throw redirect(303, `/turmas/${classroom.id}`);
	}
};
