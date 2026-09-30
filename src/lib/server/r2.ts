export interface UploadResult {
	key: string;
	url: string;
	contentType: string;
	size: number;
}

/**
 * Faz upload de um arquivo para o Cloudflare R2 (com fallback em memória para desenvolvimento)
 */
export async function uploadToR2(
	platform: App.Platform | undefined,
	file: File,
	prefix: 'headers' | 'videos' = 'headers'
): Promise<UploadResult> {
	const ext = file.name.split('.').pop() || 'bin';
	const uniqueId = crypto.randomUUID();
	const key = `${prefix}/${uniqueId}.${ext}`;
	const contentType = file.type || 'application/octet-stream';
	const arrayBuffer = await file.arrayBuffer();

	if (platform?.env?.R2) {
		// Upload nativo para o Cloudflare R2
		await platform.env.R2.put(key, arrayBuffer, {
			httpMetadata: {
				contentType: contentType
			}
		});

		return {
			key,
			url: `/api/files/${key}`,
			contentType,
			size: file.size
		};
	}

	// Fallback para desenvolvimento local sem R2 configurado:
	// Gera uma URL Base64 para visualização imediata no navegador sem dependências nativas
	const base64 = Buffer.from(arrayBuffer).toString('base64');
	const dataUrl = `data:${contentType};base64,${base64}`;

	return {
		key,
		url: dataUrl,
		contentType,
		size: file.size
	};
}

/**
 * Recupera um arquivo do Cloudflare R2
 */
export async function getFromR2(platform: App.Platform | undefined, key: string) {
	if (platform?.env?.R2) {
		return await platform.env.R2.get(key);
	}
	return null;
}
