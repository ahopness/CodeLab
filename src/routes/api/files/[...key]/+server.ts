import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFromR2 } from '$lib/server/r2';

export const GET: RequestHandler = async ({ params, platform }) => {
	const key = params.key;
	if (!key) throw error(400, 'Chave de arquivo não informada.');

	if (platform?.env?.R2) {
		const object = await getFromR2(platform, key);
		if (object) {
			const headers = new Headers();
			const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
			headers.set('content-type', contentType);

			if (object.httpMetadata?.contentDisposition) {
				headers.set('content-disposition', object.httpMetadata.contentDisposition);
			}
			if (object.httpMetadata?.contentEncoding) {
				headers.set('content-encoding', object.httpMetadata.contentEncoding);
			}
			if (object.httpMetadata?.contentLanguage) {
				headers.set('content-language', object.httpMetadata.contentLanguage);
			}
			if (object.httpEtag) {
				headers.set('etag', object.httpEtag);
			}
			headers.set('cache-control', object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable');

			return new Response(object.body as any, { headers });
		}
	}

	throw error(404, 'Arquivo não encontrado.');
};
