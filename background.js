// 初期化
let context = 'all';
let title = chrome.runtime.getManifest().name;
let isEnabled = false;

// 拡張機能がインストールされたときに実行される処理
chrome.runtime.onInstalled.addListener((details) => {
  console.log('拡張機能がインストールされました。', title, details.reason);
  chrome.tabs.create({ url: 'docs/index.html' });
  chrome.storage.local.get('isEnabled', (data) => {
    isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
    actionIcon(isEnabled);
  });
  createContextMenu();
});

// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
    actionIcon(isEnabled);
  }
  updateContextMenu();
});

// コンテキストメニューの項目がクリックされたときに実行される処理
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "extensionPage") {
    chrome.tabs.query({ url: "chrome-extension://" + chrome.runtime.id + "/docs/index.html" }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.remove(tabs[0].id);
      }
      chrome.tabs.create({ url: 'docs/index.html' });
    });
  }
  if (info.menuItemId === "keyEnabled") {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ isEnabled: isEnabled });
    updateContextMenu();
  }
});

// タブが更新されたときに実行される処理
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get('isEnabled', (data) => {
      isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
      updateContextMenu();
    });
  }
});

// コンテキストメニューを更新する関数
function updateContextMenu() {
  chrome.contextMenus.remove("keyEnabled", () => {
    if (!chrome.runtime.lastError) {
      enabledContextMenu();
    }
  });
}

function createContextMenu() {
  chrome.contextMenus.create({
    title: title,
    contexts: [context],
    id: "Extension"
  });
  chrome.contextMenus.create({
    title: "拡張機能のページを開く",
    contexts: [context],
    parentId: "Extension",
    id: "extensionPage"
  });
  enabledContextMenu();
}

function enabledContextMenu() {
  chrome.contextMenus.create({
    title: `YouTube スマートタブを${isEnabled ? '無効にする' : '有効にする'}`,
    contexts: [context],
    parentId: "Extension",
    id: "keyEnabled"
  });
}

chrome.action.onClicked.addListener((tab) => {
  isEnabled = !isEnabled;
  actionIcon(isEnabled);
  chrome.storage.local.set({ isEnabled: isEnabled });
});

function actionIcon(isEnabled) {
  chrome.action.setIcon({
    path: isEnabled ? "icons/icon.png" : "icons/icon_gray.png"
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const cssFilePath = 'settings/css/comment-detail.css';
  const tabId = sender.tab?.id;
  if (!tabId) return;
  if (message.action === "insertCSS") {
    chrome.scripting.insertCSS({
      target: { tabId },
      files: [cssFilePath]
    });
  } else if (message.action === "removeCSS") {
    chrome.scripting.removeCSS({
      target: { tabId },
      files: [cssFilePath]
    });
  }
});