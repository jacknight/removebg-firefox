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
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute(
        "download",
        `removebg_${quality}_${url.split("/").pop()}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } else {
      const json = await resp.json();
      console.log(json);
      browser.notifications.create({
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
  browser.contextMenus.removeAll();

  if (apiKey) {
    browser.contextMenus.create({
      id: "removebg-preview",
      title: "Preview Quality (max. 0.25 megapixels)",
      contexts: ["image"],
    });

    browser.contextMenus.create({
      id: "removebg-hq",
      title: "High Quality (max. 25 megapixels)",
      contexts: ["image"],
    });

    browser.contextMenus.onClicked.addListener(async (info) => {
      if (info.mediaType !== "image") return;

      onClick(
        info.srcUrl,
        info.menuItemId === "removebg-hq" ? "auto" : "preview",
        apiKey
      );
    });
  } else {
    browser.contextMenus.create({
      id: "removebg-apikey",
      title: "Remove.bg - Add API Key",
      contexts: ["image"],
    });

    browser.contextMenus.onClicked.addListener((info) => {
      if (info.mediaType !== "image") return;

      if (info.menuItemId === "removebg-apikey") {
        browser.runtime.openOptionsPage();
      }
    });
  }
};

browser.storage.local.get("removebgapikey").then((resp) => {
  const apiKey = resp.removebgapikey;
  createMenuItems(apiKey);
});
