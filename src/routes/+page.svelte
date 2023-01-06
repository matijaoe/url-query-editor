<script lang="ts">
	import Label from '$lib/components/Label.svelte'
	import ValueInput from '$lib/components/ValueInput.svelte'
	import { getCurrentTabUrl, navigateTo } from '$lib/utils'
	import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@rgossiaux/svelte-headlessui'
	import { onMount } from 'svelte'

	function navigateToBuiltUrl() {
		if (!url) return
		navigateTo(url.href ?? '')
	}

	function setUrl() {
		if (!initialHref) return
		url = new URL(initialHref)
	}

	let initialHref: string | undefined
	let url: URL | undefined

	const protocols = ['http:', 'https:']

	$: searchParams = url ? url.searchParams : undefined

	onMount(async () => {
		initialHref = import.meta.env.DEV ? window.location.href : await getCurrentTabUrl()
		setUrl()
	})

	function handleQueryParamChange(e: InputEvent, key: string) {
		const value = (e.target as HTMLInputElement).value

		if (!url) return

		const newUrl = new URL(url.href ?? '')
		newUrl.searchParams.set(key, value)
		url = newUrl
	}

	function handleProtocolChange(e: Event & { detail: string }) {
		if (!url) return
		url.protocol = e.detail
	}
</script>

<main>
	<div id="popup-window" class="bg-white text-sm">
		{#if url}
			<form on:submit|preventDefault={navigateToBuiltUrl}>
				<textarea
					rows="2"
					bind:value={url.href}
					class="w-full break-all p-2 font-mono bg-gray-100 input-borders"
				/>

				<div class="space-y-4 p-3">
					<div class="grid grid-cols-[100px_1fr] items-center gap-1">
						<Label>Origin</Label>
						<ValueInput readonly bind:value={url.origin} />

						<Label>Hostname</Label>
						<ValueInput bind:value={url.hostname} />

						<Label>Port</Label>
						<ValueInput type="number" min="1" max="65535" bind:value={url.port} />

						<Label>Search</Label>
						<ValueInput bind:value={url.search} />

						<RadioGroup
							value={url.protocol}
							on:change={handleProtocolChange}
							class="grid grid-cols-[100px_1fr] items-center gap-1"
						>
							<RadioGroupLabel>
								<Label>Protocol</Label>
							</RadioGroupLabel>
							<div class="flex items-center">
								{#each protocols as protocol}
									<RadioGroupOption value={protocol} let:checked>
										<p
											class="cursor-default px-4 leading-8 bg-gray-100 hover:bg-sky-100"
											class:checked
										>
											{protocol}
										</p>
									</RadioGroupOption>
								{/each}
							</div>
						</RadioGroup>
					</div>

					{#if searchParams}
						<Label>Query Params</Label>
						<table class="w-full !mt-2">
							<thead class="w-full">
								<tr class="grid grid-cols-3 text-left items-center">
									<th class="leading-8 bg-gray-100 px-2">
										<Label>Key</Label>
									</th>
									<th class="col-span-2 leading-8 bg-gray-100 px-2">
										<Label>Value</Label>
									</th>
								</tr>
							</thead>
							<tbody>
								{#each [...searchParams] as [key, value]}
									<tr class="grid grid-cols-3">
										<td class="p-0">
											<input
												class="font-mono px-2 leading-8 bg-gray-100 col-span-2 w-full rounded-none input-borders"
												bind:value={key}
											/>
										</td>
										<td class="col-span-2 p-0">
											<input
												class="font-mono px-2 leading-8 bg-gray-100 col-span-2 w-full rounded-none input-borders"
												on:input={(e) => handleQueryParamChange(e, key)}
											/>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>

				<div class="flex">
					<button
						class="w-full py-3 px-8 bg-sky-500 text-white flex-2 uppercase text-sm font-semibold"
						type="submit"
					>
						Load page
					</button>
					<button
						class="w-full py-3 px-8 bg-gray-800 text-gray-50 flex-1 uppercase text-sm font-semibold"
						on:click={setUrl}
						type="button"
					>
						Reset
					</button>
				</div>
			</form>
		{:else}
			<div class="p-3">
				<p class="text-center">No URL found</p>
			</div>
		{/if}
	</div>
</main>

<style lang="postcss">
	#popup-window {
		width: 420px;
		max-height: 600px;
		min-height: 150px;
		@apply resize-y overflow-auto;
	}

	.checked {
		@apply !bg-sky-500 text-white;
	}

	:global(.input-borders) {
		@apply border border-transparent focus:outline-none focus:border-sky-500 focus:bg-gray-100 invalid:bg-red-50 invalid:!border-red-500 read-only:!bg-gray-100;
	}
</style>
