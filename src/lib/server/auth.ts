import { getDb } from './db';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias em segundos

export async function hashToken(token: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(token);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateCryptoToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export function generatePin(): string {
	// PIN aleatório de 6 dígitos numéricos
	const num = Math.floor(100000 + Math.random() * 900000);
	return num.toString();
}

export async function createMagicLink(
	platform: App.Platform | undefined,
	userId: string
): Promise<{ rawToken: string; expiresAt: string }> {
	const db = getDb(platform);
	const rawToken = generateCryptoToken();
	const tokenHash = await hashToken(rawToken);

	const expiresDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
	const expiresAt = expiresDate.toISOString();
	const id = crypto.randomUUID();

	await db
		.prepare(
			'INSERT INTO magic_links (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
		)
		.bind(id, userId, tokenHash, expiresAt)
		.run();

	return { rawToken, expiresAt };
}

export async function verifyMagicLink(
	platform: App.Platform | undefined,
	rawToken: string
): Promise<{ user: { id: string; name: string; email: string; role: 'aluno' | 'professor' } | null }> {
	const db = getDb(platform);
	const tokenHash = await hashToken(rawToken);

	const link = await db
		.prepare(
			`SELECT ml.id, ml.user_id, ml.expires_at, ml.used_at, u.name, u.email, u.role 
       FROM magic_links ml 
       JOIN users u ON u.id = ml.user_id 
       WHERE ml.token_hash = ?`
		)
		.bind(tokenHash)
		.first<{
			id: string;
			user_id: string;
			expires_at: string;
			used_at: string | null;
			name: string;
			email: string;
			role: 'aluno' | 'professor';
		}>();

	if (!link) {
		return { user: null };
	}

	// Verifica se já foi usado
	if (link.used_at) {
		return { user: null };
	}

	// Verifica se expirou
	const now = new Date();
	const expires = new Date(link.expires_at);
	if (now > expires) {
		return { user: null };
	}

	// Marca o link como usado (uso único)
	await db
		.prepare('UPDATE magic_links SET used_at = datetime("now") WHERE id = ?')
		.bind(link.id)
		.run();

	return {
		user: {
			id: link.user_id,
			name: link.name,
			email: link.email,
			role: link.role
		}
	};
}

export async function createSession(
	platform: App.Platform | undefined,
	cookies: Cookies,
	userId: string
): Promise<string> {
	const db = getDb(platform);
	const sessionId = crypto.randomUUID();
	const expiresDate = new Date(Date.now() + SESSION_MAX_AGE * 1000);
	const expiresAt = expiresDate.toISOString();

	await db
		.prepare(
			'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))'
		)
		.bind(sessionId, userId, expiresAt)
		.run();

	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_MAX_AGE
	});

	return sessionId;
}

export async function getUserFromSession(
	platform: App.Platform | undefined,
	cookies: Cookies
): Promise<App.Locals['user']> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) return null;

	const db = getDb(platform);
	const session = await db
		.prepare(
			`SELECT s.id, s.expires_at, u.id as user_id, u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
		)
		.bind(sessionId)
		.first<{
			id: string;
			expires_at: string;
			user_id: string;
			name: string;
			email: string;
			role: 'aluno' | 'professor';
		}>();

	if (!session) return null;

	// Verifica expiração
	if (new Date() > new Date(session.expires_at)) {
		await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
		cookies.delete(SESSION_COOKIE, { path: '/' });
		return null;
	}

	return {
		id: session.user_id,
		name: session.name,
		email: session.email,
		role: session.role
	};
}

export async function destroySession(
	platform: App.Platform | undefined,
	cookies: Cookies
): Promise<void> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		const db = getDb(platform);
		await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
