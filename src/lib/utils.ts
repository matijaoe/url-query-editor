export async function getUrl() {
  const tabs = await chrome.tabs?.query({ active: true, currentWindow: true });
  return tabs?.at(0)?.url;
}
