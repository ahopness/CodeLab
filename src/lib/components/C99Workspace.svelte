<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Exercise {
		id: string;
		list_id: string;
		title: string;
		description: string;
		initial_code: string | null;
		test_input: string | null;
		expected_output: string;
		video_link: string | null;
		order_index: number;
	}

	interface Submission {
		id: string;
		exercise_id: string;
		code: string;
		stdin: string | null;
		stdout: string | null;
		status: string;
		submitted_at: string;
		feedback_text: string | null;
	}

	let {
		turma,
		list,
		exercises = [],
		submissions = []
	}: {
		turma: { id: string; name: string; pin: string };
		list: { id: string; name: string; description: string | null };
		exercises: Exercise[];
		submissions: Submission[];
	} = $props();

	let activeIndex = $state(0);
	const activeExercise = $derived(exercises[activeIndex] || null);

	// Editor e terminal
	let textareaElement: HTMLTextAreaElement | null = null;
	let codeMirrorInstance: any = null;
	let currentWorker: Worker | null = null;

	let stdinValue = $state('');
	let terminalLines = $state<{ text: string; type: 'stdout' | 'stderr' | 'system' }[]>([]);
	let executionStatus = $state<'idle' | 'running' | 'success' | 'error'>('idle');
	let statusText = $state('Pronto');
	let exitCode = $state<number | null>(null);
	let executionTime = $state<number | null>(null);
	let isMatch = $state<boolean | null>(null);

	// Envio de submissão
	let isSubmitting = $state(false);
	let submitAlert = $state<{ type: 'success' | 'error'; message: string } | null>(null);
	let showVideo = $state(false);

	// Última submissão desta questão
	const latestSubmission = $derived(
		activeExercise
			? submissions.find((s) => s.exercise_id === activeExercise.id)
			: null
	);

	function getStarterCode(ex: Exercise | null): string {
		if (!ex) return '';
		if (latestSubmission?.code) return latestSubmission.code;
		if (ex.initial_code && ex.initial_code.trim()) return ex.initial_code;
		return `#include <stdio.h>\n\nint main() {\n    // Escreva sua solucao aqui\n    printf("Ola, mundo!\\n");\n    return 0;\n}\n`;
	}

	function loadExerciseData(index: number) {
		if (index < 0 || index >= exercises.length) return;
		activeIndex = index;
		const ex = exercises[index];
		submitAlert = null;
		isMatch = null;
		clearTerminal();

		// Seta entrada inicial de teste
		stdinValue = ex.test_input || '';

		// Atualiza código no CodeMirror
		if (codeMirrorInstance) {
			const starter = getStarterCode(ex);
			codeMirrorInstance.setValue(starter);
			codeMirrorInstance.clearHistory();
		}
	}

	function clearTerminal() {
		terminalLines = [
			{ text: '// Terminal pronto. Pressione "Executar Código" (Ctrl+Enter) para rodar.', type: 'system' }
		];
		executionStatus = 'idle';
		statusText = 'Pronto';
		exitCode = null;
		executionTime = null;
		isMatch = null;
	}

	function appendOutput(text: string, type: 'stdout' | 'stderr' | 'system' = 'stdout') {
		if (terminalLines.length === 1 && terminalLines[0].type === 'system') {
			terminalLines = [];
		}
		terminalLines = [...terminalLines, { text, type }];
	}

	function executeCode() {
		if (!codeMirrorInstance || !activeExercise) return;

		const code = codeMirrorInstance.getValue();
		const input = stdinValue;

		if (!code.trim()) {
			clearTerminal();
			appendOutput('[Erro] O editor de código está vazio.\n', 'stderr');
			return;
		}

		if (currentWorker) {
			currentWorker.terminate();
			currentWorker = null;
		}

		terminalLines = [];
		executionStatus = 'running';
		statusText = 'Executando...';
		exitCode = null;
		isMatch = null;
		const startTime = performance.now();
		const runId = 'run_' + Math.random().toString(36).slice(2);
		let accumulatedStdout = '';

		try {
			currentWorker = new Worker('/lib/JSCPP.es5.min.js');

			// Timeout de 5s para evitar while(1) infinito
			const timeoutId = setTimeout(() => {
				if (currentWorker) {
					currentWorker.terminate();
					currentWorker = null;
					finalizeExecution(null, 'Tempo limite de 5s excedido! Possível loop infinito.', true, startTime, accumulatedStdout);
				}
			}, 5000);

			currentWorker.onmessage = (e) => {
				const data = e.data;
				if (!data) return;

				if (data.type === 'stdio.write') {
					accumulatedStdout += data.data;
					appendOutput(data.data, 'stdout');
				} else if (data.id === runId) {
					clearTimeout(timeoutId);
					if (currentWorker) {
						currentWorker.terminate();
						currentWorker = null;
					}

					if (data.err) {
						finalizeExecution(null, data.msg || 'Erro na compilação ou execução do programa.', true, startTime, accumulatedStdout);
					} else {
						const codeVal = typeof data.data === 'number' ? data.data : 0;
						finalizeExecution(codeVal, null, false, startTime, accumulatedStdout);
					}
				}
			};

			currentWorker.onerror = (err) => {
				clearTimeout(timeoutId);
				if (currentWorker) {
					currentWorker.terminate();
					currentWorker = null;
				}
				runSyncFallback(code, input, startTime);
			};

			currentWorker.postMessage([runId, 'run', code, input || '']);
		} catch (workerErr) {
			runSyncFallback(code, input, startTime);
		}
	}

	function runSyncFallback(code: string, input: string, startTime: number) {
		try {
			let stdoutBuffer = '';
			const windowAny = window as any;
			if (!windowAny.JSCPP) {
				throw new Error('Interpretador JSCPP não carregado no navegador.');
			}

			const retCode = windowAny.JSCPP.run(code, input || '', {
				stdio: {
					write: (text: string) => {
						stdoutBuffer += text;
						appendOutput(text, 'stdout');
					}
				}
			});

			finalizeExecution(retCode, null, false, startTime, stdoutBuffer);
		} catch (err: any) {
			finalizeExecution(null, err.message || String(err), true, startTime, '');
		}
	}

	function finalizeExecution(
		codeVal: number | null,
		errorMsg: string | null,
		isErr: boolean,
		startTime: number,
		stdoutOutput: string
	) {
		const elapsed = Math.round(performance.now() - startTime);
		executionTime = elapsed;

		if (isErr) {
			executionStatus = 'error';
			statusText = 'Erro de Execução';
			exitCode = 1;
			isMatch = false;
			appendOutput(`\n[Erro]: ${errorMsg || 'Falha na execução'}\n`, 'stderr');
		} else {
			exitCode = codeVal ?? 0;
			executionStatus = exitCode === 0 ? 'success' : 'error';
			statusText = `Exit Code: ${exitCode}`;
			appendOutput(`\n\n[Processo finalizado com código ${exitCode} em ${elapsed}ms]\n`, 'system');

			// Verificação com o Output Esperado: output == expected_output
			if (activeExercise) {
				const expected = (activeExercise.expected_output || '').trim();
				const actual = stdoutOutput.trim();
				isMatch = actual === expected;
			}
		}
	}

	async function submitSolution() {
		if (!codeMirrorInstance || !activeExercise) return;

		const code = codeMirrorInstance.getValue();
		if (!code.trim()) {
			submitAlert = { type: 'error', message: 'Não é possível submeter um código vazio.' };
			return;
		}

		isSubmitting = true;
		submitAlert = null;

		const stdoutText = terminalLines
			.filter((l) => l.type === 'stdout')
			.map((l) => l.text)
			.join('');

		const expected = (activeExercise.expected_output || '').trim();
		const actual = stdoutText.trim();
		const status = executionStatus === 'error' ? 'error' : actual === expected ? 'correct' : 'wrong_answer';

		try {
			const res = await fetch('/api/submissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					exercise_id: activeExercise.id,
					code,
					stdin: stdinValue,
					stdout: stdoutText,
					status
				})
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || 'Falha ao registrar a submissão.');
			}

			// Atualiza a lista local de submissões mantendo a única submissão deste exercício
			const existingIndex = submissions.findIndex((s) => s.exercise_id === activeExercise.id);
			const newSub: Submission = {
				id: data.submissionId,
				exercise_id: activeExercise.id,
				code,
				stdin: stdinValue,
				stdout: stdoutText,
				status,
				submitted_at: new Date().toISOString(),
				feedback_text: existingIndex >= 0 ? submissions[existingIndex].feedback_text : null
			};

			if (existingIndex >= 0) {
				submissions[existingIndex] = newSub;
			} else {
				submissions.push(newSub);
			}

			submitAlert = {
				type: 'success',
				message: data.updated
					? 'Resolução atualizada com sucesso no painel do professor!'
					: 'Resolução enviada com sucesso ao professor para avaliação!'
			};
		} catch (err: any) {
			submitAlert = {
				type: 'error',
				message: err.message || 'Erro ao conectar ao servidor.'
			};
		} finally {
			isSubmitting = false;
		}
	}

	onMount(() => {
		// Carrega assets locais do CodeMirror e JSCPP caso ainda não existam no escopo global
		function loadScript(src: string): Promise<void> {
			return new Promise((resolve, reject) => {
				if (document.querySelector(`script[src="${src}"]`)) {
					resolve();
					return;
				}
				const script = document.createElement('script');
				script.src = src;
				script.onload = () => resolve();
				script.onerror = reject;
				document.head.appendChild(script);
			});
		}

		function loadStyle(href: string) {
			if (!document.querySelector(`link[href="${href}"]`)) {
				const link = document.createElement('link');
				link.rel = 'stylesheet';
				link.href = href;
				document.head.appendChild(link);
			}
		}

		loadStyle('/lib/codemirror.min.css');
		loadStyle('/lib/dracula.min.css');

		Promise.all([
			loadScript('/lib/codemirror.min.js'),
			loadScript('/lib/clike.min.js'),
			loadScript('/lib/closebrackets.min.js'),
			loadScript('/lib/JSCPP.es5.min.js')
		]).then(() => {
			const windowAny = window as any;
			if (windowAny.CodeMirror && textareaElement) {
				codeMirrorInstance = windowAny.CodeMirror.fromTextArea(textareaElement, {
					mode: 'text/x-csrc',
					theme: 'dracula',
					lineNumbers: true,
					autoCloseBrackets: true,
					matchBrackets: true,
					indentUnit: 4,
					tabSize: 4,
					lineWrapping: false,
					extraKeys: {
						'Ctrl-Enter': () => executeCode(),
						'Cmd-Enter': () => executeCode(),
						Tab: (cm: any) => {
							if (cm.somethingSelected()) {
								cm.indentSelection('add');
							} else {
								cm.replaceSelection('    ', 'end');
							}
						}
					}
				});

				loadExerciseData(0);
			}
		});
	});

	onDestroy(() => {
		if (currentWorker) {
			currentWorker.terminate();
			currentWorker = null;
		}
	});
