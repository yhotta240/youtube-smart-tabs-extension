const docsUrl = "index.html";
const context = 'all' as const;
const title: string = chrome.runtime.getManifest().name ?? '';
let isEnabled: boolean = false;

interface MenuItem {
  title: string;
  contexts: chrome.contextMenus.ContextType[];
  parentId: string;
  id: string;
}

const menuItems: chrome.contextMenus.CreateProperties[] = [
  { title: "Youtubeを開く", contexts: [context], parentId: "Extension", id: "youtubePage" },
  { title: "拡張機能のページを開く", contexts: [context], parentId: "Extension", id: "extensionPage" },
  { title: `YouTube スマートタブを${isEnabled ? '無効にする' : '有効にする'}`, contexts: [context], parentId: "Extension", id: "keyEnabled" },
  { title: "ストアページに移動", contexts: [context], parentId: "Extension", id: "storePage" },
  { title: "この拡張機能を管理する", contexts: [context], parentId: "Extension", id: "manageExtension" },
  { title: "問題を報告する", contexts: [context], parentId: "Extension", id: "reportIssue" }
];

// 拡張機能がインストールされたときに実行される処理
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  console.log('拡張機能がインストールされました。', title, details.reason);
  //オプションページを開く
  if (details.reason === 'install') {
    chrome.tabs.create({ url: docsUrl });
  }
  chrome.storage.local.get('isEnabled', (data: { isEnabled?: boolean }) => {
    isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
    actionIcon(isEnabled);
  });
  createContextMenu();
});

// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue as boolean;
    actionIcon(isEnabled);
  }
  updateContextMenu();
});

// コンテキストメニューの項目がクリックされたときに実行される処理
chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData) => {
  const actions: Record<string, () => void> = {
    youtubePage: () => chrome.tabs.create({ url: 'https://www.youtube.com' }),
    extensionPage: () => {
      chrome.tabs.query({ url: `chrome-extension://${chrome.runtime.id}/${docsUrl}` }, (tabs: chrome.tabs.Tab[]) => {
        if (tabs.length > 0 && tabs[0].id) chrome.tabs.remove(tabs[0].id);
        chrome.tabs.create({ url: docsUrl });
      });
    },
    keyEnabled: () => {
      isEnabled = !isEnabled;
      chrome.storage.local.set({ isEnabled });
      updateContextMenu();
    },
    manageExtension: () => chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` }),
    storePage: () => chrome.tabs.create({ url: `https://chrome.google.com/webstore/detail/${chrome.runtime.id}` }),
    reportIssue: () => chrome.tabs.create({ url: 'https://forms.gle/qkaaa2E49GQ5QKMT8' })
  };
  const menuItemId = info.menuItemId as string;
  if (actions[menuItemId]) actions[menuItemId]();
});

// タブが更新されたときに実行される処理
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: { status?: string }, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get('isEnabled', (data: { isEnabled?: boolean }) => {
      isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
      updateContextMenu();
    });
  }
});

// コンテキストメニューを更新する関数
function updateContextMenu(): void {
  chrome.contextMenus.update("keyEnabled", {
    title: `YouTube スマートタブを${isEnabled ? '無効にする' : '有効にする'}`
  });
}

function createContextMenu(): void {
  chrome.contextMenus.create({
    title: title,
    contexts: [context],
    id: "Extension"
  });
  menuItems.forEach(item => chrome.contextMenus.create(item));
}

// ブラウザアクションがクリックされたときに実行される処理
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  isEnabled = !isEnabled;
  console.log(`Tab clicked: ${isEnabled}`);
  actionIcon(isEnabled);
  chrome.storage.local.set({ isEnabled: isEnabled });
});

function actionIcon(isEnabled: boolean): void {
  chrome.action.setIcon({
    path: isEnabled ? "icons/icon.png" : "icons/icon_gray.png"
  });
}

chrome.runtime.onMessage.addListener((message: { action: string }, sender: chrome.runtime.MessageSender, sendResponse: () => void) => {
  const cssFilePath = 'comment-detail.css';
  const tabId = sender.tab?.id;
  if (!tabId) return;
  if (message.action === "insertCSS") {
    chrome.scripting.insertCSS({
      target: { tabId },
      files: [cssFilePath]
    }, () => {
      console.log('Received message in background:', message);
    });
  } else if (message.action === "removeCSS") {
    chrome.scripting.removeCSS({
      target: { tabId },
      files: [cssFilePath]
    });
  }
});