<script lang="ts">
	import C99Workspace from '$lib/components/C99Workspace.svelte';

	let { data } = $props();
</script>

<C99Workspace
	turma={data.turma}
	list={data.list}
	exercises={data.exercises}
	submissions={data.submissions}
/>
