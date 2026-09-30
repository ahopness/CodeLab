import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Não autorizado. Faça login para submeter sua resolução.' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { exercise_id, code, stdin, stdout, status } = body;

		if (!exercise_id || !code) {
			return json({ error: 'Dados da submissão incompletos.' }, { status: 400 });
		}

		const submissionStatus = status === 'correct' ? 'correct' : status === 'error' ? 'error' : 'wrong_answer';

		const db = getDb(platform);

		// Verifica se o aluno já possui uma submissão registrada para este exercício
		const existing = await db
			.prepare('SELECT id FROM submissions WHERE exercise_id = ? AND student_id = ?')
			.bind(exercise_id, user.id)
			.first<{ id: string }>();

		let submissionId: string;
		let updated = false;

		if (existing) {
			submissionId = existing.id;
			updated = true;
			await db
				.prepare(
					`UPDATE submissions 
					 SET code = ?, stdin = ?, stdout = ?, status = ?, submitted_at = datetime("now")
					 WHERE id = ?`
				)
				.bind(code, stdin || null, stdout || null, submissionStatus, submissionId)
				.run();
		} else {
			submissionId = crypto.randomUUID();
			await db
				.prepare(
					`INSERT INTO submissions (id, exercise_id, student_id, code, stdin, stdout, status, submitted_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))`
				)
				.bind(submissionId, exercise_id, user.id, code, stdin || null, stdout || null, submissionStatus)
				.run();
		}

		return json({
			success: true,
			submissionId,
			status: submissionStatus,
			updated
		});
	} catch (err: any) {
		console.error('[Submission API Error]:', err);
		return json({ error: err.message || 'Falha ao processar submissão.' }, { status: 500 });
	}
};
