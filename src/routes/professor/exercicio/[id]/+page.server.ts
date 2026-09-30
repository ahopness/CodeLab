import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { uploadToR2 } from '$lib/server/r2';
import { sendFeedbackEmail } from '$lib/server/email';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const user = locals.user;
	if (!user || user.role !== 'professor') {
		throw redirect(303, '/auth/login?role=professor');
	}

	const { id } = params;
	const db = getDb(platform);

	// Dados do Exercício com verificação de autoria da turma
	const exercise = await db
		.prepare(
			`SELECT e.id, e.list_id, e.title, e.description, e.initial_code, e.test_input, e.expected_output, e.video_link, e.order_index,
              el.name as list_name, el.id as list_id, c.id as classroom_id, c.name as classroom_name
       FROM exercises e
       JOIN exercise_lists el ON el.id = e.list_id
       JOIN classrooms c ON c.id = el.classroom_id
       WHERE e.id = ? AND c.teacher_id = ?`
		)
		.bind(id, user.id)
		.first<{
			id: string;
			list_id: string;
			title: string;
			description: string;
			initial_code: string | null;
			test_input: string | null;
			expected_output: string;
			video_link: string | null;
			order_index: number;
			list_name: string;
			classroom_id: string;
			classroom_name: string;
		}>();

	if (!exercise) {
		throw error(404, 'Exercício não encontrado ou você não tem permissão para editá-lo.');
	}

	// Submissões de código dos alunos para este exercício
	const submissions = await db
		.prepare(
			`SELECT s.id, s.student_id, u.name as student_name, u.email as student_email,
              s.code, s.stdin, s.stdout, s.status, s.submitted_at,
              f.id as feedback_id, f.feedback_text, f.sent_at as feedback_sent_at
       FROM submissions s
       JOIN users u ON u.id = s.student_id
       LEFT JOIN feedbacks f ON f.submission_id = s.id
       WHERE s.exercise_id = ?
       ORDER BY s.submitted_at DESC`
		)
		.bind(id)
		.all<{
			id: string;
			student_id: string;
			student_name: string;
			student_email: string;
			code: string;
			stdin: string | null;
			stdout: string | null;
			status: string;
			submitted_at: string;
			feedback_id: string | null;
			feedback_text: string | null;
			feedback_sent_at: string | null;
		}>();

	return {
		exercise,
		submissions: submissions.results || []
	};
};

export const actions: Actions = {
	updateExercise: async ({ request, params, locals, platform }) => {
		const user = locals.user;
		if (!user || user.role !== 'professor') throw redirect(303, '/auth/login');

		const { id } = params;
		const formData = await request.formData();

		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim();
		const expected_output = formData.get('expected_output')?.toString().trim();
		const test_input = formData.get('test_input')?.toString().trim() || null;
		const initial_code = formData.get('initial_code')?.toString().trim() || null;
		let video_link = formData.get('video_link')?.toString().trim() || null;
		const videoFile = formData.get('video_file') as File | null;

		if (!title || !description || !expected_output) {
			return fail(400, { error: 'Título, enunciado e output esperado são campos obrigatórios.' });
		}

		if (videoFile && videoFile.size > 0 && videoFile.name) {
			try {
				const upload = await uploadToR2(platform, videoFile, 'videos');
				video_link = upload.url;
			} catch (err: any) {
				console.error('Falha no upload do vídeo para o R2:', err);
			}
		}

		const db = getDb(platform);
		await db
			.prepare(
				`UPDATE exercises 
         SET title = ?, description = ?, expected_output = ?, test_input = ?, initial_code = ?, video_link = ?
         WHERE id = ?`
			)
			.bind(title, description, expected_output, test_input, initial_code, video_link, id)
			.run();

		return { success: true, updated: true };
	},

	sendFeedback: async ({ request, params, locals, platform }) => {
		const user = locals.user;
		if (!user || user.role !== 'professor') throw redirect(303, '/auth/login');

		const { id } = params;
		const formData = await request.formData();

		const submissionId = formData.get('submission_id')?.toString().trim();
		const studentEmail = formData.get('student_email')?.toString().trim();
		const studentName = formData.get('student_name')?.toString().trim();
		const exerciseTitle = formData.get('exercise_title')?.toString().trim();
		const feedbackText = formData.get('feedback_text')?.toString().trim();
		const studentCode = formData.get('student_code')?.toString();

		if (!submissionId || !studentEmail || !feedbackText) {
			return fail(400, { error: 'O texto do feedback é obrigatório.' });
		}

		const db = getDb(platform);
		const feedbackId = crypto.randomUUID();

		// Salva no banco de dados D1
		await db
			.prepare(
				`INSERT INTO feedbacks (id, submission_id, teacher_id, feedback_text, sent_to_email, sent_at)
         VALUES (?, ?, ?, ?, ?, datetime("now"))`
			)
			.bind(feedbackId, submissionId, user.id, feedbackText, studentEmail)
			.run();

		// Dispara o e-mail via Resend
		const apiKey = platform?.env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
		const fromEmail = platform?.env?.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
		const emailResult = await sendFeedbackEmail(
			studentEmail,
			studentName || 'Estudante',
			exerciseTitle || 'Exercício C99',
			user.name,
			feedbackText,
			studentCode,
			apiKey,
			fromEmail
		);

		return {
			success: true,
			feedbackSent: true,
			simulated: emailResult.simulated,
			submissionId
		};
	}
};
