// https://stackoverflow.com/questions/18650168/convert-blob-to-base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.substring(reader.result.indexOf(",") + 1));
    reader.readAsDataURL(blob);
  });
};

const onClick = async (url, quality, apiKey) => {
  const formData = new FormData();
  formData.append("image_url", url);
  formData.append("size", quality);
  try {
    const resp = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      body: formData,
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (resp.status === 200) {
      const blob = new Blob([await resp.blob()]);
      const urlObj = new URL(url);
      const base64Blob = await blobToBase64(blob);
      const filename = `removebg_${quality}_${urlObj.pathname.split("/").pop()}`;

      chrome.downloads.download({
        url: "data:image/png;base64," + base64Blob,
        filename,
      });
    } else {
      const json = await resp.json();
      chrome.notifications.create({
        title: "Failed to process image",
        message: json?.errors?.[0]?.title || "Unknown error",
        type: "basic",
      });
    }
  } catch (e) {
    console.error("Some error:", e);
  }
};

const createMenuItems = (apiKey) => {
  chrome.contextMenus.removeAll();

  if (apiKey) {
    chrome.contextMenus.create({
      id: "removebg-preview",
      title: "Preview Quality (max. 0.25 megapixels)",
      contexts: ["image"],
    });

    chrome.contextMenus.create({
      id: "removebg-hq",
      title: "High Quality (max. 25 megapixels)",
      contexts: ["image"],
    });

    chrome.contextMenus.onClicked.addListener(async (info) => {
      if (info.mediaType !== "image") return;

      onClick(info.srcUrl, info.menuItemId === "removebg-hq" ? "auto" : "preview", apiKey);
    });
  } else {
    chrome.contextMenus.create({
      id: "removebg-apikey",
      title: "Remove.bg - Add API Key",
      contexts: ["image"],
    });

    chrome.contextMenus.onClicked.addListener((info) => {
      if (info.mediaType !== "image") return;

      if (info.menuItemId === "removebg-apikey") {
        chrome.runtime.openOptionsPage();
      }
    });
  }
};

chrome.storage.local.get("removebgapikey").then((resp) => {
  const apiKey = resp.removebgapikey;
  createMenuItems(apiKey);
});
