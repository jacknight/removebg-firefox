const saveOptions = async (e) => {
  e.preventDefault();
  const apiKey = document.getElementById("apikey").value || "";
  chrome.storage.local.set({
    removebgapikey: apiKey,
  });
  chrome.runtime.reload();
};

const restoreOptions = async () => {
  const apiKey = (await chrome.storage.local.get("removebgapikey")).removebgapikey;
  console.log(apiKey);
  document.getElementById("apikey").value = apiKey || "";
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("form").addEventListener("submit", saveOptions);
