const saveOptions = async (e) => {
  e.preventDefault();
  const apiKey = document.getElementById("apikey").value || "";
  browser.storage.local.set({
    removebgapikey: apiKey,
  });
  browser.runtime.reload();
};

const restoreOptions = async () => {
  const apiKey = (await browser.storage.local.get("removebgapikey"))
    .removebgapikey;
  console.log(apiKey);
  document.getElementById("apikey").value = apiKey || "";
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("form").addEventListener("submit", saveOptions);
