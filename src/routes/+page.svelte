<script lang="ts">
	import { getUrl } from '$lib/utils'
	import { onMount } from 'svelte'

	let url: string | undefined = undefined

	onMount(async () => {
		url = import.meta.env.DEV ? window.location.href : await getUrl()
	})

	console.log('this is a popup-window')
</script>

<div id="popup-window" style="width: 400px;height: 500px">
	<div class="font-mono text-sm bg-amber-200 text-amber-600">{url}</div>
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
</style>
