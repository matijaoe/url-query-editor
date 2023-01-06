export async function getCurrentTabUrl() {
	const tabs = await chrome.tabs?.query({ active: true, currentWindow: true })
	return tabs?.at(0)?.url
}

export function navigateTo(url: string) {
	chrome.tabs?.update({ url })
}
