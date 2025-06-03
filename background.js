// 初期化
let context = 'all';
let title = chrome.runtime.getManifest().name;
let isEnabled = false;

const menuItems = [
  { title: "Youtubeを開く", contexts: [context], parentId: "Extension", id: "youtubePage" },
  { title: "拡張機能のページを開く", contexts: [context], parentId: "Extension", id: "extensionPage" },
  { title: `YouTube スマートタブを${isEnabled ? '無効にする' : '有効にする'}`, contexts: [context], parentId: "Extension", id: "keyEnabled" },
  { title: "ストアページに移動", contexts: [context], parentId: "Extension", id: "storePage" },
  { title: "この拡張機能を管理する", contexts: [context], parentId: "Extension", id: "manageExtension" },
  { title: "問題を報告する", contexts: [context], parentId: "Extension", id: "reportIssue" }
];

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
  const actions = {
    youtubePage: () => chrome.tabs.create({ url: 'https://www.youtube.com' }),
    extensionPage: () => {
      const docsUrl = "docs/index.html";
      chrome.tabs.query({ url: `chrome-extension://${chrome.runtime.id}/${docsUrl}` }, (tabs) => {
        if (tabs.length > 0) chrome.tabs.remove(tabs[0].id);
        chrome.tabs.create({ url: docsUrl });
      });
    },
    keyEnabled: () => {
      isEnabled = !isEnabled;
      chrome.storage.local.set({ isEnabled });
      updateContextMenu();
    },
    storePage: () => chrome.tabs.create({ url: `https://chrome.google.com/webstore/detail/${chrome.runtime.id}` }),
    reportIssue: () => chrome.tabs.create({ url: 'https://forms.gle/qkaaa2E49GQ5QKMT8' })
  };
  if (actions[info.menuItemId]) actions[info.menuItemId]();
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
  chrome.contextMenus.update("keyEnabled", {
    title: `YouTube スマートタブを${isEnabled ? '無効にする' : '有効にする'}`
  });
}

function createContextMenu() {
  chrome.contextMenus.create({
    title: title,
    contexts: [context],
    id: "Extension"
  });
  menuItems.forEach(item => chrome.contextMenus.create(item));
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