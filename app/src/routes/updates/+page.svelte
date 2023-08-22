<script>
	import EventTable from '$lib/EventTable.svelte';
	import EventRow from '$lib/EventRow.svelte';

	import { readable } from 'svelte/store';
	import { browser } from '$app/environment';

	export const eventUpdate = readable('eventUpdate', (set) => {
		if (!browser) {
			return;
		}

		const ws = new WebSocket('ws://localhost:3000/data');

		ws.addEventListener('open', (event) => {
			console.info('connected to server', event);
		});

		ws.addEventListener('message', (event) => {
			console.info('message from server ', event.data);
			set(JSON.parse(event.data));
		});

		return () => ws.close();
	});
</script>

<h1>Lorem Ipsum Event Viewer: Data Update</h1>

<table class="table-auto text-left">
	<thead class="sticky top-0 bg-gray-100" />
	<tbody>
		{#if $eventUpdate.type === 'mutate'}
			<tr>
				<th>Type:</th><td>{$eventUpdate.type}</td>
			</tr>
			<tr /><tr />
			<tr>
				<th /><th>Old</th><th>New</th>
			</tr>
			<tr>
				<th>Timestamp:</th><td>{$eventUpdate.old.timestamp}</td><td>{$eventUpdate.new.timestamp}</td
				>
			</tr>
			<tr>
				<th>Id:</th><td>{$eventUpdate.old.id}</td><td>{$eventUpdate.new.id}</td>
			</tr>
			<tr>
				<th>Body:</th><td>{$eventUpdate.old.body}</td><td>{$eventUpdate.new.body}</td>
			</tr>
		{:else}
			<tr>
				<th>Type:</th><td>{$eventUpdate.type}</td>
			</tr>
			<tr>
				<th>Timestamp:</th><td>{$eventUpdate.timestamp}</td>
			</tr>
			<tr>
				<th>Body:</th><td>{$eventUpdate.body}</td>
			</tr>
		{/if}
	</tbody>
</table>
