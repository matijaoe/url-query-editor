<script>
	import '../app.postcss'
</script>

<slot />

<style lang="postcss" global>
	::selection {
		@apply bg-sky-200;
	}
</style>
