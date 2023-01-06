<script lang="ts">
	export let value: string
	export let type: string = 'text'
	export let readonly: boolean = false

	function typeAction(node: HTMLInputElement) {
		node.type = type
	}
</script>

<input
	{...$$restProps}
	use:typeAction
	{readonly}
	bind:value
	class="px-2 leading-8 font-mono bg-gray-100 input-borders"
/>
