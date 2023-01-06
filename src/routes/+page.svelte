<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import Label from '$lib/components/Label.svelte'
	import ValueInput from '$lib/components/ValueInput.svelte'
	import { getCurrentTabUrl, navigateTo } from '$lib/utils'
	import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@rgossiaux/svelte-headlessui'
	import { onMount } from 'svelte'

	function navigateToBuiltUrl() {
		if (!url) return
		navigateTo(url.href ?? '')
	}

	function setInitialUrl() {
		if (!initialHref) return
		url = new URL(initialHref)
	}

	function updateUrl(newUrl: URL | undefined) {
		if (!newUrl) return
		url = new URL(newUrl)
	}

	function sortQueryParams() {
		if (!url) return
		url?.searchParams.sort()
		updateUrl(url)
	}

	let initialHref: string | undefined
	let url: URL | undefined

	const protocols = ['http:', 'https:']

	$: searchParams = url ? url.searchParams : undefined

	onMount(async () => {
		initialHref = import.meta.env.DEV ? window.location.href : await getCurrentTabUrl()
		setInitialUrl()
	})

	function updateQueryKey(key: string, oldKey: string) {
		if (!url) return

		const newUrl = new URL(url.href)

		const value = newUrl.searchParams.get(oldKey) ?? ''
		newUrl.searchParams.delete(oldKey)
		newUrl.searchParams.set(key, value)

		updateUrl(newUrl)
	}

	function updateQueryValue(key: string, value: string) {
		if (!url) return

		const newUrl = new URL(url.href)
		newUrl.searchParams.set(key, value)

		updateUrl(newUrl)
	}

	function updateQueryKeyHandler(e: Event, oldKey: string) {
		updateQueryKey((e.target as HTMLInputElement).value, oldKey)
	}

	function updateQueryValueHandler(e: Event, key: string) {
		updateQueryValue(key, (e.target as HTMLInputElement).value)
	}

	function handleProtocolChange(e: Event & { detail: string }) {
		if (!url) return
		url.protocol = e.detail
	}

	// $: console.log(url)

	let newParam = {
		key: '',
		value: '',
	}

	// key=value?&key2=value2
</script>

<main>
	<div id="popup-window" class="bg-white text-sm">
		{#if url}
			<form on:submit|preventDefault={navigateToBuiltUrl}>
				<textarea
					rows="2"
					bind:value={url.href}
					class="input-borders w-full break-all bg-gray-100 p-2 font-mono"
				/>

				<div class="space-y-4 p-3">
					<div class="grid grid-cols-[100px_1fr] items-center gap-1">
						<Label>Origin</Label>
						<ValueInput readonly bind:value={url.origin} />

						<Label>Hostname</Label>
						<ValueInput bind:value={url.hostname} />

						{#if url.port || new URL(initialHref ?? '').port}
							<Label>Port</Label>
							<ValueInput type="number" min="1" max="65535" bind:value={url.port} />
						{/if}

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
											class="cursor-default bg-gray-100 px-4 leading-8 hover:bg-sky-100"
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
						<div class="flex items-center justify-between gap-2">
							<Label>Query Params</Label>
							<button
								on:click={sortQueryParams}
								class="flex items-center justify-center gap-2 bg-gray-100 px-1 py-1 text-xs font-medium uppercase"
							>
								Sort
								<Icon icon="mdi:sort-ascending" class="text-sm text-gray-900" />
							</button>
						</div>
						<table class="!mt-2 w-full">
							<thead class="w-full">
								<tr class="grid grid-cols-3 items-center text-left">
									<th class="bg-gray-100 px-2 leading-8">
										<Label>Key</Label>
									</th>
									<th class="col-span-2 bg-gray-100 px-2 leading-8">
										<Label>Value</Label>
									</th>
								</tr>
							</thead>
							<tbody>
								{#each [...searchParams] as [key, value]}
									<tr class="grid grid-cols-3">
										<td class="p-0">
											<input
												class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
												value={key}
												on:input={(e) => updateQueryKeyHandler(e, key)}
											/>
										</td>
										<td class="col-span-2 p-0">
											<input
												class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
												{value}
												on:input={(e) => updateQueryValueHandler(e, key)}
											/>
										</td>
									</tr>
								{/each}
								<!-- <tr class="grid grid-cols-3">
									<td class="p-0">
										<input
											class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
											bind:value={newParam.key}
											on:input={(e) => handleQueryKeySet(newParam.key)}
										/>
									</td>
									<td class="col-span-2 p-0">
										<input
											class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
											bind:value={newParam.value}
											on:input={(e) => handleQueryParamSet(newParam.key, newParam.value)}
										/>
									</td>
								</tr> -->
							</tbody>
						</table>
					{/if}
				</div>

				<div class="flex">
					<button
						class="flex-2 w-full bg-sky-500 py-3 px-8 text-sm font-semibold uppercase text-white"
						type="submit"
					>
						Load page
					</button>
					<button
						class="w-full flex-1 bg-gray-800 py-3 px-8 text-sm font-semibold uppercase text-gray-50"
						on:click={setInitialUrl}
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
		@apply border border-transparent invalid:!border-red-500 invalid:bg-red-50 read-only:!bg-gray-100 focus:border-sky-500 focus:bg-gray-100 focus:outline-none;
	}
</style>
