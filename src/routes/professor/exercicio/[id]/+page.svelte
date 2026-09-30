<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let activeTab = $state<'info' | 'submissions'>('submissions');
	let isUpdating = $state(false);
	let isSendingFeedback = $state(false);

	// Submissão selecionada para revisão detalhada
	let selectedSubmission = $state<(typeof data.submissions)[0] | null>(null);
	let feedbackInputText = $state('');

	function openReview(sub: (typeof data.submissions)[0]) {
		selectedSubmission = sub;
		feedbackInputText = sub.feedback_text || '';
	}

	function closeReview() {
		selectedSubmission = null;
		feedbackInputText = '';
	}
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
	<!-- Retorno para a Lista -->
	<div class="mb-6">
		<a
			href="/professor/turma/{data.exercise.classroom_id}/lista/{data.exercise.list_id}"
			class="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors"
		>
			&larr; Voltar para {data.exercise.list_name}
		</a>
	</div>

	<!-- Topo do Exercício -->
	<div class="bg-white hairline-all p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">
				<img src="/icons/icon_pen.png" alt="" class="w-3.5 h-3.5 object-contain" />
				<span>{data.exercise.classroom_name} &bull; {data.exercise.list_name}</span>
			</div>
			<h1 class="font-serif text-2xl sm:text-3xl font-semibold text-zinc-900">
				{data.exercise.title}
			</h1>
		</div>

		<!-- Abas -->
		<div class="flex items-center gap-2 self-start md:self-auto">
			<button
				type="button"
				onclick={() => (activeTab = 'submissions')}
				class="px-4 py-2 text-xs font-mono uppercase tracking-wider hairline-all transition-colors {activeTab === 'submissions' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 hover:bg-zinc-50'}"
			>
				Resoluções dos Alunos ({data.submissions.length})
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'info')}
				class="px-4 py-2 text-xs font-mono uppercase tracking-wider hairline-all transition-colors {activeTab === 'info' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 hover:bg-zinc-50'}"
			>
				Editar Informações
			</button>
		</div>
	</div>

	{#if form?.feedbackSent}
		<div class="p-4 bg-emerald-50 hairline-all border-emerald-200 text-xs text-emerald-800 mb-6 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<img src="/icons/icon_light_on.png" alt="" class="w-4 h-4 object-contain" />
				<span>Feedback enviado com sucesso para o e-mail do aluno!</span>
			</div>
			{#if form.simulated}
				<span class="font-mono text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
					Modo local simulado
				</span>
			{/if}
		</div>
	{/if}

	{#if form?.updated}
		<div class="p-4 bg-emerald-50 hairline-all border-emerald-200 text-xs text-emerald-800 mb-6 flex items-center gap-2">
			<img src="/icons/icon_light_on.png" alt="" class="w-4 h-4 object-contain" />
			<span>Informações do exercício atualizadas com sucesso!</span>
		</div>
	{/if}

	<!-- ABA 1: LISTA DE SUBMISSÕES DOS ALUNOS -->
	{#if activeTab === 'submissions'}
		<div class="space-y-6">
			<div class="flex items-center justify-between pb-3 hairline-b">
				<h2 class="font-serif text-lg font-semibold text-zinc-900 flex items-center gap-2">
					<img src="/icons/icon_note.png" alt="" class="w-4 h-4 object-contain" />
					<span>Códigos Submetidos pelos Estudantes</span>
				</h2>
				<span class="text-xs font-mono text-zinc-500">
					{data.submissions.length} {data.submissions.length === 1 ? 'envio registrado' : 'envios registrados'}
				</span>
			</div>

			{#if data.submissions.length === 0}
				<div class="bg-white hairline-all p-12 text-center space-y-3">
					<img src="/icons/icon_file.png" alt="" class="w-8 h-8 object-contain mx-auto opacity-50" />
					<h3 class="font-serif text-base font-semibold text-zinc-800">Nenhum envio recebido ainda</h3>
					<p class="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
						Assim que os alunos compilarem e clicarem em "Enviar Resolução para o Professor" no editor, seus códigos aparecerão listados aqui para correção e feedback.
					</p>
				</div>
			{:else}
				<div class="bg-white hairline-all overflow-x-auto">
					<table class="w-full text-left border-collapse text-xs">
						<thead>
							<tr class="bg-zinc-50 hairline-b text-zinc-500 font-mono uppercase tracking-wider">
								<th class="py-3 px-4">Estudante</th>
								<th class="py-3 px-4">Status da Saída</th>
								<th class="py-3 px-4">Data do Envio</th>
								<th class="py-3 px-4">Feedback</th>
								<th class="py-3 px-4 text-right">Ação</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-zinc-200">
							{#each data.submissions as sub}
								<tr class="hover:bg-zinc-50/60 transition-colors">
									<td class="py-3 px-4">
										<div class="font-medium text-zinc-900">{sub.student_name}</div>
										<div class="font-mono text-[11px] text-zinc-500">{sub.student_email}</div>
									</td>
									<td class="py-3 px-4">
										<span class="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded text-[11px] {sub.status === 'correct' ? 'bg-emerald-100 text-emerald-800' : sub.status === 'wrong_answer' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}">
											{sub.status === 'correct' ? '✓ Correto' : sub.status === 'wrong_answer' ? '✕ Saída Incorreta' : '! Erro'}
										</span>
									</td>
									<td class="py-3 px-4 font-mono text-zinc-500">
										{new Date(sub.submitted_at).toLocaleString('pt-BR')}
									</td>
									<td class="py-3 px-4">
										{#if sub.feedback_text}
											<span class="text-emerald-700 font-mono text-[11px] flex items-center gap-1">
												<span>✓ Enviado</span>
											</span>
										{:else}
											<span class="text-zinc-400 font-mono text-[11px]">Pendente</span>
										{/if}
									</td>
									<td class="py-3 px-4 text-right">
										<button
											type="button"
											onclick={() => openReview(sub)}
											class="inline-flex items-center gap-1 bg-zinc-900 text-white px-3 py-1.5 rounded-sm hover:bg-zinc-800 transition-colors text-xs font-medium"
										>
											<img src="/icons/icon_pen.png" alt="" class="w-3 h-3 object-contain brightness-0 invert" />
											<span>Revisar Código</span>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- ABA 2: EDITAR INFORMAÇÕES DO EXERCÍCIO -->
	{#if activeTab === 'info'}
		<div class="bg-white hairline-all p-6 sm:p-8 space-y-6">
			<h2 class="font-serif text-xl font-semibold text-zinc-900 pb-2 hairline-b">
				Editar Informações do Exercício
			</h2>

			<form
				action="?/updateExercise"
				method="POST"
				enctype="multipart/form-data"
				use:enhance={() => {
					isUpdating = true;
					return async ({ update }) => {
						isUpdating = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				<div class="space-y-1">
					<label for="edit-title" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Título do Exercício *
					</label>
					<input
						id="edit-title"
						name="title"
						type="text"
						required
						value={data.exercise.title}
						class="w-full h-11 px-3 bg-[#fafafa] hairline-all text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none"
					/>
				</div>

				<div class="space-y-1">
					<label for="edit-desc" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Enunciado Completo *
					</label>
					<textarea
						id="edit-desc"
						name="description"
						rows="4"
						required
						class="w-full p-3 bg-[#fafafa] hairline-all text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-y"
					>{data.exercise.description}</textarea>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-1">
						<label for="edit-stdin" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Entrada de Teste (stdin)
						</label>
						<textarea
							id="edit-stdin"
							name="test_input"
							rows="3"
							class="w-full p-3 bg-[#fafafa] hairline-all font-mono text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-none"
						>{data.exercise.test_input || ''}</textarea>
					</div>

					<div class="space-y-1">
						<label for="edit-stdout" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Saída Esperada (output esperado) *
						</label>
						<textarea
							id="edit-stdout"
							name="expected_output"
							rows="3"
							required
							class="w-full p-3 bg-[#fafafa] hairline-all font-mono text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-none"
						>{data.exercise.expected_output}</textarea>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-1">
						<label for="edit-video-url" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Link do Vídeo de Resolução
						</label>
						<input
							id="edit-video-url"
							name="video_link"
							type="url"
							value={data.exercise.video_link || ''}
							class="w-full h-11 px-3 bg-[#fafafa] hairline-all text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none"
						/>
					</div>

					<div class="space-y-1">
						<label for="edit-video-file" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
							Substituir Vídeo no Cloudflare R2
						</label>
						<input
							id="edit-video-file"
							name="video_file"
							type="file"
							accept="video/*"
							class="w-full text-xs text-zinc-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-800 hover:file:bg-zinc-200 cursor-pointer"
						/>
					</div>
				</div>

				<div class="space-y-1">
					<label for="edit-initial-code" class="block text-xs font-mono uppercase tracking-wider text-zinc-600">
						Código Inicial Modelo (C99)
					</label>
					<textarea
						id="edit-initial-code"
						name="initial_code"
						rows="4"
						class="w-full p-3 bg-[#18181b] text-zinc-100 font-mono text-xs hairline-all focus:outline-none focus:border-zinc-700 rounded-none"
					>{data.exercise.initial_code || ''}</textarea>
				</div>

				<button
					type="submit"
					disabled={isUpdating}
					class="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-2.5 text-xs font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
				>
					{#if isUpdating}
						<img src="/icons/icon_loading.gif" alt="" class="w-3.5 h-3.5" />
						<span>Atualizando exercício no banco e R2...</span>
					{:else}
						<span>Salvar Alterações</span>
						<span>&rarr;</span>
					{/if}
				</button>
			</form>
		</div>
	{/if}

	<!-- MODAL / DRAWER DE REVISÃO DO CÓDIGO DO ALUNO & ENVIO DE FEEDBACK -->
	{#if selectedSubmission}
		<div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
			<div class="bg-white hairline-all max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
				<!-- Header da Revisão -->
				<div class="bg-zinc-50 px-6 py-4 hairline-b flex items-center justify-between">
					<div class="flex items-center gap-3">
						<img src="/icons/icon_pen.png" alt="" class="w-5 h-5 object-contain" />
						<div>
							<h3 class="font-serif text-lg font-semibold text-zinc-900">
								Revisão de Código: {selectedSubmission.student_name}
							</h3>
							<p class="text-xs font-mono text-zinc-500">
								{selectedSubmission.student_email} &bull; Submetido em {new Date(selectedSubmission.submitted_at).toLocaleString('pt-BR')}
							</p>
						</div>
					</div>

					<button
						type="button"
						onclick={closeReview}
						class="text-zinc-500 hover:text-zinc-900 text-sm font-mono p-1"
					>
						✕ Fechar
					</button>
				</div>

				<!-- Corpo da Revisão com Scroll -->
				<div class="p-6 overflow-y-auto space-y-6 flex-1">
					<!-- Código C Submetido pelo Aluno -->
					<div class="space-y-1.5">
						<div class="flex items-center justify-between text-xs font-mono text-zinc-500">
							<span class="uppercase tracking-wider">Código C99 enviado:</span>
							<span class="px-2 py-0.5 rounded text-[11px] {selectedSubmission.status === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
								Status: {selectedSubmission.status === 'correct' ? 'Saída Correta' : 'Saída Incorreta / Erro'}
							</span>
						</div>
						<pre class="bg-[#18181b] text-zinc-100 p-4 font-mono text-xs overflow-x-auto hairline-all leading-relaxed max-h-64"><code>{selectedSubmission.code}</code></pre>
					</div>

					<!-- Comparação de Saída -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="space-y-1">
							<span class="text-xs font-mono text-zinc-500 uppercase">Saída gerada pelo aluno (stdout):</span>
							<pre class="bg-zinc-50 hairline-all p-3 text-xs font-mono text-zinc-800 overflow-x-auto max-h-28 whitespace-pre-wrap"><code>{selectedSubmission.stdout || '(sem saída)'}</code></pre>
						</div>

						<div class="space-y-1">
							<span class="text-xs font-mono text-zinc-500 uppercase">Saída esperada da questão:</span>
							<pre class="bg-zinc-50 hairline-all p-3 text-xs font-mono text-zinc-800 overflow-x-auto max-h-28 whitespace-pre-wrap"><code>{data.exercise.expected_output}</code></pre>
						</div>
					</div>

					<!-- Histórico de Feedback Anterior -->
					{#if selectedSubmission.feedback_text}
						<div class="p-4 bg-zinc-50 hairline-all space-y-1">
							<span class="text-xs font-mono text-zinc-500 uppercase block font-semibold">Feedback enviado anteriormente:</span>
							<p class="text-xs text-zinc-700 whitespace-pre-wrap">{selectedSubmission.feedback_text}</p>
						</div>
					{/if}

					<!-- Formulário de Envio de Feedback por E-mail -->
					<div class="hairline-t pt-4 space-y-3">
						<div class="flex items-center gap-2">
							<img src="/icons/icon_note.png" alt="" class="w-4 h-4 object-contain" />
							<h4 class="font-serif text-base font-semibold text-zinc-900">
								Enviar Feedback para o Aluno por E-mail
							</h4>
						</div>
						<p class="text-xs text-zinc-500">
							Escreva orientações técnicas, aponte melhorias no código ou esclareça erros. A mensagem será enviada diretamente para <strong>{selectedSubmission.student_email}</strong>.
						</p>

						<form
							action="?/sendFeedback"
							method="POST"
							use:enhance={() => {
								isSendingFeedback = true;
								return async ({ update }) => {
									isSendingFeedback = false;
									closeReview();
									await update();
								};
							}}
							class="space-y-4"
						>
							<input type="hidden" name="submission_id" value={selectedSubmission.id} />
							<input type="hidden" name="student_id" value={selectedSubmission.student_id} />
							<input type="hidden" name="student_email" value={selectedSubmission.student_email} />
							<input type="hidden" name="student_name" value={selectedSubmission.student_name} />
							<input type="hidden" name="exercise_title" value={data.exercise.title} />
							<input type="hidden" name="student_code" value={selectedSubmission.code} />

							<textarea
								name="feedback_text"
								rows="4"
								required
								bind:value={feedbackInputText}
								placeholder="Olá! Seu código utilizou bem a estrutura do for, porém atente-se ao cálculo da média..."
								class="w-full p-3 bg-[#fafafa] hairline-all text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 rounded-none resize-y"
							></textarea>

							<div class="flex items-center justify-end gap-3">
								<button
									type="button"
									onclick={closeReview}
									class="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-900"
								>
									Cancelar
								</button>

								<button
									type="submit"
									disabled={isSendingFeedback || !feedbackInputText.trim()}
									class="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 text-xs font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors"
								>
									{#if isSendingFeedback}
										<img src="/icons/icon_loading.gif" alt="" class="w-3.5 h-3.5" />
										<span>Disparando e-mail...</span>
									{:else}
										<img src="/icons/icon_note.png" alt="" class="w-3.5 h-3.5 object-contain brightness-0 invert" />
										<span>Enviar Feedback por E-mail &rarr;</span>
									{/if}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
