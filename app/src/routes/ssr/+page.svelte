<script lang="ts">
	import type { PageData } from './$types';
	import EventTable from '$lib/EventTable.svelte';
	import EventRow from '$lib/EventRow.svelte';

	export let data: PageData;
</script>

<h1>Lorem Ipsum Event Viewer: Server-Side Rendered</h1>

<EventTable>
	{#each data.payload as t (t.id)}
		<EventRow {...t} />
	{/each}
</EventTable>
