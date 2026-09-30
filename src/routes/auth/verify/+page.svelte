<script lang="ts">
	let { data } = $props();
</script>

<div class="flex-1 flex items-center justify-center py-16 px-4">
	<div class="max-w-md w-full bg-white hairline-all p-8 text-center space-y-6">
		<div class="w-12 h-12 mx-auto flex items-center justify-center bg-red-50 hairline-all">
			<img src="/icons/icon_light_off.png" alt="" class="w-6 h-6 object-contain" />
		</div>

		<h1 class="font-serif text-2xl font-semibold text-zinc-900">
			Falha na Autenticação
		</h1>

		<p class="text-sm text-zinc-600 leading-relaxed">
			{data.error || 'Não foi possível validar seu acesso.'}
		</p>

		<div class="pt-4 hairline-t">
			<a
				href="/auth/login"
				class="inline-flex items-center justify-center w-full bg-zinc-900 text-white px-4 py-2.5 text-sm font-medium rounded-sm hover:bg-zinc-800 transition-colors"
			>
				Solicitar Novo Link de Acesso &rarr;
			</a>
		</div>
	</div>
</div>
