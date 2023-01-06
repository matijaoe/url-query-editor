<script lang="ts">
	import Icon from '@iconify/svelte'

	export let icon: string
</script>

<Icon {icon} {...$$restProps} />
