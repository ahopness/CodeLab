<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let pinValue = $state('');
	let isEnrolling = $state(false);
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
	<!-- Topo da Página -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 hairline-b mb-8">
		<div>
			<div class="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
				<img src="/icons/icon_building.png" alt="" class="w-4 h-4 object-contain" />
				<span>Salas Virtuais</span>
			</div>
			<h1 class="font-serif text-3xl font-semibold text-zinc-900">
				Minhas Turmas
			</h1>
		</div>

		<div class="flex items-center gap-3">

			<a
				href="/auth/logout"
				data-sveltekit-reload
				class="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-red-700 hairline-all px-3 py-2 rounded-sm bg-white hover:bg-red-50 transition-colors shadow-2xs"
				title="Sair da conta"
			>
				<img src="/icons/icon_door.png" alt="" class="w-4 h-4 object-contain" />
				<span>Sair</span>
			</a>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Coluna Esquerda: Formulário de Entrada com PIN (1 Coluna) -->
		<div class="lg:col-span-1">
			<div class="bg-white hairline-all p-6 space-y-4">
				<div class="flex items-center gap-2">
					<img src="/icons/icon_door.png" alt="" class="w-5 h-5 object-contain" />
					<h2 class="font-serif text-lg font-semibold text-zinc-900">Entrar em Nova Turma</h2>
				</div>

				{#if form?.error}
					<div class="p-3 bg-red-50 hairline-all border-red-200 text-xs text-red-700 flex items-center gap-2">
						<img src="/icons/icon_light_off.png" alt="" class="w-4 h-4 object-contain" />
						<span>{form.error}</span>
					</div>
				{/if}

				<form
					action="?/enroll"
					method="POST"
					use:enhance={() => {
						isEnrolling = true;
						return async ({ update }) => {
							isEnrolling = false;
							await update();
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-1">
						<label for="pin" class="block text-xs font-mono uppercase tracking-wider text-zinc-500">
							PIN da Turma (6 dígitos)
						</label>
						<input
							id="pin"
							name="pin"
							type="text"
							required
							inputmode="numeric"
							autocomplete="one-time-code"
							placeholder="000000"
							bind:value={pinValue}
							oninput={(e) => {
								const clean = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
								pinValue = clean;
								e.currentTarget.value = clean;
							}}
							onpaste={(e) => {
								e.preventDefault();
								const text = e.clipboardData?.getData('text') || '';
								const clean = text.replace(/\D/g, '').slice(0, 6);
								pinValue = clean;
							}}
							class="w-full h-12 px-3 bg-[#fafafa] hairline-all text-center font-mono text-2xl tracking-[0.3em] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 rounded-none transition-colors"
						/>
					</div>

					<button
						type="submit"
						disabled={isEnrolling || pinValue.length !== 6}
						class="w-full h-11 inline-flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-40 transition-colors"
					>
						{#if isEnrolling}
							<img src="/icons/icon_loading.gif" alt="" class="w-4 h-4" />
							<span>Verificando PIN...</span>
						{:else}
							<span>Confirmar Inscrição</span>
							<span>&rarr;</span>
						{/if}
					</button>
				</form>
			</div>
		</div>

		<!-- Coluna Direita: Turmas Matriculadas (2 Colunas) -->
		<div class="lg:col-span-2 space-y-6">
			<h2 class="font-serif text-xl font-medium text-zinc-900 flex items-center gap-2">
				<img src="/icons/icon_folder.png" alt="" class="w-4 h-4 object-contain" />
				<span>Turmas em que você está inscrito</span>
				<span class="text-xs font-mono text-zinc-400">({data.enrolledTurmas.length})</span>
			</h2>

			{#if data.enrolledTurmas.length === 0}
				<!-- Estado Vazio -->
				<div class="bg-white hairline-all p-10 text-center space-y-4">
					<div class="w-12 h-12 mx-auto flex items-center justify-center bg-zinc-50 hairline-all">
						<img src="/icons/icon_elephant.png" alt="" class="w-6 h-6 object-contain" />
					</div>
					<h3 class="font-serif text-lg font-medium text-zinc-800">Nenhuma turma encontrada</h3>
					<p class="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
						Você ainda não está matriculado em nenhuma sala de aula. Peça o PIN de 6 dígitos ao monitor da disciplina e insira no formulário ao lado.
					</p>
				</div>
			{:else}
				<!-- Lista de Turmas -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each data.enrolledTurmas as turma}
						<a
							href="/turmas/{turma.id}"
							class="group bg-white hairline-all flex flex-col justify-between overflow-hidden hover:border-zinc-500 transition-colors"
						>
							<!-- Header Image ou Fallback -->
							<div class="h-32 w-full bg-zinc-100 relative overflow-hidden hairline-b">
								{#if turma.header_image}
									<img
										src={turma.header_image}
										alt={turma.name}
										class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
								{:else}
									<div class="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
										<img src="/bg.png" alt="" class="w-full h-full object-cover opacity-60" />
									</div>
								{/if}
								<span class="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded">
									PIN: {turma.pin}
								</span>
							</div>

							<!-- Conteúdo -->
							<div class="p-5 flex-1 flex flex-col justify-between">
								<div>
									<h3 class="font-serif text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors line-clamp-1">
										{turma.name}
									</h3>
									<p class="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
										<img src="/icons/icon_people.png" alt="" class="w-3.5 h-3.5 object-contain" />
										<span>Professor: {turma.teacher_name}</span>
									</p>
								</div>

								<div class="mt-4 pt-3 hairline-t flex items-center justify-between text-xs">
									<span class="font-mono text-zinc-500">
										{turma.list_count} {turma.list_count === 1 ? 'lista disponível' : 'listas disponíveis'}
									</span>
									<span class="font-medium text-zinc-900 group-hover:translate-x-0.5 transition-transform">
										Acessar &rarr;
									</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
