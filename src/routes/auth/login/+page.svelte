<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let selectedRole = $state('aluno');
	$effect(() => {
		if (data.defaultRole) {
			selectedRole = data.defaultRole;
		}
	});
	let isSubmitting = $state(false);
</script>

<div class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<!-- Cabeçalho do Formulário -->
		<div class="text-center">
			<a href="/" class="inline-flex items-center gap-2 mb-6">
				<img src="/logo.png" alt="Logo" class="w-8 h-8 object-contain" />
				<span class="font-serif text-2xl font-bold tracking-tight text-zinc-900">CodeLab</span>
			</a>
			<h2 class="font-serif text-3xl font-normal text-zinc-900">
				Acesso sem senhas
			</h2>
			<p class="mt-2 text-sm text-zinc-600">
				Informe seu e-mail para receber um link de acesso instantâneo.
			</p>
		</div>

		{#if form?.success}
			<!-- Estado de Sucesso: Link Enviado -->
			<div class="bg-white hairline-all p-6 space-y-4">
				<div class="flex items-center gap-3 text-emerald-800">
					<img src="/icons/icon_note.png" alt="" class="w-5 h-5 object-contain" />
					<h3 class="font-serif text-lg font-semibold">Link de acesso emitido!</h3>
				</div>
				<p class="text-sm text-zinc-700 leading-relaxed">
					Enviamos o link de autenticação para <strong>{form.email}</strong>. Ele expira em 15 minutos.
				</p>

				{#if form.simulatedUrl}
					<!-- Atalho para Ambiente Local de Desenvolvimento -->
					<div class="mt-4 pt-4 hairline-t bg-amber-50/50 -mx-6 -mb-6 p-6">
						<div class="flex items-center gap-2 text-amber-900 text-xs font-mono mb-2 uppercase font-semibold">
							<img src="/icons/icon_light_on.png" alt="" class="w-3.5 h-3.5" />
							<span>Modo de Desenvolvimento</span>
						</div>
						<p class="text-xs text-amber-800 mb-3">
							Chave do Resend não configurada localmente. Você pode entrar imediatamente pelo botão abaixo:
						</p>
						<a
							href={form.simulatedUrl}
							data-sveltekit-reload
							class="inline-flex items-center justify-center w-full bg-zinc-900 text-white px-4 py-2.5 text-sm font-medium rounded-sm hover:bg-zinc-800 transition-colors"
						>
							Entrar Imediatamente &rarr;
						</a>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Formulário de Login -->
			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				<input type="hidden" name="redirect" value={data.redirect} />

				{#if form?.error}
					<div class="p-3 bg-red-50 hairline-all border-red-200 text-xs text-red-700 flex items-center gap-2">
						<img src="/icons/icon_light_off.png" alt="" class="w-4 h-4 object-contain" />
						<span>{form.error}</span>
					</div>
				{/if}

				<!-- Seletor de Perfil (Aluno vs Professor) -->
				<div>
					<span class="block text-xs font-mono uppercase tracking-wider text-zinc-600 mb-2">
						Eu sou:
					</span>
					<div class="grid grid-cols-2 gap-2">
						<button
							type="button"
							onclick={() => (selectedRole = 'aluno')}
							class="flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium transition-colors hairline-all {selectedRole === 'aluno' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 hover:bg-zinc-50'}"
						>
							<img src="/icons/icon_people.png" alt="" class="w-4 h-4 object-contain {selectedRole === 'aluno' ? 'brightness-0 invert' : ''}" />
							<span>Estudante</span>
						</button>

						<button
							type="button"
							onclick={() => (selectedRole = 'professor')}
							class="flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium transition-colors hairline-all {selectedRole === 'professor' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 hover:bg-zinc-50'}"
						>
							<img src="/icons/icon_pen.png" alt="" class="w-4 h-4 object-contain {selectedRole === 'professor' ? 'brightness-0 invert' : ''}" />
							<span>Professor</span>
						</button>
					</div>
					<input type="hidden" name="role" value={selectedRole} />
				</div>

				<!-- Campo de Nome Completo -->
				<div class="space-y-1">
					<label for="name" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Nome
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						autocomplete="name"
						placeholder="Fulano de Tal"
						value={form?.name || ''}
						class="w-full h-11 px-3 bg-white hairline-all text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 rounded-none transition-colors"
					/>
				</div>

				<!-- Campo de E-mail -->
				<div class="space-y-1">
					<label for="email" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Endereço de E-mail
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						autocomplete="email"
						placeholder="seu.email@universidade.br"
						value={form?.email || ''}
						class="w-full h-11 px-3 bg-white hairline-all text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 rounded-none transition-colors"
					/>
				</div>

				<!-- Botão de Envio -->
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full h-11 inline-flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
				>
					{#if isSubmitting}
						<img src="/icons/icon_loading.gif" alt="" class="w-4 h-4" />
						<span>Gerando link...</span>
					{:else}
						<span>Receber Magic Link por E-mail</span>
						<span>&rarr;</span>
					{/if}
				</button>
			</form>
		{/if}
	</div>
</div>
