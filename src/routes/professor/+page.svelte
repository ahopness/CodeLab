<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let showCreateModal = $state(false);
	let isCreating = $state(false);
	let copiedPin = $state<string | null>(null);

	function copyToClipboard(pin: string) {
		const cleanPin = pin.trim();
		navigator.clipboard.writeText(cleanPin);
		copiedPin = cleanPin;
		setTimeout(() => {
			copiedPin = null;
		}, 2000);
	}
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
	<!-- Topo do Painel -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 hairline-b mb-8">
		<div>
			<div class="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
				<img src="/icons/icon_desk.png" alt="" class="w-4 h-4 object-contain" />
				<span>Área do Docente</span>
			</div>
			<h1 class="font-serif text-3xl font-semibold text-zinc-900">
				Painel de Turmas
			</h1>
		</div>

		<div class="flex items-center gap-3 self-start sm:self-auto">
			<button
				type="button"
				onclick={() => (showCreateModal = !showCreateModal)}
				class="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 text-sm font-medium rounded-sm hover:bg-zinc-800 transition-colors shadow-sm"
			>
				<img src="/icons/icon_building.png" alt="" class="w-4 h-4 object-contain brightness-0 invert" />
				<span>+ Criar Nova Turma</span>
			</button>

			<a
				href="/auth/logout"
				data-sveltekit-reload
				class="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-red-700 hairline-all px-3 py-2.5 rounded-sm bg-white hover:bg-red-50 transition-colors shadow-2xs"
				title="Sair da conta"
			>
				<img src="/icons/icon_door.png" alt="" class="w-4 h-4 object-contain" />
				<span>Sair</span>
			</a>
		</div>
	</div>

	<!-- Formulário / Modal de Criação de Turma -->
	{#if showCreateModal}
		<div class="bg-white hairline-all p-6 sm:p-8 mb-10 space-y-6">
			<div class="flex items-center justify-between pb-4 hairline-b">
				<div class="flex items-center gap-2">
					<img src="/icons/icon_building.png" alt="" class="w-5 h-5 object-contain" />
					<h2 class="font-serif text-xl font-semibold text-zinc-900">Nova Turma Acadêmica</h2>
				</div>
				<button
					type="button"
					onclick={() => (showCreateModal = false)}
					class="text-xs font-mono text-zinc-500 hover:text-zinc-900"
				>
					✕ Fechar
				</button>
			</div>

			{#if form?.error}
				<div class="p-3 bg-red-50 hairline-all border-red-200 text-xs text-red-700 flex items-center gap-2">
					<img src="/icons/icon_light_off.png" alt="" class="w-4 h-4 object-contain" />
					<span>{form.error}</span>
				</div>
			{/if}

			<form
				action="?/createTurma"
				method="POST"
				enctype="multipart/form-data"
				use:enhance={() => {
					isCreating = true;
					return async ({ update }) => {
						isCreating = false;
						showCreateModal = false;
						await update();
					};
				}}
				class="space-y-6 max-w-2xl"
			>
				<div class="space-y-1">
					<label for="name" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Nome da Turma
					</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						placeholder="Ex: Introdução à Programação 2026.1 - Turma C"
						class="w-full h-11 px-3 bg-[#fafafa] hairline-all text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 rounded-none transition-colors"
					/>
				</div>

				<div class="space-y-1">
					<label for="header_image" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Imagem de Capa
					</label>
					<input
						id="header_image"
						name="header_image"
						type="file"
						accept="image/*"
						class="w-full text-xs text-zinc-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
					/>
					<p class="text-[11px] text-zinc-500 mt-1">
						Formatos aceitos: JPG, PNG, WEBP. Se não enviar, uma imagem de capa padrão será utilizada.
					</p>
				</div>

				<div class="p-4 bg-zinc-50 hairline-all text-xs text-zinc-600 space-y-1">
					<span class="font-mono text-zinc-900 font-semibold block uppercase">PIN Numérico de Inscrição:</span>
					<p>Um código de <strong>6 números aleatórios</strong> será gerado automaticamente ao criar a turma para você repassar aos alunos em sala de aula.</p>
				</div>

				<div class="flex items-center gap-3 pt-2">
					<button
						type="submit"
						disabled={isCreating}
						class="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 text-sm font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
					>
						{#if isCreating}
							<img src="/icons/icon_loading.gif" alt="" class="w-4 h-4" />
							<span>Criando turma e enviando mídia para o R2...</span>
						{:else}
							<span>Salvar e Gerar Turma</span>
							<span>&rarr;</span>
						{/if}
					</button>

					<button
						type="button"
						onclick={() => (showCreateModal = false)}
						class="px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-900"
					>
						Cancelar
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Listagem de Turmas do Professor -->
	<div class="space-y-6">
		<h2 class="font-serif text-xl font-medium text-zinc-900 flex items-center gap-2">
			<img src="/icons/icon_building.png" alt="" class="w-4 h-4 object-contain" />
			<span>Suas Turmas Ativas</span>
			<span class="text-xs font-mono text-zinc-400">({data.turmas.length})</span>
		</h2>

		{#if data.turmas.length === 0}
			<div class="bg-white hairline-all p-12 text-center space-y-4">
				<div class="w-12 h-12 mx-auto flex items-center justify-center bg-zinc-50 hairline-all">
					<img src="/icons/icon_folder.png" alt="" class="w-6 h-6 object-contain" />
				</div>
				<h3 class="font-serif text-lg font-medium text-zinc-800">Você ainda não criou nenhuma turma</h3>
				<p class="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
					Clique no botão <strong>"+ Criar Nova Turma"</strong> acima para gerar sua primeira turma com PIN de 6 dígitos e começar a publicar listas de exercícios.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.turmas as turma}
					<div class="bg-white hairline-all flex flex-col justify-between overflow-hidden group hover:border-zinc-500 transition-colors">
						<!-- Imagem de Capa e PIN -->
						<div class="h-36 w-full bg-zinc-100 relative overflow-hidden hairline-b">
							{#if turma.header_image}
								<img src={turma.header_image} alt={turma.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
							{:else}
								<img src="/bg.png" alt="" class="w-full h-full object-cover opacity-70" />
							{/if}

							<!-- Badge com PIN e Ação de Copiar -->
							<div class="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-mono">
								<span>PIN: {turma.pin}</span>
								<button
									type="button"
									onclick={() => copyToClipboard(turma.pin)}
									class="text-[10px] text-zinc-300 hover:text-white underline ml-1"
									title="Copiar PIN"
								>
									{copiedPin === turma.pin ? 'Copiado!' : 'Copiar'}
								</button>
							</div>
						</div>

						<!-- Informações da Turma -->
						<div class="p-5 flex-1 flex flex-col justify-between">
							<div>
								<h3 class="font-serif text-lg font-semibold text-zinc-900 line-clamp-1">
									{turma.name}
								</h3>
								<div class="flex items-center gap-4 text-xs text-zinc-500 mt-2 font-mono">
									<span class="flex items-center gap-1">
										<img src="/icons/icon_people.png" alt="" class="w-3.5 h-3.5 object-contain" />
										{turma.student_count} {turma.student_count === 1 ? 'aluno' : 'alunos'}
									</span>
									<span class="flex items-center gap-1">
										<img src="/icons/icon_folder.png" alt="" class="w-3.5 h-3.5 object-contain" />
										{turma.list_count} {turma.list_count === 1 ? 'lista' : 'listas'}
									</span>
								</div>
							</div>

							<!-- Botão de Gerenciamento -->
							<div class="mt-6 pt-3 hairline-t">
								<a
									href="/professor/turma/{turma.id}"
									class="inline-flex items-center justify-between w-full text-xs font-medium text-zinc-900 group-hover:text-zinc-700 transition-colors"
								>
									<span>Gerenciar Listas e Alunos</span>
									<span>&rarr;</span>
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
