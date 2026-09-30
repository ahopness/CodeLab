<script lang="ts">
	let { data } = $props();
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
	<!-- Navegação de Retorno -->
	<div class="mb-6">
		<a href="/turmas" class="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors">
			&larr; Voltar para todas as turmas
		</a>
	</div>

	<!-- Cabeçalho da Turma com Imagem Header -->
	<div class="bg-white hairline-all overflow-hidden mb-10">
		<div class="h-44 sm:h-56 w-full bg-zinc-100 relative overflow-hidden hairline-b">
			{#if data.turma.header_image}
				<img src={data.turma.header_image} alt={data.turma.name} class="w-full h-full object-cover" />
			{:else}
				<img src="/bg.png" alt="" class="w-full h-full object-cover opacity-70" />
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
			<div class="absolute bottom-4 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
				<div>
					<span class="inline-block text-xs font-mono uppercase tracking-widest text-zinc-300 mb-1">
						Turma Universitária
					</span>
					<h1 class="font-serif text-2xl sm:text-3xl font-semibold text-white">
						{data.turma.name}
					</h1>
					<p class="text-xs text-zinc-300 mt-1 flex items-center gap-1.5">
						<img src="/icons/icon_people.png" alt="" class="w-3.5 h-3.5 object-contain brightness-0 invert" />
						<span>Monitor/Professor: {data.turma.teacher_name}</span>
					</p>
				</div>
				<div class="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded hairline-all border-white/20 text-right">
					<span class="block text-[10px] font-mono text-zinc-300 uppercase">PIN de Acesso</span>
					<span class="font-mono text-lg font-bold tracking-widest text-white">{data.turma.pin}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Listagem das Listas de Exercícios -->
	<div class="space-y-6">
		<div class="flex items-center justify-between pb-4 hairline-b">
			<div class="flex items-center gap-2">
				<img src="/icons/icon_folder.png" alt="" class="w-5 h-5 object-contain" />
				<h2 class="font-serif text-xl font-medium text-zinc-900">
					Listas de Exercícios Disponíveis
				</h2>
			</div>
			<span class="text-xs font-mono text-zinc-500">
				{data.lists.length} {data.lists.length === 1 ? 'lista' : 'listas'}
			</span>
		</div>

		{#if data.lists.length === 0}
			<div class="bg-white hairline-all p-12 text-center space-y-4">
				<div class="w-12 h-12 mx-auto flex items-center justify-center bg-zinc-50 hairline-all">
					<img src="/icons/icon_files.png" alt="" class="w-6 h-6 object-contain" />
				</div>
				<h3 class="font-serif text-lg font-medium text-zinc-800">Nenhuma lista publicada ainda</h3>
				<p class="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
					O professor ainda não publicou listas de exercícios nesta turma.
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.lists as list, index}
					<div class="bg-white hairline-all p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-400 transition-colors">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
							<h3 class="font-serif text-lg font-semibold text-zinc-900">
									{list.name}
								</h3>
							</div>
							{#if list.description}
								<p class="text-xs text-zinc-600 max-w-2xl leading-relaxed">
									{list.description}
								</p>
							{/if}
						</div>

						<div class="flex items-center gap-4 self-end sm:self-center">
							<div class="text-right">
								<span class="text-xs font-mono text-zinc-500 block">
									{list.exercise_count} {list.exercise_count === 1 ? 'questão' : 'questões'}
								</span>
							</div>

							{#if list.exercise_count > 0}
								<a
									href="/turmas/{data.turma.id}/lista/{list.id}"
									class="inline-flex items-center gap-2 bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-sm hover:bg-zinc-800 transition-colors"
								>
									<img src="/icons/icon_desk.png" alt="" class="w-3.5 h-3.5 object-contain brightness-0 invert" />
									<span>Abrir Editor &rarr;</span>
								</a>
							{:else}
								<button
									disabled
									class="inline-flex items-center gap-1 bg-zinc-100 text-zinc-400 text-xs font-medium px-4 py-2 rounded-sm cursor-not-allowed"
								>
									<span>Sem questões</span>
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
