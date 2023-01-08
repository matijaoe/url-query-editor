<script lang="ts">
	import Icon from './Icon.svelte'

	export let icon: string | undefined = undefined
</script>

<button
	class="flex items-center justify-center gap-1 bg-gray-100 px-1 py-1 text-xs font-medium uppercase hover:bg-gray-200"
	type="button"
	on:click
	{...$$restProps}
>
	<slot />
	{#if icon}
		<Icon {icon} class="text-sm text-gray-900" />
	{/if}
</button>
