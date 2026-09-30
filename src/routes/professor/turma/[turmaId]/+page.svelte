<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let showCreateList = $state(false);
	let isCreatingList = $state(false);
	let activeTab = $state<'listas' | 'alunos'>('listas');
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
	<!-- Navegação de Retorno -->
	<div class="mb-6">
		<a href="/professor" class="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors">
			&larr; Voltar para todas as turmas
		</a>
	</div>

	<!-- Header da Turma -->
	<div class="bg-white hairline-all overflow-hidden mb-8">
		<div class="h-44 sm:h-52 w-full bg-zinc-100 relative overflow-hidden hairline-b">
			{#if data.turma.header_image}
				<img src={data.turma.header_image} alt={data.turma.name} class="w-full h-full object-cover" />
			{:else}
				<img src="/bg.png" alt="" class="w-full h-full object-cover opacity-70" />
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
			<div class="absolute bottom-4 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<span class="inline-block text-xs font-mono uppercase tracking-widest text-zinc-300 mb-1">
						Gestão de Turma
					</span>
					<h1 class="font-serif text-2xl sm:text-3xl font-semibold text-white">
						{data.turma.name}
					</h1>
				</div>

				<div class="bg-black/60 backdrop-blur-md px-4 py-2 rounded hairline-all border-white/20 text-right">
					<span class="block text-[10px] font-mono text-zinc-300 uppercase">PIN de Inscrição dos Alunos</span>
					<span class="font-mono text-xl font-bold tracking-widest text-zinc-400">{data.turma.pin}</span>
				</div>
			</div>
		</div>

		<!-- Abas de Navegação -->
		<div class="flex items-center px-6 bg-white border-b border-zinc-200">
			<button
				type="button"
				onclick={() => (activeTab = 'listas')}
				class="py-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 {activeTab === 'listas' ? 'border-zinc-900 text-zinc-900 font-semibold' : 'border-transparent text-zinc-500 hover:text-zinc-800'}"
			>
				Listas de Exercícios ({data.lists.length})
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'alunos')}
				class="py-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 {activeTab === 'alunos' ? 'border-zinc-900 text-zinc-900 font-semibold' : 'border-transparent text-zinc-500 hover:text-zinc-800'}"
			>
				Alunos Matriculados ({data.students.length})
			</button>
		</div>
	</div>

	<!-- Conteúdo da Aba Selecionada -->
	{#if activeTab === 'listas'}
		<div class="space-y-6">
			<div class="flex items-center justify-between pb-4 hairline-b">
				<div class="flex items-center gap-2">
					<img src="/icons/icon_folder.png" alt="" class="w-5 h-5 object-contain" />
					<h2 class="font-serif text-xl font-semibold text-zinc-900">
						Listas de Exercícios
					</h2>
				</div>

				<button
					type="button"
					onclick={() => (showCreateList = !showCreateList)}
					class="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 text-xs font-medium rounded-sm hover:bg-zinc-800 transition-colors"
				>
					<img src="/icons/icon_file.png" alt="" class="w-3.5 h-3.5 object-contain brightness-0 invert" />
					<span>+ Nova Lista de Exercícios</span>
				</button>
			</div>

			<!-- Formulário para Criar Lista -->
			{#if showCreateList}
				<div class="bg-white hairline-all p-6 mb-6 space-y-4">
					<div class="flex items-center justify-between pb-2 hairline-b">
						<h3 class="font-serif text-lg font-semibold text-zinc-900">Criar Lista de Exercícios</h3>
						<button
							type="button"
							onclick={() => (showCreateList = false)}
							class="text-xs font-mono text-zinc-500 hover:text-zinc-900"
						>
							✕ Cancelar
						</button>
					</div>

					{#if form?.error}
						<div class="p-3 bg-red-50 text-xs text-red-700 hairline-all border-red-200">
							{form.error}
						</div>
					{/if}

					<form
						action="?/createList"
						method="POST"
						use:enhance={() => {
							isCreatingList = true;
							return async ({ update }) => {
								isCreatingList = false;
								showCreateList = false;
								await update();
							};
						}}
						class="space-y-4"
					>
						<div class="space-y-1">
							<label for="list-name" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
								Nome da Lista
							</label>
							<input
								id="list-name"
								name="name"
								type="text"
								required
								placeholder="Ex: Lista 01 — Variáveis, Tipos e Operadores"
								class="w-full h-11 px-3 bg-[#fafafa] hairline-all text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none"
							/>
						</div>

						<div class="space-y-1">
							<label for="list-desc" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
								Descrição / Instruções aos Alunos
							</label>
							<textarea
								id="list-desc"
								name="description"
								rows="3"
								placeholder="Orientações sobre prazo, conceitos abordados ou dicas de compilação..."
								class="w-full p-3 bg-[#fafafa] hairline-all text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-none"
							></textarea>
						</div>

						<button
							type="submit"
							disabled={isCreatingList}
							class="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 text-xs font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-50"
						>
							{#if isCreatingList}
								<img src="/icons/icon_loading.gif" alt="" class="w-3.5 h-3.5" />
								<span>Salvando lista...</span>
							{:else}
								<span>Salvar Lista</span>
								<span>&rarr;</span>
							{/if}
						</button>
					</form>
				</div>
			{/if}

			{#if data.lists.length === 0}
				<div class="bg-white hairline-all p-10 text-center space-y-3">
					<img src="/icons/icon_folder.png" alt="" class="w-8 h-8 object-contain mx-auto opacity-50" />
					<h3 class="font-serif text-base font-semibold text-zinc-800">Nenhuma lista criada nesta turma</h3>
					<p class="text-xs text-zinc-500">Clique em "+ Nova Lista de Exercícios" para começar.</p>
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
								<span class="text-xs font-mono text-zinc-500">
									{list.exercise_count} {list.exercise_count === 1 ? 'questão' : 'questões'}
								</span>

								<a
									href="/professor/turma/{data.turma.id}/lista/{list.id}"
									class="inline-flex items-center gap-2 bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-sm hover:bg-zinc-800 transition-colors"
								>
									<img src="/icons/icon_pen.png" alt="" class="w-3.5 h-3.5 object-contain brightness-0 invert" />
									<span>Gerenciar Questões &rarr;</span>
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<!-- Aba: Alunos Matriculados -->
		<div class="space-y-6">
			<div class="flex items-center justify-between pb-4 hairline-b">
				<div class="flex items-center gap-2">
					<img src="/icons/icon_people.png" alt="" class="w-5 h-5 object-contain" />
					<h2 class="font-serif text-xl font-semibold text-zinc-900">
						Estudantes Matriculados
					</h2>
				</div>
				<span class="text-xs font-mono text-zinc-500">
					{data.students.length} estudantes inscritos
				</span>
			</div>

			{#if data.students.length === 0}
				<div class="bg-white hairline-all p-10 text-center space-y-3">
					<img src="/icons/icon_people.png" alt="" class="w-8 h-8 object-contain mx-auto opacity-50" />
					<h3 class="font-serif text-base font-semibold text-zinc-800">Nenhum aluno matriculado ainda</h3>
					<p class="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
						Compartilhe o código PIN <span class="font-mono font-bold text-zinc-900">{data.turma.pin}</span> com os estudantes em sala de aula para que eles se inscrevam nesta turma.
					</p>
				</div>
			{:else}
				<div class="bg-white hairline-all overflow-x-auto">
					<table class="w-full text-left border-collapse text-xs">
						<thead>
							<tr class="bg-zinc-50 hairline-b text-zinc-500 font-mono uppercase tracking-wider">
								<th class="py-3 px-4">Nome do Estudante</th>
								<th class="py-3 px-4">E-mail</th>
								<th class="py-3 px-4">Questões Corretas</th>
								<th class="py-3 px-4">Data de Entrada</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-zinc-200">
							{#each data.students as student}
								<tr class="hover:bg-zinc-50/50">
									<td class="py-3.5 px-4 font-medium text-zinc-900">{student.name}</td>
									<td class="py-3.5 px-4 font-mono text-zinc-600">{student.email}</td>
									<td class="py-3.5 px-4 font-mono">
										<span class="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
											{student.completed_exercises} resolvidas
										</span>
									</td>
									<td class="py-3.5 px-4 font-mono text-zinc-400">
										{new Date(student.enrolled_at).toLocaleDateString('pt-BR')}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>
