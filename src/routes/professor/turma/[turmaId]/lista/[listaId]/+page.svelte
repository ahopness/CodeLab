<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let showCreateModal = $state(false);
	let isCreating = $state(false);
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
	<!-- Retorno para a Turma -->
	<div class="mb-6">
		<a href="/professor/turma/{data.turma.id}" class="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors">
			&larr; Voltar para {data.turma.name}
		</a>
	</div>

	<!-- Topo da Lista -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 hairline-b mb-8">
		<div>
			<div class="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
				<img src="/icons/icon_folder.png" alt="" class="w-4 h-4 object-contain" />
				<span>Lista de Exercícios</span>
			</div>
			<h1 class="font-serif text-3xl font-semibold text-zinc-900">
				{data.list.name}
			</h1>
			{#if data.list.description}
				<p class="text-xs text-zinc-600 mt-1 max-w-2xl leading-relaxed">
					{data.list.description}
				</p>
			{/if}
		</div>

		<button
			type="button"
			onclick={() => (showCreateModal = !showCreateModal)}
			class="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 text-xs font-medium rounded-sm hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-auto"
		>
			<img src="/icons/icon_pen.png" alt="" class="w-3.5 h-3.5 object-contain brightness-0 invert" />
			<span>+ Novo Exercício</span>
		</button>
	</div>

	<!-- Modal / Formulário de Criação de Exercício -->
	{#if showCreateModal}
		<div class="bg-white hairline-all p-6 sm:p-8 mb-10 space-y-6">
			<div class="flex items-center justify-between pb-4 hairline-b">
				<div class="flex items-center gap-2">
					<img src="/icons/icon_pen.png" alt="" class="w-4 h-4 object-contain" />
					<h2 class="font-serif text-xl font-semibold text-zinc-900">Cadastrar Novo Exercício</h2>
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
				<div class="p-3 bg-red-50 text-xs text-red-700 hairline-all border-red-200">
					{form.error}
				</div>
			{/if}

			<form
				action="?/createExercise"
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
				class="space-y-6"
			>
				<div class="space-y-1">
					<label for="ex-title" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Título do Problema *
					</label>
					<input
						id="ex-title"
						name="title"
						type="text"
						required
						placeholder="Ex: Média de Dois Números com scanf"
						class="w-full h-11 px-3 bg-[#fafafa] hairline-all text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none"
					/>
				</div>

				<div class="space-y-1">
					<label for="ex-desc" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Enunciado Completo da Questão *
					</label>
					<textarea
						id="ex-desc"
						name="description"
						rows="4"
						required
						placeholder="Escreva um programa em C99 que leia dois números inteiros da entrada padrão e imprima a média aritmética formatada com duas casas decimais..."
						class="w-full p-3 bg-[#fafafa] hairline-all text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-y"
					></textarea>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Entrada Padrão (stdin) -->
					<div class="space-y-1">
						<label for="ex-stdin" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Entrada de Teste (stdin) <span class="text-zinc-400 font-normal">(Opcional)</span>
						</label>
						<textarea
							id="ex-stdin"
							name="test_input"
							rows="3"
							placeholder="Ex: 10 20"
							class="w-full p-3 bg-[#fafafa] hairline-all font-mono text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-none"
						></textarea>
						<p class="text-[11px] text-zinc-500">Valores fornecidos para funções como scanf() durante o teste.</p>
					</div>

					<!-- Saída Esperada (output esperado) -->
					<div class="space-y-1">
						<label for="ex-stdout" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Saída Esperada (output esperado) *
						</label>
						<textarea
							id="ex-stdout"
							name="expected_output"
							rows="3"
							required
							placeholder="Ex: Media = 15.00"
							class="w-full p-3 bg-[#fafafa] hairline-all font-mono text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-none"
						></textarea>
						<p class="text-[11px] text-zinc-500">O sistema compara automaticamente (stdout == expected_output) na compilação.</p>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- Vídeo de Resolução (Link ou Arquivo R2) -->
					<div class="space-y-1">
						<label for="ex-video-url" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Link do Vídeo de Resolução <span class="text-zinc-400 font-normal">(Opcional)</span>
						</label>
						<input
							id="ex-video-url"
							name="video_link"
							type="url"
							placeholder="https://youtube.com/watch?v=... ou link externo"
							class="w-full h-11 px-3 bg-[#fafafa] hairline-all text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none"
						/>
					</div>

					<div class="space-y-1">
						<label for="video_file" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Ou Upload do Vídeo <span class="text-zinc-400 font-normal">(MP4 / WebM)</span>
						</label>
						<input
							id="video_file"
							name="video_file"
							type="file"
							accept="video/*"
							class="w-full text-xs text-zinc-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
						/>
					</div>
				</div>

				<!-- Código Inicial Opcional -->
				<div class="space-y-1">
					<label for="ex-code" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Código Inicial Modelo (C99) <span class="text-zinc-400 font-normal">(Opcional)</span>
					</label>
					<textarea
						id="ex-code"
						name="initial_code"
						rows="4"
						placeholder={`#include <stdio.h>\n\nint main() {\n    // seu codigo aqui\n    return 0;\n}`}
						class="w-full p-3 bg-[#18181b] text-zinc-100 font-mono text-xs hairline-all focus:outline-none focus:border-zinc-700 rounded-none"
					></textarea>
				</div>

				<div class="flex items-center gap-3 pt-2">
					<button
						type="submit"
						disabled={isCreating}
						class="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 text-xs font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
					>
						{#if isCreating}
							<img src="/icons/icon_loading.gif" alt="" class="w-3.5 h-3.5" />
							<span>Salvando exercício e processando mídias...</span>
						{:else}
							<span>Salvar Exercício</span>
							<span>&rarr;</span>
						{/if}
					</button>

					<button
						type="button"
						onclick={() => (showCreateModal = false)}
						class="px-4 py-2.5 text-xs text-zinc-600 hover:text-zinc-900"
					>
						Cancelar
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Lista de Exercícios Cadastrados -->
	<div class="space-y-4">
		<h2 class="font-serif text-lg font-medium text-zinc-900 flex items-center gap-2">
			<img src="/icons/icon_files.png" alt="" class="w-4 h-4 object-contain" />
			<span>Questões da Lista</span>
			<span class="text-xs font-mono text-zinc-400">({data.exercises.length})</span>
		</h2>

		{#if data.exercises.length === 0}
			<div class="bg-white hairline-all p-12 text-center space-y-3">
				<img src="/icons/icon_file.png" alt="" class="w-8 h-8 object-contain mx-auto opacity-50" />
				<h3 class="font-serif text-base font-semibold text-zinc-800">Nenhum exercício cadastrado nesta lista</h3>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.exercises as ex, index}
					<div class="bg-white hairline-all p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-400 transition-colors">
						<div class="space-y-2 flex-1">
							<div class="flex items-center gap-2">
								<span class="text-xs font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
									Questão #{index + 1}
								</span>
								<h3 class="font-serif text-lg font-semibold text-zinc-900">
									{ex.title}
								</h3>
							</div>

							<p class="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
								{ex.description}
							</p>

							<div class="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
								<span class="bg-zinc-100 px-2 py-0.5 rounded">
									Saída esperada: <code class="text-zinc-800 font-semibold">{ex.expected_output.length > 25 ? ex.expected_output.substring(0, 25) + '...' : ex.expected_output}</code>
								</span>
								{#if ex.video_link}
									<span class="text-emerald-700 flex items-center gap-1">
										<span>▶ Com vídeo</span>
									</span>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-4 self-end md:self-center">
							<div class="text-right">
								<span class="text-xs font-mono text-zinc-500 block">
									{ex.submission_count} {ex.submission_count === 1 ? 'submissão' : 'submissões'}
								</span>
								<span class="text-[11px] font-mono text-emerald-700 block">
									{ex.solved_students_count} alunos acertaram
								</span>
							</div>

							<!-- Botão de Acesso à Edição e Revisão de Códigos -->
							<a
								href="/professor/exercicio/{ex.id}"
								class="inline-flex items-center gap-2 bg-zinc-900 text-white text-xs font-medium px-4 py-2.5 rounded-sm hover:bg-zinc-800 transition-colors"
							>
								<img src="/icons/icon_pen.png" alt="" class="w-3.5 h-3.5 object-contain brightness-0 invert" />
								<span>Editar e Revisar Códigos &rarr;</span>
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
