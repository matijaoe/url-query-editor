<script>
	import '../app.postcss'
</script>

<slot />

<style lang="postcss" global>
	::selection {
		@apply bg-teal-200;
	}
</style>
