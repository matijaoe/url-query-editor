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
	class="input-borders bg-gray-100 px-2 font-mono leading-8"
/>
