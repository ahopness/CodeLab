<script lang="ts">
	let { data } = $props();
</script>

<div class="flex-1 flex flex-col">
	<!-- Hero Section -->
	<section class="py-16 sm:py-24 bg-white hairline-b">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
			<h1 class="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-zinc-900 leading-[1.15] mb-6">
				Aprenda, pratique e receba feedback em programação.
			</h1>

			<p class="text-lg sm:text-xl text-zinc-600 font-sans max-w-2xl mx-auto leading-relaxed mb-10">
				Uma plataforma acadêmica focada na resolução guiada de listas de exercícios, com compilação instantânea no navegador e acompanhamento direto pelo professor da disciplina.
			</p>

			<!-- Botões de Ação Principal -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
				{#if data.user}
					<a
						href="/turmas"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-3.5 text-base font-medium rounded-sm hover:bg-zinc-800 transition-colors shadow-sm"
					>
						<img src="/icons/icon_building.png" alt="" class="w-4 h-4 object-contain brightness-0 invert" />
						<span>Acessar Minhas Turmas</span>
						<span>&rarr;</span>
					</a>
				{:else}
					<a
						href="/auth/login?role=aluno"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-3.5 text-base font-medium rounded-sm hover:bg-zinc-800 transition-colors shadow-sm"
					>
						<img src="/icons/icon_desk.png" alt="" class="w-4 h-4 object-contain brightness-0 invert" />
						<span>Entrar como Estudante</span>
						<span>&rarr;</span>
					</a>
					<a
						href="/auth/login?role=professor"
						class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hairline-all text-zinc-800 px-8 py-3.5 text-base font-medium rounded-sm hover:bg-zinc-50 transition-colors"
					>
						<img src="/icons/icon_pen.png" alt="" class="w-4 h-4 object-contain" />
						<span>Acesso do Professor</span>
					</a>
				{/if}
			</div>
		</div>
	</section>

	<!-- Seção de Recursos Editoriais -->
	<section class="py-16 bg-[#fafafa]">
		<div class="max-w-5xl mx-auto px-4 sm:px-6">
			<div class="text-center max-w-xl mx-auto mb-12">
				<h2 class="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
					Como funciona a plataforma
				</h2>
			</div>

			<!-- Grid Editorial sem cards flutuantes (Anti-card) -->
			<div class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 hairline-all bg-white">
				<!-- Item 1 -->
				<div class="p-8 flex flex-col justify-between">
					<div>
						<div class="w-10 h-10 flex items-center justify-center bg-zinc-50 hairline-all mb-4">
							<img src="/icons/icon_building.png" alt="" class="w-5 h-5 object-contain" />
						</div>
						<h3 class="font-serif text-lg font-semibold text-zinc-900 mb-2">1. Entrar nas Turmas</h3>
						<p class="text-sm text-zinc-600 leading-relaxed">
							Cada turma possui seu espaço próprio. O estudante entra instantaneamente usando um PIN numérico de 6 dígitos gerado pelo professor.
						</p>
					</div>
				</div>

				<!-- Item 2 -->
				<div class="p-8 flex flex-col justify-between">
					<div>
						<div class="w-10 h-10 flex items-center justify-center bg-zinc-50 hairline-all mb-4">
							<img src="/icons/icon_desk.png" alt="" class="w-5 h-5 object-contain" />
						</div>
						<h3 class="font-serif text-lg font-semibold text-zinc-900 mb-2">2. Editor & Terminal</h3>
						<p class="text-sm text-zinc-600 leading-relaxed">
							Workspace em duas colunas: enunciado de um lado, editor do outro.
						</p>
					</div>
				</div>

				<!-- Item 3 -->
				<div class="p-8 flex flex-col justify-between">
					<div>
						<div class="w-10 h-10 flex items-center justify-center bg-zinc-50 hairline-all mb-4">
							<img src="/icons/icon_note.png" alt="" class="w-5 h-5 object-contain" />
						</div>
						<h3 class="font-serif text-lg font-semibold text-zinc-900 mb-2">3. Feedback Direto no E-mail</h3>
						<p class="text-sm text-zinc-600 leading-relaxed">
							O professor inspeciona o código enviado, verifica acertos e emite orientações técnicas diretamente para o e-mail do aluno pelo próprio site.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
