<script lang="ts">
	import type { PageData } from './$types';
	import EventTable from '$lib/EventTable.svelte';
	import EventRow from '$lib/EventRow.svelte';

	export let data: PageData;
</script>

<h1>Lorem Ipsum Event Viewer: Streamed</h1>

{#await data.streamed.payload}
	Loading...
{:then payload}
	<EventTable>
		{#each payload as t (t.id)}
			<EventRow {...t} />
		{/each}
	</EventTable>
{:catch error}
	Error: {error.message}
{/await}
