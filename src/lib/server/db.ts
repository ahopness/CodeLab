import type { D1Database } from '@cloudflare/workers-types';

export interface StatementResult {
	first<T = any>(): Promise<T | null>;
	all<T = any>(): Promise<{ results: T[] }>;
	run(): Promise<{ success: boolean; meta?: any }>;
}

export interface PreparedStatement extends StatementResult {
	bind(...params: any[]): StatementResult;
}

export interface DatabaseClient {
	prepare(query: string): PreparedStatement;
}

// Declarações individuais para evitar problemas de split de string em d1.exec()
const SCHEMA_STATEMENTS = [
	`CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		role TEXT NOT NULL CHECK (role IN ('aluno', 'professor')),
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS magic_links (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		token_hash TEXT NOT NULL UNIQUE,
		expires_at TEXT NOT NULL,
		used_at TEXT,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		expires_at TEXT NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS classrooms (
		id TEXT PRIMARY KEY,
		teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		name TEXT NOT NULL,
		header_image TEXT,
		pin TEXT NOT NULL UNIQUE,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS classroom_enrollments (
		id TEXT PRIMARY KEY,
		classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
		student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
		UNIQUE(classroom_id, student_id)
	)`,
	`CREATE TABLE IF NOT EXISTS exercise_lists (
		id TEXT PRIMARY KEY,
		classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
		name TEXT NOT NULL,
		description TEXT,
		order_index INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS exercises (
		id TEXT PRIMARY KEY,
		list_id TEXT NOT NULL REFERENCES exercise_lists(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		description TEXT NOT NULL,
		initial_code TEXT,
		test_input TEXT,
		expected_output TEXT NOT NULL,
		video_link TEXT,
		order_index INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS submissions (
		id TEXT PRIMARY KEY,
		exercise_id TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
		student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		code TEXT NOT NULL,
		stdin TEXT,
		stdout TEXT,
		status TEXT NOT NULL CHECK (status IN ('correct', 'wrong_answer', 'error')),
		submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE TABLE IF NOT EXISTS feedbacks (
		id TEXT PRIMARY KEY,
		submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
		teacher_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		feedback_text TEXT NOT NULL,
		sent_to_email TEXT NOT NULL,
		sent_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`,
	`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
	`CREATE INDEX IF NOT EXISTS idx_magic_links_hash ON magic_links(token_hash)`,
	`CREATE INDEX IF NOT EXISTS idx_classrooms_pin ON classrooms(pin)`,
	`CREATE INDEX IF NOT EXISTS idx_classroom_enrollments_student ON classroom_enrollments(student_id)`,
	`CREATE INDEX IF NOT EXISTS idx_exercise_lists_classroom ON exercise_lists(classroom_id)`,
	`CREATE INDEX IF NOT EXISTS idx_exercises_list ON exercises(list_id)`,
	`CREATE INDEX IF NOT EXISTS idx_submissions_exercise ON submissions(exercise_id)`,
	`CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id)`,
	`CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_student_exercise ON submissions(student_id, exercise_id)`
];

let d1BootstrapPromise: Promise<void> | null = null;

async function ensureD1Tables(d1: D1Database): Promise<void> {
	if (!d1BootstrapPromise) {
		d1BootstrapPromise = (async () => {
			for (const stmt of SCHEMA_STATEMENTS) {
				try {
					await d1.prepare(stmt).run();
				} catch (err: any) {
					// Ignora se o índice ou tabela já existe
					if (!err?.message?.includes('already exists')) {
						console.error('[D1 Bootstrap Statement Error]:', err);
					}
				}
			}
		})().catch((err) => {
			d1BootstrapPromise = null;
			throw err;
		});
	}
	return d1BootstrapPromise;
}

// Armazenamento em memória para desenvolvimento local isolado
interface MemoryDb {
	users: any[];
	magic_links: any[];
	sessions: any[];
	classrooms: any[];
	classroom_enrollments: any[];
	exercise_lists: any[];
	exercises: any[];
	submissions: any[];
	feedbacks: any[];
}

const memoryDb: MemoryDb = {
	users: [
		{
			id: 'prof-demo-id',
			name: 'Professor Coordenador',
			email: 'professor@universidade.br',
			role: 'professor',
			created_at: new Date().toISOString()
		},
		{
			id: 'aluno-demo-id',
			name: 'Aluno Monitoria',
			email: 'aluno@universidade.br',
			role: 'aluno',
			created_at: new Date().toISOString()
		}
	],
	magic_links: [],
	sessions: [],
	classrooms: [
		{
			id: 'turma-demo-id',
			teacher_id: 'prof-demo-id',
			name: 'Introdução à Programação 2026.1 - Turma C99',
			header_image: null,
			pin: '123456',
			created_at: new Date().toISOString()
		}
	],
	classroom_enrollments: [
		{
			id: 'enroll-demo-id',
			classroom_id: 'turma-demo-id',
			student_id: 'aluno-demo-id',
			enrolled_at: new Date().toISOString()
		}
	],
	exercise_lists: [
		{
			id: 'lista-demo-id',
			classroom_id: 'turma-demo-id',
			name: 'Lista 01: Primeiros Passos em C99',
			description: 'Exercícios práticos de leitura com scanf e impressão formatada com printf.',
			order_index: 1,
			created_at: new Date().toISOString()
		}
	],
	exercises: [
		{
			id: 'ex-demo-1',
			list_id: 'lista-demo-id',
			title: 'Média Aritmética de Dois Números',
			description:
				'Escreva um programa em C99 que leia dois números inteiros da entrada padrão e calcule sua média. A saída deve seguir rigorosamente o formato:\n\nMedia = X.XX\n(com 2 casas decimais)',
			initial_code: `#include <stdio.h>\n\nint main() {\n    int a, b;\n    if (scanf("%d %d", &a, &b) == 2) {\n        float media = (a + b) / 2.0;\n        printf("Media = %.2f\\n", media);\n    }\n    return 0;\n}\n`,
			test_input: '10 20',
			expected_output: 'Media = 15.00',
			video_link: null,
			order_index: 1,
			created_at: new Date().toISOString()
		},
		{
			id: 'ex-demo-2',
			list_id: 'lista-demo-id',
			title: 'Par ou Ímpar',
			description:
				'Leia um número inteiro da entrada padrão e imprima se ele é "PAR" ou "IMPAR".\n\nExemplo de saída:\n8 e PAR\nou\n7 e IMPAR',
			initial_code: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) == 1) {\n        if (n % 2 == 0) {\n            printf("%d e PAR\\n", n);\n        } else {\n            printf("%d e IMPAR\\n", n);\n        }\n    }\n    return 0;\n}\n`,
			test_input: '8',
			expected_output: '8 e PAR',
			video_link: null,
			order_index: 2,
			created_at: new Date().toISOString()
		}
	],
	submissions: [],
	feedbacks: []
};

/**
 * Retorna o cliente do banco de dados:
 * - Em Cloudflare Pages (com binding DB), executa D1 e garante tabelas automaticamente
 * - Em desenvolvimento local isolado, utiliza o fallback em memória
 */
export function getDb(platform?: App.Platform): DatabaseClient {
	if (platform?.env?.DB) {
		const d1 = platform.env.DB;
		return {
			prepare(query: string) {
				const createStatement = (params: any[]): StatementResult => ({
					async first<T = any>(): Promise<T | null> {
						try {
							return await d1.prepare(query).bind(...params).first<T>();
						} catch (err: any) {
							if (err?.message?.includes('no such table') || String(err).includes('SQLITE_ERROR')) {
								await ensureD1Tables(d1);
								return await d1.prepare(query).bind(...params).first<T>();
							}
							throw err;
						}
					},
					async all<T = any>(): Promise<{ results: T[] }> {
						try {
							const res = await d1.prepare(query).bind(...params).all<T>();
							return { results: res.results || [] };
						} catch (err: any) {
							if (err?.message?.includes('no such table') || String(err).includes('SQLITE_ERROR')) {
								await ensureD1Tables(d1);
								const res = await d1.prepare(query).bind(...params).all<T>();
								return { results: res.results || [] };
							}
							throw err;
						}
					},
					async run(): Promise<{ success: boolean; meta?: any }> {
						try {
							const res = await d1.prepare(query).bind(...params).run();
							return { success: res.success, meta: res.meta };
						} catch (err: any) {
							if (err?.message?.includes('no such table') || String(err).includes('SQLITE_ERROR')) {
								await ensureD1Tables(d1);
								const res = await d1.prepare(query).bind(...params).run();
								return { success: res.success, meta: res.meta };
							}
							throw err;
						}
					}
				});

				return {
					bind(...params: any[]) {
						return createStatement(params);
					},
					...createStatement([])
				};
			}
		};
	}

	// Fallback em memória para desenvolvimento
	return {
		prepare(query: string) {
			const createStatement = (params: any[]): StatementResult => ({
				async first<T = any>(): Promise<T | null> {
					const results = executeMemoryQuery(query, params);
					return results.length > 0 ? (results[0] as T) : null;
				},
				async all<T = any>(): Promise<{ results: T[] }> {
					const results = executeMemoryQuery(query, params);
					return { results: results as T[] };
				},
				async run(): Promise<{ success: boolean; meta?: any }> {
					executeMemoryMutation(query, params);
					return { success: true };
				}
			});

			return {
				bind(...params: any[]) {
					return createStatement(params);
				},
				...createStatement([])
			};
		}
	};
}

function executeMemoryQuery(query: string, params: any[]): any[] {
	const q = query.trim().toUpperCase();

	// 1. SELECT FROM users WHERE email = ?
	if (q.includes('FROM USERS WHERE EMAIL = ?')) {
		const email = params[0]?.toLowerCase();
		return memoryDb.users.filter((u) => u.email.toLowerCase() === email);
	}

	// 2. SELECT FROM magic_links WHERE token_hash = ?
	if (q.includes('FROM MAGIC_LINKS ML') && q.includes('TOKEN_HASH = ?')) {
		const hash = params[0];
		const link = memoryDb.magic_links.find((l) => l.token_hash === hash);
		if (!link) return [];
		const user = memoryDb.users.find((u) => u.id === link.user_id);
		return [
			{
				id: link.id,
				user_id: link.user_id,
				expires_at: link.expires_at,
				used_at: link.used_at,
				name: user?.name,
				email: user?.email,
				role: user?.role
			}
		];
	}

	// 3. SELECT FROM sessions WHERE id = ?
	if (q.includes('FROM SESSIONS S') && q.includes('WHERE S.ID = ?')) {
		const sessId = params[0];
		const s = memoryDb.sessions.find((x) => x.id === sessId);
		if (!s) return [];
		const user = memoryDb.users.find((u) => u.id === s.user_id);
		return [
			{
				id: s.id,
				expires_at: s.expires_at,
				user_id: s.user_id,
				name: user?.name,
				email: user?.email,
				role: user?.role
			}
		];
	}

	// 4. SELECT FROM classrooms WHERE pin = ?
	if (q.includes('FROM CLASSROOMS WHERE PIN = ?')) {
		const pin = params[0];
		return memoryDb.classrooms.filter((c) => c.pin === pin);
	}

	// 5. SELECT FROM classrooms WHERE id = ? AND teacher_id = ?
	if (q.includes('FROM CLASSROOMS WHERE ID = ? AND TEACHER_ID = ?')) {
		const [id, teacherId] = params;
		return memoryDb.classrooms.filter((c) => c.id === id && c.teacher_id === teacherId);
	}

	// 6. SELECT FROM classrooms WHERE id = ?
	if (q.includes('FROM CLASSROOMS C') && q.includes('WHERE C.ID = ?')) {
		const id = params[0];
		const c = memoryDb.classrooms.find((x) => x.id === id);
		if (!c) return [];
		const teacher = memoryDb.users.find((u) => u.id === c.teacher_id);
		return [
			{
				...c,
				teacher_name: teacher?.name || 'Professor'
			}
		];
	}

	// 7. SELECT FROM classrooms WHERE teacher_id = ?
	if (q.includes('FROM CLASSROOMS C') && q.includes('WHERE C.TEACHER_ID = ?')) {
		const teacherId = params[0];
		return memoryDb.classrooms
			.filter((c) => c.teacher_id === teacherId)
			.map((c) => ({
				...c,
				student_count: memoryDb.classroom_enrollments.filter((e) => e.classroom_id === c.id).length,
				list_count: memoryDb.exercise_lists.filter((l) => l.classroom_id === c.id).length
			}));
	}

	// 8. SELECT FROM classroom_enrollments WHERE student_id = ?
	if (q.includes('FROM CLASSROOM_ENROLLMENTS CE') && q.includes('WHERE CE.STUDENT_ID = ?')) {
		const studentId = params[0];
		const enrolls = memoryDb.classroom_enrollments.filter((e) => e.student_id === studentId);
		return enrolls.map((e) => {
			const c = memoryDb.classrooms.find((x) => x.id === e.classroom_id) || {};
			const teacher = memoryDb.users.find((u) => u.id === c.teacher_id);
			const listCount = memoryDb.exercise_lists.filter((l) => l.classroom_id === c.id).length;
			return {
				id: c.id,
				name: c.name,
				header_image: c.header_image,
				pin: c.pin,
				teacher_name: teacher?.name || 'Professor',
				enrolled_at: e.enrolled_at,
				list_count: listCount
			};
		});
	}

	// 9. SELECT FROM classroom_enrollments WHERE classroom_id = ? AND student_id = ?
	if (q.includes('FROM CLASSROOM_ENROLLMENTS WHERE CLASSROOM_ID = ? AND STUDENT_ID = ?')) {
		const [cId, sId] = params;
		return memoryDb.classroom_enrollments.filter(
			(e) => e.classroom_id === cId && e.student_id === sId
		);
	}

	// 10. SELECT students enrolled in classroom
	if (q.includes('FROM CLASSROOM_ENROLLMENTS CE') && q.includes('WHERE CE.CLASSROOM_ID = ?')) {
		const cId = params[0];
		const enrolls = memoryDb.classroom_enrollments.filter((e) => e.classroom_id === cId);
		return enrolls.map((e) => {
			const student = memoryDb.users.find((u) => u.id === e.student_id);
			return {
				id: student?.id,
				name: student?.name,
				email: student?.email,
				enrolled_at: e.enrolled_at,
				completed_exercises: memoryDb.submissions.filter(
					(s) => s.student_id === student?.id && s.status === 'correct'
				).length
			};
		});
	}

	// 11. SELECT FROM exercise_lists WHERE classroom_id = ?
	if (q.includes('FROM EXERCISE_LISTS EL') && q.includes('WHERE EL.CLASSROOM_ID = ?')) {
		const cId = params[0];
		return memoryDb.exercise_lists
			.filter((l) => l.classroom_id === cId)
			.map((l) => ({
				...l,
				exercise_count: memoryDb.exercises.filter((ex) => ex.list_id === l.id).length
			}));
	}

	// 12. SELECT FROM exercise_lists WHERE id = ?
	if (q.includes('FROM EXERCISE_LISTS WHERE ID = ?')) {
		const id = params[0];
		return memoryDb.exercise_lists.filter((l) => l.id === id);
	}

	// 13. SELECT FROM exercises WHERE list_id = ?
	if (q.includes('FROM EXERCISES E') && q.includes('WHERE E.LIST_ID = ?')) {
		const listId = params[0];
		return memoryDb.exercises
			.filter((ex) => ex.list_id === listId)
			.map((ex) => ({
				...ex,
				submission_count: memoryDb.submissions.filter((s) => s.exercise_id === ex.id).length,
				solved_students_count: new Set(
					memoryDb.submissions
						.filter((s) => s.exercise_id === ex.id && s.status === 'correct')
						.map((s) => s.student_id)
				).size
			}));
	}

	// 14. SELECT single exercise with classroom info
	if (q.includes('FROM EXERCISES E') && q.includes('WHERE E.ID = ?')) {
		const id = params[0];
		const ex = memoryDb.exercises.find((x) => x.id === id);
		if (!ex) return [];
		const list = memoryDb.exercise_lists.find((l) => l.id === ex.list_id);
		const c = memoryDb.classrooms.find((cl) => cl.id === list?.classroom_id);
		return [
			{
				...ex,
				list_name: list?.name,
				classroom_id: c?.id,
				classroom_name: c?.name
			}
		];
	}

	// 15. SELECT submissions of student in list
	if (q.includes('FROM SUBMISSIONS S') && q.includes('WHERE E.LIST_ID = ? AND S.STUDENT_ID = ?')) {
		const [listId, studentId] = params;
		const exIds = memoryDb.exercises.filter((ex) => ex.list_id === listId).map((ex) => ex.id);
		return memoryDb.submissions
			.filter((s) => exIds.includes(s.exercise_id) && s.student_id === studentId)
			.map((s) => {
				const fb = memoryDb.feedbacks
					.filter((f) => f.submission_id === s.id)
					.sort((a, b) => b.sent_at.localeCompare(a.sent_at))[0];
				return {
					...s,
					feedback_text: fb?.feedback_text || null
				};
			});
	}

	// 16. SELECT submissions for exercise
	if (q.includes('FROM SUBMISSIONS S') && q.includes('WHERE S.EXERCISE_ID = ?')) {
		const exId = params[0];
		return memoryDb.submissions
			.filter((s) => s.exercise_id === exId)
			.map((s) => {
				const u = memoryDb.users.find((usr) => usr.id === s.student_id);
				const fb = memoryDb.feedbacks.find((f) => f.submission_id === s.id);
				return {
					...s,
					student_name: u?.name || 'Estudante',
					student_email: u?.email || '',
					feedback_id: fb?.id || null,
					feedback_text: fb?.feedback_text || null,
					feedback_sent_at: fb?.sent_at || null
				};
			});
	}

	return [];
}

function executeMemoryMutation(query: string, params: any[]) {
	const q = query.trim().toUpperCase();

	// INSERT INTO users
	if (q.startsWith('INSERT INTO USERS')) {
		const [id, name, email, role] = params;
		memoryDb.users.push({ id, name, email, role, created_at: new Date().toISOString() });
	}

	// INSERT INTO magic_links
	else if (q.startsWith('INSERT INTO MAGIC_LINKS')) {
		const [id, user_id, token_hash, expires_at] = params;
		memoryDb.magic_links.push({
			id,
			user_id,
			token_hash,
			expires_at,
			used_at: null,
			created_at: new Date().toISOString()
		});
	}

	// UPDATE magic_links SET used_at = ...
	else if (q.startsWith('UPDATE MAGIC_LINKS SET USED_AT')) {
		const [id] = params;
		const link = memoryDb.magic_links.find((l) => l.id === id);
		if (link) link.used_at = new Date().toISOString();
	}

	// INSERT INTO sessions
	else if (q.startsWith('INSERT INTO SESSIONS')) {
		const [id, user_id, expires_at] = params;
		memoryDb.sessions.push({ id, user_id, expires_at, created_at: new Date().toISOString() });
	}

	// DELETE FROM sessions WHERE id = ?
	else if (q.startsWith('DELETE FROM SESSIONS WHERE ID = ?')) {
		const [id] = params;
		memoryDb.sessions = memoryDb.sessions.filter((s) => s.id !== id);
	}

	// DELETE FROM users WHERE id = ?
	else if (q.startsWith('DELETE FROM USERS WHERE ID = ?')) {
		const [id] = params;
		memoryDb.users = memoryDb.users.filter((u) => u.id !== id);
		memoryDb.sessions = memoryDb.sessions.filter((s) => s.user_id !== id);
		memoryDb.magic_links = memoryDb.magic_links.filter((m) => m.user_id !== id);
		memoryDb.classroom_enrollments = memoryDb.classroom_enrollments.filter((ce) => ce.student_id !== id);
		const teacherClassrooms = memoryDb.classrooms.filter((c) => c.teacher_id === id).map((c) => c.id);
		memoryDb.classrooms = memoryDb.classrooms.filter((c) => c.teacher_id !== id);
		memoryDb.classroom_enrollments = memoryDb.classroom_enrollments.filter((ce) => !teacherClassrooms.includes(ce.classroom_id));
		const lists = memoryDb.exercise_lists.filter((el) => teacherClassrooms.includes(el.classroom_id)).map((el) => el.id);
		memoryDb.exercise_lists = memoryDb.exercise_lists.filter((el) => !teacherClassrooms.includes(el.classroom_id));
		const exIds = memoryDb.exercises.filter((ex) => lists.includes(ex.list_id)).map((ex) => ex.id);
		memoryDb.exercises = memoryDb.exercises.filter((ex) => !lists.includes(ex.list_id));
		const subIds = memoryDb.submissions.filter((s) => s.student_id === id || exIds.includes(s.exercise_id)).map((s) => s.id);
		memoryDb.submissions = memoryDb.submissions.filter((s) => s.student_id !== id && !exIds.includes(s.exercise_id));
		memoryDb.feedbacks = memoryDb.feedbacks.filter((f) => f.teacher_id !== id && !subIds.includes(f.submission_id));
	}

	// INSERT INTO classrooms
	else if (q.startsWith('INSERT INTO CLASSROOMS')) {
		const [id, teacher_id, name, header_image, pin] = params;
		memoryDb.classrooms.push({
			id,
			teacher_id,
			name,
			header_image,
			pin,
			created_at: new Date().toISOString()
		});
	}

	// INSERT INTO classroom_enrollments
	else if (q.startsWith('INSERT INTO CLASSROOM_ENROLLMENTS')) {
		const [id, classroom_id, student_id] = params;
		memoryDb.classroom_enrollments.push({
			id,
			classroom_id,
			student_id,
			enrolled_at: new Date().toISOString()
		});
	}

	// INSERT INTO exercise_lists
	else if (q.startsWith('INSERT INTO EXERCISE_LISTS')) {
		const [id, classroom_id, name, description] = params;
		memoryDb.exercise_lists.push({
			id,
			classroom_id,
			name,
			description,
			order_index: memoryDb.exercise_lists.length + 1,
			created_at: new Date().toISOString()
		});
	}

	// INSERT INTO exercises
	else if (q.startsWith('INSERT INTO EXERCISES')) {
		const [
			id,
			list_id,
			title,
			description,
			initial_code,
			test_input,
			expected_output,
			video_link,
			order_index
		] = params;
		memoryDb.exercises.push({
			id,
			list_id,
			title,
			description,
			initial_code,
			test_input,
			expected_output,
			video_link,
			order_index,
			created_at: new Date().toISOString()
		});
	}

	// UPDATE exercises
	else if (q.startsWith('UPDATE EXERCISES')) {
		const [title, description, expected_output, test_input, initial_code, video_link, id] = params;
		const ex = memoryDb.exercises.find((x) => x.id === id);
		if (ex) {
			ex.title = title;
			ex.description = description;
			ex.expected_output = expected_output;
			ex.test_input = test_input;
			ex.initial_code = initial_code;
			ex.video_link = video_link;
		}
	}

	// UPDATE submissions
	else if (q.startsWith('UPDATE SUBMISSIONS')) {
		const [code, stdin, stdout, status, id] = params;
		const sub = memoryDb.submissions.find((s) => s.id === id);
		if (sub) {
			sub.code = code;
			sub.stdin = stdin;
			sub.stdout = stdout;
			sub.status = status;
			sub.submitted_at = new Date().toISOString();
		}
	}

	// INSERT INTO submissions
	else if (q.startsWith('INSERT INTO SUBMISSIONS')) {
		const [id, exercise_id, student_id, code, stdin, stdout, status] = params;
		memoryDb.submissions.push({
			id,
			exercise_id,
			student_id,
			code,
			stdin,
			stdout,
			status,
			submitted_at: new Date().toISOString()
		});
	}

	// INSERT INTO feedbacks
	else if (q.startsWith('INSERT INTO FEEDBACKS')) {
		const [id, submission_id, teacher_id, feedback_text, sent_to_email] = params;
		memoryDb.feedbacks.push({
			id,
			submission_id,
			teacher_id,
			feedback_text,
			sent_to_email,
			sent_at: new Date().toISOString()
		});
	}
}
