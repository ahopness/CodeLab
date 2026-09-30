<script lang="ts">
	import '../app.css';

	let { data, children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-[#fafafa]">
	<!-- Cabeçalho Editorial com Divisor Hairline -->
	<header class="bg-white hairline-b sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
			<!-- Marca / Logo -->
			<a href="/" class="flex items-center gap-3 group">
				<img src="/logo.png" alt="Logo" class="w-7 h-7 object-contain group-hover:opacity-80 transition-opacity" />
				<div>
					<span class="font-serif text-xl font-semibold tracking-tight text-zinc-900">CodeLab</span>
				</div>
			</a>

			<!-- Navegação e Usuário -->
			<nav class="flex items-center gap-3 sm:gap-6">
				{#if data.user}
					{#if data.user.role === 'aluno'}
						<a
							href="/turmas"
							class="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
						>
							<img src="/icons/icon_building.png" alt="" class="w-4 h-4 object-contain" />
							<span>Minhas Turmas</span>
						</a>
					{:else}
						<a
							href="/professor"
							class="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
						>
							<img src="/icons/icon_desk.png" alt="" class="w-4 h-4 object-contain" />
							<span>Painel do Professor</span>
						</a>
					{/if}

					<div class="h-4 w-[1px] bg-zinc-200"></div>

					<div class="flex items-center gap-3">
						<div class="text-right hidden md:block">
							<div class="text-sm font-medium text-zinc-900 leading-tight">{data.user.name}</div>
							<div class="text-xs text-zinc-500 uppercase tracking-wider font-mono">
								{data.user.role === 'professor' ? 'Professor' : 'Estudante'}
							</div>
						</div>

						<a
							href="/auth/logout"
							data-sveltekit-reload
							class="flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-red-700 transition-colors py-1.5 px-3 rounded-sm hairline-all bg-white hover:bg-red-50 shadow-2xs"
							title="Sair da conta"
						>
							<img src="/icons/icon_door.png" alt="" class="w-4 h-4 object-contain" />
							<span>Sair</span>
						</a>
					</div>
				{:else}
					<a
						href="/auth/login?role=aluno"
						class="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
					>
						Entrar como Aluno
					</a>
					<a
						href="/auth/login?role=professor"
						class="inline-flex items-center gap-2 text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-sm hover:bg-zinc-800 transition-colors"
					>
						<span>Área do Professor</span>
						<span>&rarr;</span>
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Conteúdo da Página -->
	<main class="flex-1 flex flex-col">
		{@render children?.()}
	</main>

	<!-- Rodapé Editorial -->
	<footer class="bg-white hairline-t py-8 text-xs text-zinc-600 mt-auto">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
			<div class="flex items-center gap-2">
				<img src="/logo.png" alt="" class="w-4 h-4 object-contain opacity-70" />
				<span>CodeLab</span>
			</div>
			<div class="flex items-center gap-6 text-zinc-600">
				<a href="/politica-de-privacidade" class="hover:underline">Política de Privacidade</a>
				{#if data.user}
					<form
						action="/auth/delete-account"
						method="POST"
						onsubmit={(e) => {
							if (!confirm('Atenção: Tem certeza de que deseja deletar sua conta? Esta ação é irreversível e excluirá permanentemente todos os seus dados.')) {
								e.preventDefault();
							}
						}}
					>
						<button
							type="submit"
							class="text-zinc-600 hover:text-red-600 transition-colors cursor-pointer hover:underline bg-transparent border-0 p-0 font-normal"
							title="Deletar permanentemente sua conta"
						>
							Deletar conta
						</button>
					</form>
				{/if}
			</div>
		</div>
	</footer>
</div>
