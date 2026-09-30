import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				name: string;
				email: string;
				role: 'aluno' | 'professor';
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				R2: R2Bucket;
				APP_URL?: string;
				RESEND_API_KEY?: string;
				RESEND_FROM_EMAIL?: string;
				AUTH_SECRET?: string;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
