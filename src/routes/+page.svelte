<script lang="ts">
	import FieldButton from '$lib/components/FieldButton.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import Label from '$lib/components/Label.svelte'
	import ValueInput from '$lib/components/ValueInput.svelte'
	import { getCurrentTabUrl, navigateTo, copy } from '$lib/utils'
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

	function copyUrlToClipboard() {
		if (!url) return
		copy(url.href)
	}

	function copySearchParamsToClipboard() {
		if (!url) return
		copy(url.search)
	}

	let initialHref: string | undefined
	let url: URL | undefined

	let protocols = ['http:', 'https:']

	type Param = {
		key: string
		value: string
	}

	onMount(async () => {
		initialHref = import.meta.env.DEV ? window.location.href : await getCurrentTabUrl()
		setInitialUrl()
		if (url?.protocol && !protocols.includes(url.protocol)) {
			protocols = [...protocols, url.protocol]
		}
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

	function focusQueryInputByIndex(index: number, type: 'key' | 'value') {
		setTimeout(() => {
			if (!url) return
			const el = document.querySelector<HTMLInputElement>(`#query-${type}-input-${index}`)
			el?.focus()
		}, 0)
	}

	function addQueryParam() {
		if (!url) return
		if (!newParam.key) return

		url.searchParams.append(newParam.key, newParam.value)

		clearNewParam()

		updateUrl(url)

		focusQueryInputByIndex(Array.from(url.searchParams).length - 1, 'key')
	}

	function deleteQuery(key: string, index: number) {
		if (!url) return
		const entries: KeyValueTuple[] = Array.from(url.searchParams)

		deleteAllSearchParams()
		entries.splice(index, 1)
		refillSearchParams(entries)

		updateUrl(url)
	}

	function duplicateQuery(key: string) {
		if (!url) return
		url.searchParams.append(key, '')
		focusQueryInputByIndex(Array.from(url.searchParams).length - 1, 'value')
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

	// TODO: strange bugs when pressing two keys at the same time on the new param input
	// TODO: handle invalid url
</script>

<main>
	<div id="popup-window" class="bg-white text-sm">
		{#if url}
			<form on:submit|preventDefault={navigateToBuiltUrl}>
				<textarea
					placeholder="Full URL"
					rows="3"
					bind:value={url.href}
					class="input-borders min-h-[68px] w-full break-all bg-gray-100 p-3 font-mono"
				/>

				<div class="space-y-1 px-3 pt-1 pb-3">
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
										class="cursor-pointer border border-transparent bg-gray-100 px-3 leading-8 hover:bg-gray-200"
										class:checked
										data-protocol={protocol}
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
							<Label>Search Params</Label>

							<div class="flex justify-end gap-1">
								{#if url && Array.from(url.searchParams ?? []).length > 0}
									<FieldButton
										on:click={copySearchParamsToClipboard}
										icon="ic:outline-copy-all"
										title="Copy search params"
									>
										Copy all
									</FieldButton>

									<FieldButton
										on:click={deleteAllSearchParams}
										icon="ic:outline-clear-all"
										title="Clear all"
									>
										Clear
									</FieldButton>
								{/if}

								<FieldButton
									on:click={sortQueryParams}
									icon="ic:outline-sort-by-alpha"
									title="Sort alphabetically"
								>
									Sort
								</FieldButton>
							</div>
						</div>

						<table class="border-collapse border border-gray-200">
							<thead>
								<tr class="grid grid-cols-3 text-left">
									<th>
										<div class="px-2">
											<Label>Key</Label>
										</div>
									</th>
									<th class="col-span-2">
										<div class="px-2">
											<Label>Value</Label>
										</div>
									</th>
								</tr>
							</thead>
							<tbody>
								{#each [...url.searchParams] as [key, value], i (i)}
									<tr class="grid grid-cols-3">
										<td class="flex items-center">
											<input
												id={`query-key-input-${i}`}
												class="input-borders col-span-2 w-full bg-gray-100 px-2 font-mono leading-8"
												value={key}
												on:input={(e) => updateQueryKeyHandler(e, i)}
											/>
										</td>
										<td class="col-span-2 flex">
											<input
												id={`query-value-input-${i}`}
												class="input-borders col-span-2 w-full bg-gray-100 px-2 font-mono leading-8"
												{value}
												on:input={(e) => updateQueryValueHandler(e, key, i)}
											/>
											<div class="mr-2 flex">
												<button
													on:click={() => duplicateQuery(key)}
													type="button"
													title="Duplicate"
													class="query-param-btn primary"
												>
													<Icon icon="ic:outline-content-copy" />
												</button>
												<button
													on:click={() => deleteQuery(key, i)}
													type="button"
													title="Remove"
													class="query-param-btn danger "
												>
													<Icon icon="ic:outline-clear" />
												</button>
											</div>
										</td>
									</tr>
								{/each}
								<tr class="grid grid-cols-3">
									<td class="flex items-center">
										<input
											class="input-borders col-span-2 w-full bg-gray-100 px-2 font-mono leading-8 placeholder:lowercase"
											placeholder="Key"
											bind:value={newParam.key}
											on:input={() => addQueryParam()}
										/>
									</td>
									<td class="col-span-2 flex">
										<input
											class="input-borders col-span-2 w-full bg-gray-100 px-2 font-mono leading-8 placeholder:lowercase"
											placeholder="Value"
											bind:value={newParam.value}
										/>
										{#if newParam.value}
											<div class="mr-1 flex">
												<button
													on:click={clearNewParam}
													type="button"
													title="Remove"
													class="query-param-btn danger text-gray-900 "
												>
													<Icon icon="ic:outline-clear" />
												</button>
											</div>
										{/if}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div class="flex">
					<button
						class="flex flex-1 items-center justify-center gap-2 bg-teal-500 py-3 px-6 pr-6 text-sm font-semibold uppercase text-white"
						type="submit"
						title="Reload page with new URL applied"
					>
						Go to URL
						<Icon icon="ic:outline-open-in-browser" class="text-lg" />
					</button>
					<button
						class="flex items-center justify-center gap-2 bg-teal-700 py-3 px-6 text-sm font-semibold uppercase text-gray-50"
						on:click={copyUrlToClipboard}
						type="button"
						title="Copy URL to clipboard"
					>
						Copy
						<Icon icon="ic:outline-link" class="text-lg" />
					</button>
					{#if url?.href !== initialHref}
						<button
							class="flex items-center justify-center gap-2 bg-teal-900 py-3 px-6 text-sm font-semibold uppercase text-gray-50"
							on:click={setInitialUrl}
							type="button"
							title="Reset url"
						>
							Reset
							<Icon icon="ic:outline-restart-alt" class="text-lg" />
						</button>
					{/if}
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
		width: 480px;
		max-height: 1200px;
		min-height: 300px;
		@apply resize-y overflow-auto;
	}

	.checked {
		@apply text-white;

		@apply !bg-orange-500;

		&[data-protocol='http:'] {
			@apply !bg-red-500;
		}

		&[data-protocol='https:'] {
			@apply !bg-teal-500;
		}
	}

	:global(.input-borders) {
		@apply border border-transparent invalid:!border-red-500 invalid:!bg-red-50 read-only:!bg-gray-100 focus:border-teal-500 focus:bg-gray-100 focus:outline-none;
	}

	:is(th, td) {
		@apply border border-gray-200 bg-gray-100 p-0;
	}

	.query-param-btn {
		@apply grid aspect-square place-content-center px-2 text-gray-900 hover:text-white focus:text-white focus:outline-none;

		&.danger {
			@apply hover:bg-red-500  focus:bg-red-500;
		}

		&.primary {
			@apply hover:bg-teal-500  focus:bg-teal-500;
		}
	}
</style>
