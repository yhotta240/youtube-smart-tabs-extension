// 初期化
let context = 'all'; // コンテキストの初期値を設定（全体を対象）
let title = chrome.runtime.getManifest().name; // 拡張機能の名前をmanifest.jsonから取得
let isEnabled = false; // ツールの有効状態を示すフラグ（初期値はfalse）

// 拡張機能がインストールされたときに実行される処理
chrome.runtime.onInstalled.addListener((details) => {
  console.log('拡張機能がインストールされました。', title, details.reason);
  chrome.tabs.create({ url: 'docs/index.html' });
  chrome.storage.local.get('isEnabled', (data) => {
    isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
    actionIcon(isEnabled); // アイコンのテキストを更新
  });
  // コンテキストメニューを作成
  console.log('コンテキストメニューを作成します。', isEnabled);
  createParentContextMenu();
});

// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  console.log('ストレージが変更されました。', changes);
  // 'isEnabled'の変更があった場合
  if (changes.isEnabled) {
    // 新しい値を取得し、未設定の場合は既存の'isEnabled'を保持
    isEnabled = changes.isEnabled.newValue;
    // openEditor(isEnabled);
    actionIcon(isEnabled);
  }

  updateContextMenu(); // コンテキストメニューを更新
});


// コンテキストメニューの項目がクリックされたときに実行される処理
chrome.contextMenus.onClicked.addListener((info) => {
  console.log('コンテキストメニューがクリックされました。', info);
  if (info.menuItemId === "extensionPage") {
    // すでにdocs/index.htmlが開かれている場合は、削除して新しいタブを開く
    chrome.tabs.query({ url: "chrome-extension://" + chrome.runtime.id + "/docs/index.html" }, (tabs) => {
      console.log('docs/index.htmlが開かれているタブを見つけました。', tabs);
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
  console.log('タブが更新されました。', tabId, changeInfo);
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get('isEnabled', (data) => {
      isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
      updateContextMenu(); // コンテキストメニューを更新
    });
  }
});


// コンテキストメニューを更新する関数
function updateContextMenu() {
  chrome.contextMenus.remove("keyEnabled", () => {
    // 削除が成功した場合に新しいメニュー項目を作成
    console.log('コンテキストメニューを更新しました。');
    if (!chrome.runtime.lastError) {
      enabledContextMenu();
    }
  });
}

function createParentContextMenu() {
  chrome.contextMenus.create({
    title: title, // 有効/無効に応じたタイトルを設定
    contexts: [context], // メニューを表示するコンテキスト
    id: "Extension" // メニュー項目のID
  });

  chrome.contextMenus.create({
    title: "拡張機能のページを開く", // 有効/無効に応じたタイトルを設定
    contexts: [context], // メニューを表示するコンテキスト
    parentId: "Extension",
    id: "extensionPage"
  });

  enabledContextMenu();
}

function enabledContextMenu() {
  console.log('コンテキストメニューを作成しました。', isEnabled);
  chrome.contextMenus.create({
    title: `YouTube スマートタブを${isEnabled ? '無効にする' : '有効にする'}`,
    contexts: [context], // メニューを表示するコンテキスト
    parentId: "Extension",
    id: "keyEnabled"
  });
}

chrome.action.onClicked.addListener((tab) => {
  isEnabled = !isEnabled; // 有効状態を反転
  console.log("アクションボタンがクリックされました。", tab, isEnabled);
  actionIcon(isEnabled); // アイコンのテキストを更新
  chrome.storage.local.set({ isEnabled: isEnabled }); // 状態をストレージに保存
});

function actionIcon(isEnabled) {
  chrome.action.setIcon({
    path: isEnabled ? "icons/icon.png" : "icons/icon_gray.png"
  });
  // chrome.action.setBadgeText({ text: isEnabled ? 'ON' : '' });
  // chrome.action.setBadgeBackgroundColor({ color: isEnabled ? '#4688F1' : '#CCCCCC' });
}

