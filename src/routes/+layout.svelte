<script>
	import '../app.postcss'
</script>

<slot />

<style lang="postcss" global>
	@import url('https://fonts.cdnfonts.com/css/sf-mono');

	::selection {
		@apply bg-teal-400/30;
	}
</style>
