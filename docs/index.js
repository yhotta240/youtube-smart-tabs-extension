// 初期化処理
let isEnabled = false;
const enabledElement = document.getElementById('enabled');
const messageDiv = document.getElementById('message');
const manifestData = chrome.runtime.getManifest();

// チェックボックス（トグルボタン）の状態が変更されたとき，ツールの有効/無効状態を更新
enabledElement.addEventListener('change', (event) => {
  isEnabled = event.target.checked;
  chrome.storage.local.set({ isEnabled: isEnabled });
});

// 保存された設定（'settings'と'isEnabled'）を読み込む
chrome.storage.local.get(['settings', 'isEnabled'], (data) => {
  if (enabledElement) {
    isEnabled = data.isEnabled || false;
    enabledElement.checked = isEnabled;
  }
  messageOutput(dateTime(), isEnabled ? `${manifestData.name} は有効になっています` : `${manifestData.name} は無効になっています`);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled && enabledElement) {
    isEnabled = changes.isEnabled.newValue;
    enabledElement.checked = isEnabled;
  }
  chrome.storage.local.set({ isEnabled: isEnabled }, () => {
    messageOutput(dateTime(), isEnabled ? `${manifestData.name} は有効になっています` : `${manifestData.name} は無効になっています`);
  });
});

// DOMの読み込み完了を監視し，完了後に実行
document.addEventListener('DOMContentLoaded', function () {
  const title = document.getElementById('title');
  title.textContent = `${manifestData.name}`;
  const titleHeader = document.getElementById('title-header');
  titleHeader.textContent = `${manifestData.name}`;
  const enabledLabel = document.getElementById('enabled-label');
  enabledLabel.textContent = `${manifestData.name} を有効にする`;
  const storeLink = document.getElementById('store_link');
  storeLink.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
  if (storeLink) clickURL(storeLink);
  const extensionLink = document.getElementById('extension_link');
  extensionLink.href = `chrome://extensions/?id=${chrome.runtime.id}`;
  if (extensionLink) clickURL(extensionLink);
  const issueLink = document.getElementById('issue-link');
  if (issueLink) clickURL(issueLink);
  document.getElementById('extension-id').textContent = `${chrome.runtime.id}`;
  document.getElementById('extension-name').textContent = `${manifestData.name}`;
  document.getElementById('extension-version').textContent = `${manifestData.version}`;
  document.getElementById('extension-description').textContent = `${manifestData.description}`;
  chrome.permissions.getAll((result) => {
    let siteAccess;
    if (result.origins.length > 0) {
      if (result.origins.includes("<all_urls>")) {
        siteAccess = "すべてのサイト";
      } else {
        siteAccess = result.origins.join("<br>");
      }
    } else {
      siteAccess = "クリックされた場合のみ";
    }
    document.getElementById('site-access').innerHTML = siteAccess;
  });
  chrome.extension.isAllowedIncognitoAccess((isAllowedAccess) => {
    document.getElementById('incognito-enabled').textContent = `${isAllowedAccess ? '有効' : '無効'}`;
  });
  const githubLink = document.getElementById('github-link');
  if (githubLink) clickURL(githubLink);
});

// index.html内のリンクを新しいタブで開けるように設定する関数
function clickURL(link) {
  const url = link.href ? link.href : link;
  if (link instanceof HTMLElement) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      chrome.tabs.create({ url });
    });
  }
}

// メッセージを指定した日時とともに出力する関数
function messageOutput(datetime, message) {
  messageDiv.innerHTML += '<p class="m-0">' + datetime + ' ' + message + '</p>';
}

// メッセージをクリアする処理
document.getElementById('clear-button').addEventListener('click', () => {
  messageDiv.innerHTML = '<p class="m-0">' + '' + '</p>';
});

// 現在の時間を取得する
// "年-月-日 時:分" の形式で返す（例：2024-11-02 10:52）
function dateTime() {
  const now = new Date();
  const year = now.getFullYear();                                    // 年
  const month = String(now.getMonth() + 1).padStart(2, '0');         // 月（0始まりのため+1）
  const day = String(now.getDate()).padStart(2, '0');                // 日
  const hours = String(now.getHours()).padStart(2, '0');             // 時
  const minutes = String(now.getMinutes()).padStart(2, '0');         // 分
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  return formattedDateTime;
}


