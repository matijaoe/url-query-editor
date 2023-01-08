<script lang="ts">
	import FieldButton from '$lib/components/FieldButton.svelte'
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

	function sortQueryParams() {
		if (!url) return
		url?.searchParams.sort()
		updateUrl(url)
	}

	let initialHref: string | undefined
	let url: URL | undefined

	const protocols = ['http:', 'https:']

	type Param = {
		key: string
		value: string
	}

	onMount(async () => {
		initialHref = import.meta.env.DEV ? window.location.href : await getCurrentTabUrl()
		setInitialUrl()
	})

	function updateUrl(_url: URL) {
		url = new URL(_url.href)
	}

	function updateQueryKey(key: string, index: number) {
		if (!url) return

		const entries: KeyValueTuple[] = Array.from(url.searchParams)

		deleteAllSearchParams()

		if (entries.at(index)) {
			entries.at(index)![0] = key
		}

		refillSearchParams(entries)

		updateUrl(url)
	}

	type KeyValueTuple = [string, string]

	function setQueryParameter(key: string, value: string, index: number) {
		if (!url) return

		if (url.searchParams.has(key)) {
			const entries: KeyValueTuple[] = Array.from(url.searchParams)

			if (entries.at(index)) {
				entries.at(index)![1] = value
			}

			deleteAllSearchParams()
			refillSearchParams(entries)
		} else {
			url.searchParams.set(key, value)
		}

		updateUrl(url)
	}

	function deleteAllSearchParams() {
		if (!url) return
		url.search = ''
		updateUrl(url)
	}

	function refillSearchParams(entries: KeyValueTuple[]) {
		entries.forEach(([key, value]) => {
			url?.searchParams.append(key, value)
		})
	}

	function updateQueryKeyHandler(e: Event, index: number) {
		const key = (e.target as HTMLInputElement).value
		updateQueryKey(key, index)
	}

	function updateQueryValueHandler(e: Event, key: string, index: number) {
		const value = (e.target as HTMLInputElement).value
		setQueryParameter(key, value, index)
	}

	function handleProtocolChange(e: Event & { detail: string }) {
		if (!url) return
		url.protocol = e.detail
	}

	$: {
		if (url && url.searchParams.has('') && url.searchParams.get('') === '') {
			url.searchParams.delete('')
			updateUrl(url)
		}
	}

	function addQueryParam() {
		if (!url) return
		if (!newParam.key) return

		url.searchParams.append(newParam.key, newParam.value)

		clearNewParam()

		updateUrl(url)

		setTimeout(() => {
			if (!url) return
			const el = document.querySelector<HTMLInputElement>(
				`#query-key-input-${Array.from(url.searchParams).length - 1}`
			)
			el?.focus()
		}, 0)
	}

	function deleteQuery(key: string, index: number) {
		if (!url) return
		const entries: KeyValueTuple[] = Array.from(url.searchParams)

		deleteAllSearchParams()
		entries.splice(index, 1)
		refillSearchParams(entries)

		updateUrl(url)
	}

	let newParam: Param = {
		key: '',
		value: '',
	}

	function clearNewParam() {
		newParam.key = ''
		newParam.value = ''
	}
</script>

<main>
	<div id="popup-window" class="bg-white text-sm">
		{#if url}
			<form on:submit|preventDefault={navigateToBuiltUrl}>
				<textarea
					rows="2"
					bind:value={url.href}
					class="input-borders min-h-[68px] w-full break-all bg-gray-100 p-2 font-mono"
				/>

				<div class="space-y-1 p-3">
					<RadioGroup
						value={url.protocol}
						on:change={handleProtocolChange}
						class="grid grid-cols-[80px_1fr] items-center gap-x-4 gap-y-1 "
					>
						<RadioGroupLabel>
							<Label>Protocol</Label>
						</RadioGroupLabel>
						<div class="flex items-center font-mono">
							{#each protocols as protocol}
								<RadioGroupOption bind:value={protocol} let:checked>
									<p
										class="cursor-pointer border border-transparent bg-gray-100 px-3 leading-8 hover:bg-sky-100"
										class:checked
									>
										{protocol}
									</p>
								</RadioGroupOption>
							{/each}
						</div>
					</RadioGroup>

					<div class="grid grid-cols-[80px_1fr] items-center gap-x-4 gap-y-1">
						<Label>Hostname</Label>
						<ValueInput bind:value={url.hostname} />

						{#if url.port || new URL(initialHref ?? '').port}
							<Label>Port</Label>
							<ValueInput type="number" min="1" max="65535" bind:value={url.port} />
						{/if}
					</div>

					<div class="pt-2">
						<div class="flex items-center justify-between gap-2">
							<Label>Query Params</Label>

							<div class="flex justify-end gap-1">
								{#if Array.from(url.searchParams ?? []).length > 0}
									<FieldButton on:click={deleteAllSearchParams} icon="ic:sharp-delete-sweep">
										Clear
									</FieldButton>
								{/if}

								<FieldButton on:click={sortQueryParams} icon="ic:sharp-sort-by-alpha">
									Sort
								</FieldButton>
							</div>
						</div>

						<table>
							<thead>
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
								{#each [...url.searchParams] as [key, value], i (i)}
									<tr class="grid grid-cols-3">
										<td class="bg-gray-100 p-0">
											<input
												id={`query-key-input-${i}`}
												class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
												value={key}
												on:input={(e) => updateQueryKeyHandler(e, i)}
											/>
										</td>
										<td class="col-span-2 flex items-center p-0">
											<input
												class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
												{value}
												on:input={(e) => updateQueryValueHandler(e, key, i)}
											/>
											<div class="h-full bg-gray-100">
												<button
													on:click={() => deleteQuery(key, i)}
													type="button"
													class=" mr-1 flex aspect-square h-full items-center justify-center px-2 text-gray-900 hover:bg-red-500 hover:text-white"
												>
													<Icon icon="ic:sharp-clear" />
												</button>
											</div>
										</td>
									</tr>
								{/each}
								<tr class="grid grid-cols-3">
									<td class="p-0">
										<input
											class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
											placeholder="Key"
											bind:value={newParam.key}
											on:input={() => addQueryParam()}
										/>
									</td>
									<td class="col-span-2 p-0">
										<input
											class="input-borders col-span-2 w-full rounded-none bg-gray-100 px-2 font-mono leading-8"
											placeholder="Value"
											bind:value={newParam.value}
										/>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
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
