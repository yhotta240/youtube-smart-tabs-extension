// 初期化
let context = 'all'; // コンテキストの初期値を設定（全体を対象）
let title = chrome.runtime.getManifest().name; // 拡張機能の名前をmanifest.jsonから取得
let isEnabled = false; // ツールの有効状態を示すフラグ（初期値はfalse）

// 拡張機能がインストールされたときに実行される処理
chrome.runtime.onInstalled.addListener((details) => {
  console.log('拡張機能がインストールされました。', title, details.reason);
  chrome.tabs.create({ url: 'docs/index.html' });
  // コンテキストメニューを作成
  chrome.contextMenus.create({
    title: `${title}${isEnabled ? '無効にする' : '有効にする'}`, // 有効/無効に応じたタイトルを設定
    contexts: [context], // コンテキストメニューを表示するコンテキスト
    id: "Sample" // メニュー項目のID
  });
  chrome.storage.local.get('isEnabled', (data) => {
    isEnabled = data.isEnabled !== undefined ? data.isEnabled : isEnabled;
    actionIcon(isEnabled); // アイコンのテキストを更新
  });
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
  if (info.menuItemId === "Sample") {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ isEnabled: isEnabled });
    updateContextMenu();
  }
});


// メッセージを受信したときに実行される処理
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.keyEnabled) {
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
      updateContextMenu(); // コンテキストメニューを更新
    });
  }
});


// コンテキストメニューを更新する関数
function updateContextMenu() {
  // 既存の"Sample"メニュー項目を削除
  chrome.contextMenus.remove("Sample", () => {
    // 削除が成功した場合に新しいメニュー項目を作成
    if (!chrome.runtime.lastError) {
      chrome.contextMenus.create({
        title: `${title}${isEnabled ? '無効にする' : '有効にする'}`, // 有効/無効に応じたタイトルを設定
        contexts: [context], // メニューを表示するコンテキスト
        id: "Sample" // メニュー項目のID
      });
    }
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

