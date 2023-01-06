<script lang="ts">
	import { onMount } from 'svelte';

	let url: string | undefined = undefined;

	async function getUrl() {
		const tabs = await chrome.tabs?.query({ active: true, currentWindow: true });
		return tabs?.at(0)?.url;
	}

	onMount(async () => {
		if (import.meta.env.PROD) {
			url = await getUrl();
		} else {
			url = window.location.href;
		}
	});

	console.log('this is a popup-window');
</script>

<div id="popup-window" style="width: 400px;height: 500px">
	<div class="url">{url}</div>
</div>

<style>
	#popup-window {
		box-sizing: border-box;
		padding: 8px;
		max-width: 800px;
		max-height: 600px;
		min-width: 200px;
		min-height: 150px;
		resize: vertical;
		overflow: auto;
	}

	.url {
		font-size: 14px;
		font-family: 'SF Mono', 'Roboto Mono', 'Fira Code', 'Fira Mono', 'Droid Sans Mono', 'Monaco',
			monospace;
	}
</style>