</script>

<div class="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#fafafa]">
	<!-- Barra Superior da Lista com Atalhos -->
	<div class="bg-white hairline-b px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 z-10">
		<div class="flex items-center gap-3 min-w-0">
			<a
				href="/turmas/{turma.id}"
				class="text-xs font-mono text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
			>
				&larr; <span class="hidden sm:inline">Voltar para {turma.name}</span>
			</a>
			<div class="h-3.5 w-[1px] bg-zinc-200"></div>
			<div class="flex items-center gap-2 truncate">
				<img src="/icons/icon_folder.png" alt="" class="w-4 h-4 object-contain" />
				<span class="text-sm font-semibold text-zinc-900 truncate">{list.name}</span>
			</div>
			<div class="h-3.5 w-[1px] bg-zinc-200"></div>
			<span class="text-xs font-mono text-zinc-700 mr-1 hidden md:inline">Questão:</span>
			{#each exercises as ex, idx}
				<button
					type="button"
					onclick={() => loadExerciseData(idx)}
					class="px-2.5 py-1 text-xs font-mono font-medium transition-colors hairline-all {activeIndex === idx ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 hover:bg-zinc-100'}"
				>
					Q{idx + 1}
				</button>
			{/each}
		</div>

		<!-- Seletor de Questões Rápido -->
		<div class="flex items-center gap-1.5 overflow-x-auto">
		</div>
	</div>

	<!-- Workspace de 2 Colunas (Lado a Lado no Desktop) -->
	<div class="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
		<!-- ========================================== -->
		<!-- COLUNA 1: ENUNCIADO, VÍDEO E SUBMISSÃO    -->
		<!-- ========================================== -->
		<div class="lg:col-span-5 hairline-r bg-white flex flex-col h-full overflow-y-auto">
			{#if activeExercise}
				<div class="p-6 space-y-6 flex-1">
					<!-- Seletor e Cabeçalho da Questão -->
					<div>
						<div class="flex items-center justify-between gap-2 mb-2">
							<span class="text-xs font-mono text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded">
								Questão #{activeIndex + 1} de {exercises.length}
							</span>
							{#if latestSubmission}
								<span class="text-xs font-mono px-2 py-0.5 rounded {latestSubmission.status === 'correct' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
									{latestSubmission.status === 'correct' ? '✓ Resolvida' : 'Tentada'}
								</span>
							{/if}
						</div>
						<h2 class="font-serif text-2xl font-semibold text-zinc-900">
							{activeExercise.title}
						</h2>
					</div>

					<!-- Enunciado / Descrição -->
					<div class="prose prose-zinc max-w-none text-sm leading-relaxed text-zinc-700 space-y-4">
						<p class="whitespace-pre-wrap">{activeExercise.description}</p>
					</div>

					<!-- Saída Esperada de Referência -->
					<div class="bg-zinc-50 hairline-all p-4 space-y-2">
						<div class="flex items-center gap-1.5 text-xs font-mono text-zinc-500 uppercase font-semibold">
							<img src="/icons/icon_file.png" alt="" class="w-3.5 h-3.5" />
							<span>Saída Esperada para Teste (output esperado)</span>
						</div>
						<pre class="bg-white hairline-all p-3 text-xs font-mono text-zinc-800 overflow-x-auto whitespace-pre-wrap"><code>{activeExercise.expected_output}</code></pre>
					</div>

					<!-- Vídeo de Resolução -->
					{#if activeExercise.video_link}
						<div class="hairline-t pt-4">
							<div class="flex items-center justify-between bg-zinc-50 hairline-all p-4">
								<div class="flex items-center gap-3">
									<img src="/icons/icon_light_on.png" alt="" class="w-5 h-5 object-contain" />
									<div>
										<h4 class="text-sm font-semibold text-zinc-900">Vídeo de Resolução</h4>
										<p class="text-xs text-zinc-500">Gravado pelo professor para orientar seu estudo</p>
									</div>
								</div>
								<button
									type="button"
									onclick={() => (showVideo = !showVideo)}
									class="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-900 text-white px-3 py-1.5 rounded-sm hover:bg-zinc-800 transition-colors"
								>
									<span>{showVideo ? 'Ocultar Vídeo' : 'Assistir Resolução'}</span>
								</button>
							</div>

							{#if showVideo}
								<div class="mt-4 hairline-all overflow-hidden bg-black aspect-video flex items-center justify-center">
									{#if activeExercise.video_link.includes('youtube.com') || activeExercise.video_link.includes('youtu.be')}
										<iframe
											src={activeExercise.video_link.replace('watch?v=', 'embed/')}
											title="Vídeo de Resolução"
											class="w-full h-full border-0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen
										></iframe>
									{:else}
										<video controls class="w-full h-full object-contain">
											<source src={activeExercise.video_link} type="video/mp4" />
											<track kind="captions" />
											Seu navegador não suporta visualização de vídeos HTML5.
										</video>
									{/if}
								</div>
							{/if}
						</div>
					{/if}

					<!-- Feedback do Professor Anterior (se houver) -->
					{#if latestSubmission?.feedback_text}
						<div class="bg-blue-50/60 hairline-all border-blue-200 p-4 space-y-2">
							<div class="flex items-center gap-2 text-blue-900 text-xs font-mono uppercase font-semibold">
								<img src="/icons/icon_note.png" alt="" class="w-3.5 h-3.5" />
								<span>Feedback do Professor</span>
							</div>
							<p class="text-xs text-blue-950 whitespace-pre-wrap leading-relaxed">
								{latestSubmission.feedback_text}
							</p>
						</div>
					{/if}

					<!-- Notificação de Submissão -->
					{#if submitAlert}
						<div class="p-3 hairline-all text-xs flex items-center gap-2 {submitAlert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}">
							<img src={submitAlert.type === 'success' ? '/icons/icon_light_on.png' : '/icons/icon_light_off.png'} alt="" class="w-4 h-4 object-contain" />
							<span>{submitAlert.message}</span>
						</div>
					{/if}
				</div>

				<!-- Barra Inferior da Coluna 1: Botão de Submeter -->
				<div class="p-4 bg-zinc-50 hairline-t mt-auto">
					<button
						type="button"
						onclick={submitSolution}
						disabled={isSubmitting}
						class="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white py-2.5 px-4 text-sm font-medium rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
					>
						{#if isSubmitting}
							<img src="/icons/icon_loading.gif" alt="" class="w-4 h-4" />
							<span>Gravando envio...</span>
						{:else}
							<img src="/icons/icon_note.png" alt="" class="w-4 h-4 brightness-0 invert" />
							<span>{latestSubmission ? 'Atualizar Resolução para o Professor' : 'Enviar Resolução para o Professor'}</span>
							<span>&rarr;</span>
						{/if}
					</button>
				</div>
			{:else}
				<div class="p-8 text-center text-zinc-500 text-sm">
					Nenhuma questão selecionada nesta lista.
				</div>
			{/if}
		</div>

		<!-- ========================================== -->
		<!-- COLUNA 2: WORKSPACE VERTICAL               -->
		<!-- 1. Editor de Código (CodeMirror)           -->
		<!-- 2. Terminal de Saída                       -->
		<!-- 3. Entrada Padrão (stdin)                  -->
		<!-- ========================================== -->
		<div class="lg:col-span-7 flex flex-col h-full bg-[#1e1e24] overflow-hidden">
			<!-- 1. EDITOR C99 (Parte Superior) -->
			<div class="flex-1 flex flex-col min-h-[320px] border-b border-zinc-700 overflow-hidden">
				<!-- Barra de Ferramentas do Editor -->
				<div class="bg-[#18181b] px-4 py-2 border-b border-zinc-700 flex items-center justify-between text-xs">
					<div class="flex items-center gap-2 text-zinc-300 font-mono">
						<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
						<span>solucao.c (C99)</span>
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => {
								if (codeMirrorInstance && activeExercise) {
									codeMirrorInstance.setValue(getStarterCode(activeExercise));
								}
							}}
							class="text-zinc-400 hover:text-white px-2 py-1 transition-colors flex items-center gap-1"
							title="Restaurar código inicial"
						>
							<img src="/icons/icon_eraser.png" alt="" class="w-3.5 h-3.5 object-contain" />
							<span>Resetar</span>
						</button>

						<button
							type="button"
							onclick={clearTerminal}
							class="text-zinc-400 hover:text-white px-2 py-1 transition-colors flex items-center gap-1"
							title="Limpar mensagens do terminal"
						>
							<span>Limpar Saída</span>
						</button>

						<button
							type="button"
							onclick={executeCode}
							disabled={executionStatus === 'running'}
							class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 shadow"
							title="Executar código (Ctrl + Enter)"
						>
							{#if executionStatus === 'running'}
								<img src="/icons/icon_loading.gif" alt="" class="w-3.5 h-3.5" />
								<span>Executando...</span>
							{:else}
								<span>▶ Executar Código</span>
								<span class="text-[10px] opacity-75 font-mono">(Ctrl+Enter)</span>
							{/if}
						</button>
					</div>
				</div>

				<!-- Área do CodeMirror -->
				<div class="flex-1 overflow-hidden relative">
					<textarea bind:this={textareaElement} class="hidden"></textarea>
				</div>
			</div>

			<!-- 2. TERMINAL DE SAÍDA (Parte Central) -->
			<div class="h-52 flex flex-col bg-[#141416] border-b border-zinc-700">
				<!-- Header do Terminal -->
				<div class="bg-[#18181b] px-4 py-1.5 border-b border-zinc-700 flex items-center justify-between text-xs font-mono">
					<div class="flex items-center gap-2 text-zinc-300">
						<span class="text-zinc-500">&gt;_</span>
						<span>Terminal (stdout / stderr)</span>
					</div>

					<div class="flex items-center gap-3">
						{#if executionTime !== null}
							<span class="text-zinc-400">{executionTime}ms</span>
						{/if}
						<span class="px-2 py-0.5 rounded text-[11px] {executionStatus === 'running' ? 'bg-amber-900/60 text-amber-300' : executionStatus === 'success' ? 'bg-emerald-900/60 text-emerald-300' : executionStatus === 'error' ? 'bg-red-900/60 text-red-300' : 'bg-zinc-800 text-zinc-400'}">
							{statusText}
						</span>
					</div>
				</div>

				<!-- Banner de Verificação Automática (output == expected_output) -->
				{#if isMatch !== null}
					<div class="px-4 py-2 text-xs font-mono flex items-center justify-between {isMatch ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800' : 'bg-red-950/80 text-red-300 border-b border-red-800'}">
						<div class="flex items-center gap-2">
							<img src={isMatch ? '/icons/icon_light_on.png' : '/icons/icon_light_off.png'} alt="" class="w-4 h-4 object-contain" />
							<span>
								{isMatch
									? '✓ Resposta Correta: A saída do programa corresponde exatamente ao esperado!'
									: '✕ Saída Incorreta: O resultado gerado é diferente da saída esperada.'}
							</span>
						</div>
					</div>
				{/if}

				<!-- Console Body -->
				<div class="flex-1 p-3 overflow-y-auto font-mono text-xs text-zinc-200 space-y-1">
					{#each terminalLines as line}
						<div class="whitespace-pre-wrap font-mono {line.type === 'stderr' ? 'text-red-400' : line.type === 'system' ? 'text-zinc-500 italic' : 'text-zinc-100'}">{line.text}</div>
					{/each}
				</div>
			</div>

			<!-- 3. CAMPO DE ENTRADA PADRÃO (stdin) (Parte Inferior) -->
			<div class="h-36 bg-[#18181b] p-3 flex flex-col">
				<div class="flex items-center justify-between pb-1.5 mb-1 border-b border-zinc-800">
					<label for="stdin-input" class="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
						<span>Entrada Padrão (stdin):</span>
						<span class="text-[11px] text-zinc-500">Dados consumidos por funções como <code>scanf()</code></span>
					</label>
					<button
						type="button"
						onclick={() => (stdinValue = activeExercise?.test_input || '')}
						class="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline"
					>
						Restaurar teste
					</button>
				</div>
				<textarea
					id="stdin-input"
					bind:value={stdinValue}
					placeholder="Ex: 10 20 (entradas separadas por espaço ou quebra de linha)"
					class="flex-1 w-full bg-[#121214] border border-zinc-800 p-2 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 rounded-none resize-none"
				></textarea>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.CodeMirror) {
		height: 100% !important;
		font-family: 'JetBrains Mono', ui-monospace, monospace !important;
		font-size: 13px !important;
		line-height: 1.5 !important;
	}
	:global(.CodeMirror-gutters) {
		background-color: #18181b !important;
		border-right: 1px solid #27272a !important;
	}
</style>
