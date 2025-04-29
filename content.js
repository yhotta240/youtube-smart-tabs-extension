const manifestData = chrome.runtime.getManifest();

const tabs = [
  { num: 1, id: "description", name: "概要", elementName: "description" },
  { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
  { num: 3, id: "comments", name: "コメント", elementName: "comments" },
  { num: 4, id: "related", name: "関連", elementName: "related" },
  { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
  { num: 6, id: "donation-shelf", name: "寄付", elementName: "donationShelf" },
  // { num: 7, id: "extension-settings", name: "設定" }
];

const defaultCheckedTabs = [
  { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
  { num: 3, id: "comments", name: "コメント", elementName: "comments" },
  { num: 4, id: "related", name: "関連", elementName: "related" },
  { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
  // { num: 7, id: "extension-settings", name: "設定" }
];
const defaultSelectedTab = { id: "auto", name: "自動（推奨）", elementName: "auto" }; // 初期値を設定
const settingsOptions = ["概要", "チャット", "コメント", "関連", "再生リスト", "寄付"];

const settingsOption = [
  { num: 0, id: "auto", name: "自動（推奨）", elementName: "auto" },
  { num: 1, id: "description", name: "概要", elementName: "description" },
  { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
  { num: 3, id: "comments", name: "コメント", elementName: "comments" },
  { num: 4, id: "related", name: "関連", elementName: "related" },
  { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
  { num: 6, id: "donation-shelf", name: "寄付", elementName: "donationShelf" },
  // { num: 7, id: "extension-settings", name: "設定" }
];

// DOM要素の取得を関数化
const getElements = () => {
  return {
    mastheadContainer: document.querySelector('#masthead-container.style-scope.ytd-app'),
    below: document.querySelector('#below.style-scope.ytd-watch-flexy'),
    primary: document.querySelector('#primary.style-scope.ytd-watch-flexy'),
    secondary: document.querySelector('#secondary.style-scope.ytd-watch-flexy'),
    secondaryInner: document.querySelector('#secondary-inner.style-scope.ytd-watch-flexy'),
    description: document.querySelector('#description.item.style-scope.ytd-watch-metadata'),
    comments: document.querySelector('#comments.style-scope.ytd-watch-flexy'),
    related: document.querySelector('#related.style-scope.ytd-watch-flexy'),
    chatContainer: document.querySelector('#chat-container.style-scope.ytd-watch-flexy'),
    playlist: document.querySelector('#playlist.style-scope.ytd-watch-flexy'),
    donationShelf: document.querySelector('#donation-shelf.style-scope.ytd-watch-flexy'),
    settings: document.querySelector('#extension-settings.style-scope.ytd-watch-flexy'),
    customTab: document.querySelector('#custom-tab'),
    chatViewBtn: document.querySelector('button-view-model.yt-spec-button-view-model.ytTextCarouselItemViewModelButton'),
    // chatViewBtn: document.querySelector('#show-hide-button.style-scope.ytd-live-chat-frame'),
    chatClosedBtn: document.querySelector('#close-button.style-scope.yt-live-chat-header-renderer'),
    chatContainerTab: document.querySelector('#chat-container-tab'), // chatContainerTab
    chat: document.querySelector('#chat'),

  };
}
// Sampleツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    // console.log(`${manifestData.name} がONになりました`);
    observer.observe(document.body, { childList: true, subtree: true });
    intervalAction();
  } else {
    // console.log(`${manifestData.name} がOFFになりました`);
    observer.disconnect();
  }
};

const height = () => { // 画面の高さを取得する関数
  const header = document.querySelector('#container.style-scope.ytd-masthead');
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;
  console.log("height", windowHeight, headerHeight, windowHeight - headerHeight - 155);
  return windowHeight - headerHeight - 155;
};

let isEnabled = false;
let checkedTabs = null;
let selectedTab = null;
let preRespWidth = null;

// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['isEnabled', 'checkedTabs', 'selectedTab'], (data) => {
  isEnabled = data.isEnabled ?? false;
  checkedTabs = data.checkedTabs ?? defaultCheckedTabs;
  checkedTabs.sort((a, b) => a.num - b.num);
  selectedTab = data.selectedTab ?? defaultSelectedTab;
  console.log("checkedTabs", checkedTabs, selectedTab);
  handleSampleTool(isEnabled);

});
// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
  handleSampleTool(isEnabled);
});


function intervalAction() {
  const interval = setInterval(() => {
    const { related, below, secondaryInner, chatContainer, comments, chatViewBtn } = getElements();
    if (related && below && secondaryInner && chatContainer && comments) {
      const chat = document.querySelector("#chat");
      Object.assign(secondaryInner.style, { // secondaryInnerのstyle を設定
        height: `${height()}px`,
        overflowY: 'auto',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--yt-spec-10-percent-layer)',
        borderRadius: '0 0 12px 12px',
      });
      // related.style.padding = '10px 16px 0 0';
      chatContainer.style.height = '100%';
      if (chat) {
        Object.assign(chat.style, { border: '0', height: '100%' });
      }

      checkedTabs.forEach(tab => {
        if (tab.id === 'chat-container') {
          console.log("checkedTabsにchat-containerがあります");
          // elements.below.insertBefore(chatContainer, targetElement);
          // below.appendChild(chatContainer);
          // console.log("checkedTabs", chatContainer);
        }
      });

      // 設定メニューの配置
      const isLargeScreen = window.innerWidth >= 1017;
      const customTab = document.querySelector('#custom-tab');
      // (isLargeScreen ? secondaryInner : below).appendChild(extensionSettings()); // 設定メニューの追加
      // console.log("設定メニューを追加します", isLargeScreen);
      (isLargeScreen ?
        secondaryInner.insertBefore(extensionSettings(), comments) :
        below.insertBefore(extensionSettings(), customTab.nextSibling)
      ); //customTabの下に設定メニューを追加
      console.log("設定メニューを追加しました");
      handleSettings();
      clearInterval(interval);


    }
  }, 1000);
}

function extensionSettings() {
  const settings = document.createElement('div');
  settings.id = 'extension-settings';
  settings.style.display = 'none';
  settings.setAttribute('aria-selected', 'false');
  settings.classList.add('style-scope', 'ytd-watch-flexy');

  // loadSettings の結果を待つ
  settings.innerHTML = /*html*/ `
  <div class="style-scope ytd-watch-flexy" id="settings-container" style="padding: 10px;">
    <div id="section" class="style-scope ytd-settings-options-renderer">
      <div id="settings-title" class="style-scope ytd-settings-options-renderer">タブ化するコンテンツ</div>
      <div id="content" class="style-scope ytd-settings-options-renderer">
        ${settingsOption.filter(option => option.id !== 'auto').map((option) => /*html*/ `
          <ytd-settings-checkbox-renderer class="style-scope ytd-settings-options-renderer">
            <tp-yt-paper-checkbox id="checkbox" role="checkbox" aria-checked="false" 
            class="style-scope ytd-settings-options-renderer" tabindex="0" aria-label="${option.name}"  >
              <div id="checkboxContainer" class="style-scope ytd-settings-checkbox-renderer">
                <div id="checkbox" class="checked style-scope" ></div>
              </div>
              <div id="checkbox-label" class="style-scope ytd-settings-checkbox-renderer">
                <div id="label" class="style-scope ytd-settings-checkbox-renderer"  data-value="${option.id}">${option.name}</div>
              </div>
            </tp-yt-paper-checkbox>
          </ytd-settings-checkbox-renderer>
        `).join('')}
      </div>
    </div>
    <div id="section" class="style-scope ytd-settings-options-renderer">
      <div id="settings-title" class="style-scope ytd-settings-options-renderer">最初に表示するタブ</div>
      <div id="content" class="style-scope ytd-settings-options-renderer">
        <div id="options" class="style-scope ytd-settings-options-renderer">
          ${settingsOption.map((option) => /*html*/ `
            <ytd-settings-radio-option-renderer class="style-scope ytd-settings-options-renderer">
              <tp-yt-paper-radio-button id="radio" class="style-scope ytd-settings-radio-option-renderer" role="radio"
                tabindex="0" toggles="" aria-checked="false" aria-disabled="false" aria-label="${option.name}"
                style="--paper-radio-button-ink-size: 60px;">
                <div id="radioContainer" class="style-scope tp-yt-paper-radio-button">
                  <div id="offRadio" class="style-scope "></div>
                  <div id="onRadio" class="style-scope "></div>
                </div>
                <div id="label" class="style-scope ytd-settings-radio-option-renderer"  data-value="${option.id}">${option.name}</div>
              </tp-yt-paper-radio-button>
            </ytd-settings-radio-option-renderer>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
  
  `;

  // console.log("return settings", settings);
  return settings;
}

// ページ読み込み時にsettingsの選択状態を復元
function handleSettings() {
  const { settings } = getElements();
  // console.log("settings みつかりました", settings);
  checkbox = settings.querySelectorAll("#checkbox");
  radioButtons = settings.querySelectorAll("#radio");
  // console.log("checkbox", checkbox);
  // console.log("radioButtons", radioButtons);

  // デフォルト値の適用
  if (!checkedTabs) {
    checkedTabs = defaultCheckedTabs;
    chrome.storage.local.set({ checkedTabs }, () => {
    }); // デフォルト値を保存
  }
  if (!selectedTab) {
    selectedTab = defaultSelectedTab;
    chrome.storage.local.set({ selectedTab }, () => {
    }); // デフォルト値を保存
  }

  if (checkedTabs) { // チェックボックスの選択状態を復元
    checkbox.forEach((cb, index) => {
      // 設定のラベルを取得
      const labelElement = cb.querySelector("#label.style-scope.ytd-settings-checkbox-renderer");
      if (labelElement) {
        const labelVal = labelElement.dataset.value;
        console.log("label:", labelVal, labelElement.textContent);
        if (checkedTabs.some((tab) => tab.id === labelVal)) {
          cb.setAttribute("aria-checked", "true");
          cb.setAttribute("checked", "");
          cb.setAttribute("active", "");
        } else {
          cb.setAttribute("aria-checked", "false");
          cb.removeAttribute("checked");
          cb.removeAttribute("active");
        }
      }
    });

    console.log("Restored checked tabs:", checkedTabs);
  }

  checkbox.forEach((cb, index) => { // チェックボックスのイベントリスナー
    cb.addEventListener('click', () => {
      const labelElement = cb.querySelector("#label.style-scope.ytd-settings-checkbox-renderer");
      const labelVal = labelElement.dataset.value;
      const label = labelElement.textContent;
      const isChecked = cb.getAttribute("aria-checked") === "true";
      console.log(`Checkbox ${labelVal} clicked. Checked: ${isChecked}`);
      if (isChecked) {
        const tabId = tabs.find(tab => tab.id === labelVal)?.id;
        const tabNum = tabs.find(tab => tab.id === labelVal)?.num;
        const tabElementName = tabs.find(tab => tab.id === labelVal)?.elementName;
        if (tabId) {
          checkedTabs = checkedTabs.filter(tab => tab.id !== labelVal);
          checkedTabs.push({ id: tabId, name: label, num: tabNum, elementName: tabElementName });
        }
      } else {
        checkedTabs = checkedTabs.filter(tab => tab.id !== labelVal);
      }
      chrome.storage.local.set({ checkedTabs: checkedTabs }, () => {
        console.log("Checked tabs saved:", checkedTabs);
      }); // 選択状態を保存
    });
  });

  // ラジオボタンの状態を復元
  if (selectedTab) {
    radioButtons.forEach((radio, index) => {
      const option = index === 0 ? "自動（推奨）" : settingsOptions[index - 1];
      if (option === selectedTab) {
        radio.setAttribute("aria-checked", "true");
        radio.setAttribute("checked", "");
        radio.setAttribute("active", "");
      } else {
        radio.setAttribute("aria-checked", "false");
        radio.removeAttribute("checked");
        radio.removeAttribute("active");
      }
    });
  }

  radioButtons.forEach((radio, index) => {
    radio.addEventListener('click', () => {
      radioButtons.forEach((r, i) => {
        const option = i === 0 ? "自動（推奨）" : settingsOptions[i - 1];
        if (r === radio) {
          r.setAttribute("aria-checked", "true");
          r.setAttribute("checked", "");
          r.setAttribute("active", "");
          selectedTab = option;
          chrome.storage.local.set({ selectedTab: selectedTab }, () => {
            console.log("selectedTab", selectedTab);
          }); // 選択状態を保存
        } else {
          r.setAttribute("aria-checked", "false");
          r.removeAttribute("checked");
          r.removeAttribute("active");
        }
      });
    });
  });

};

let preUrl = null;
// メインの処理
const observer = new MutationObserver(() => {
  const elements = getElements();

  if (!elements.below || !elements.secondary || !elements.secondaryInner) return;
  const isLargeScreen = window.innerWidth >= 1017;
  const customTab = document.querySelector('#custom-tab');

  const url = new URL(window.location.href);
  const preVideoId = preUrl ? new URL(preUrl).searchParams.get("v") : null; //// 前のURLからvideoIdを取得
  const currentVideoId = url.searchParams.get("v"); // 現在のURLからvideoIdを取得

  const chat = document.querySelector("#chat");

  if (!customTab) {
    handleFirstRender(elements, checkedTabs, isLargeScreen);


    if (preVideoId !== currentVideoId) {
      console.log("URLが変更されました", preUrl, "から", url.href);
      handleUrlChange(chat);
      preUrl = url.href;
    }
  } else {
    handleResize(elements, customTab, isLargeScreen);
    if (preVideoId !== currentVideoId && preUrl) {
      console.log("PreURL:", preUrl, "URL:", url.href);
      customTab.remove();
    } else if (preVideoId !== currentVideoId) {
      // customTab.remove();
      console.log("カスタムタブを削除する");
      preUrl = "https://www.youtube.com/";
    }
  }

  preRespWidth = isLargeScreen ? 'large' : 'medium';

});

// 初回レンダリング時の処理
function handleFirstRender(elements, checkedTabs, isLargeScreen) {
  console.log("Custom Tabが見つかりません");
  if (isLargeScreen) {
    displayElementNone(elements.secondaryInner);
    const tabs = createTab(checkedTabs);
    elements.secondary.insertBefore(tabs, elements.secondary.firstChild);
    insertSecondary(elements.secondaryInner, elements.comments);
    // elements.secondaryInner.appendChild(extensionSettings());
    clickTab(elements.secondaryInner);
  } else {
    displayElementNone(elements.below);
    const tabs = createTab(checkedTabs);
    const targetElement = elements.below.querySelector('#related');
    elements.below.insertBefore(tabs, targetElement);
    // elements.below.appendChild(extensionSettings());
    //checkedTabsのid:chat-containerがあったらchatContainerの位置を移動

    clickTab(elements.below);
  }
  console.log("タブを作成しました");
}
// ウィンドウサイズ変更時の処理
function handleResize(elements, customTab, isLargeScreen) {

  const sizeClass = 'yt-spec-button-shape-next--size-';
  if (isLargeScreen && preRespWidth === 'medium') {
    console.log("Switched to large screen layout");
    renderUI();
    Array.from(customTab.children).forEach(tab => {
      if (tab.classList.contains(`${sizeClass}m`)) {
        tab.classList.replace(`${sizeClass}m`, `${sizeClass}s`);
      }
    });

    // 大画面レイアウトに合わせて要素を移動
    elements.secondary.insertBefore(customTab, elements.secondary.firstChild);
    elements.secondaryInner.appendChild(elements.comments);
    elements.secondaryInner.appendChild(elements.settings);

    // タブのクリックイベント処理
    clickTab(elements.secondaryInner);

  } else if (!isLargeScreen && preRespWidth === 'large') {
    console.log("Switched to medium screen layout");

    Array.from(customTab.children).forEach(tab => {
      if (tab.classList.contains(`${sizeClass}s`)) {
        tab.classList.replace(`${sizeClass}s`, `${sizeClass}m`);
      }
    });

    // 中画面レイアウトに合わせて要素を移動
    const related = elements.secondaryInner.querySelector('#related');
    elements.below.appendChild(elements.settings);
    elements.below.appendChild(related);
    elements.below.insertBefore(customTab, elements.settings);
    elements.below.appendChild(elements.comments);

    // タブのクリックイベント処理
    clickTab(elements.below);
  }
}
// URL変更時の処理
function handleUrlChange(chat) {
  let tryCount = 0;
  const maxTries = 10;
  const interval = setInterval(() => {
    renderUI();
    const { below, chatContainer, chatViewBtn, chatContainerTab } = getElements();
    // チャットリプレイパネルのイベントリスナ登録
    if (chatViewBtn && !chatViewBtn._reg) {
      console.log("チャットリプレイパネルのイベントリスナを登録します", chatViewBtn);
      chatViewBtn.addEventListener('click', () => {
        removeCustomTabSelected();
        displayElementNone(below);
        chatContainer.style.display = 'block';
        chatContainerTab.click();
      }, { once: true });
      chatViewBtn._reg = true;
    }

    const commentsHidden = document.querySelector("#comments.style-scope.ytd-watch-flexy").hasAttribute("hidden");
    const teaserCarousel = document.querySelector("#teaser-carousel");
    const playlist = document.querySelector("#playlist");
    // hidden属性の確認
    // console.log("チャット", chat !== null, chat, "コメント欄", !!commentsContents, commentsContents ? commentsContents.className : false, commentsContents ? commentsContents.classList : false, commentsHidden);

    const customTab = document.querySelector('#custom-tab');
    let filteredTabs = checkedTabs.filter(filteredTab => {
      const element = getElements()[filteredTab.elementName];
      const tabElement = customTab.querySelector(`#${filteredTab.id}-tab`);
      // console.log(filteredTab.id, element?.children.length);

      let shouldHideTab = false;

      if (filteredTab.id === 'chat-container') {
        // console.log("チャット", filteredTab.id === 'chat-container' && !teaserCarousel.hasAttribute("hidden") || element?.children.length === 2);
        shouldHideTab = !(filteredTab.id === 'chat-container' && !teaserCarousel.hasAttribute("hidden") || element?.children.length === 2);
      }

      if (filteredTab.id === 'comments') {
        // console.log("コメント", commentsHidden ? "がない" : "あり", (commentsHidden));
        shouldHideTab = (commentsHidden);
      }

      if (filteredTab.id === 'related') {
        // console.log("関連", filteredTab.id === 'related' && (element && element.children.length > 1));
        shouldHideTab = !(element && element.children.length > 1);
      }

      if (filteredTab.id === 'playlist') {
        // console.log("再生リスト", filteredTab.id === 'playlist' && (playlist && playlist.hasAttribute("hidden")));
        shouldHideTab = playlist && playlist.hasAttribute("hidden");
      }

      console.log(filteredTab.id, "を", shouldHideTab ? "非表示" : "表示");
      // タブを表示・非表示にする
      tabElement.style.display = shouldHideTab ? 'none' : 'block';

      return !shouldHideTab;
    });


    filteredTabs.sort((a, b) => a.num - b.num);
    console.log("filteredTabs", filteredTabs);

    if (filteredTabs.length > 0) {
      const tablist = filteredTabs
        .map(filtered => customTab.querySelector(`#${filtered.id}-tab`)) // 各IDに対応する要素を取得
        .filter(tab => tab !== null); // 存在する要素だけに絞る

      // クラスの適用
      tablist.forEach((tab, index) => {
        if (index === 0) {
          tab.classList.remove('yt-spec-button-shape-next--segmented-interval');
          tab.classList.add('yt-spec-button-shape-next--segmented-start');
        } else {
          tab.classList.remove('yt-spec-button-shape-next--segmented-start');
          tab.classList.add('yt-spec-button-shape-next--segmented-interval');
        }
      });
    }

    // 最大試行回数に達したら終了
    if (!commentsHidden || tryCount >= maxTries) {
      clearInterval(interval);
      return;
    }
    tryCount++;
  }, 500);
}

// タブの選択状態を管理する関数
function setActiveTab() {
  const { customTab } = getElements();

}

function renderUI() {
  const { related, below, primary, secondary, secondaryInner, chatContainer, comments, customTab, mastheadContainer } = getElements();
  if (related && below && secondary && secondaryInner && chatContainer && comments) {
    const chat = document.querySelector("#chat");
    Object.assign(secondaryInner.style, {
      height: `${height()}px`,
      overflowY: 'auto',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'var(--yt-spec-10-percent-layer)',
      borderRadius: '0 0 12px 12px',
    });
    // related.style.padding = '10px 16px 0 0';
    chatContainer.style.height = '100%';
    if (chat) {
      Object.assign(chat.style, { border: '0', height: '100%' });
    }

    if (primary && customTab) { // タブを固定
      console.log("タブを固定しました", customTab, primary.offsetTop, customTab.clientHeight + primary.offsetTop);
      customTab.style.top = primary.offsetTop + 'px';
      secondaryInner.style.top = customTab.clientHeight + primary.offsetTop + 'px';
    }
    // if (mastheadContainer && customTab) { // タブを固定
    //   console.log("タブを固定しました", customTab, mastheadContainer.clientHeight, customTab.clientHeight + mastheadContainer.clientHeight, secondaryInner.style.top);
    //   customTab.style.top = mastheadContainer.clientHeight + 'px';
    //   secondaryInner.style.top = `${customTab.clientHeight + mastheadContainer.clientHeight}px`;
    // }
  }
}

function createTab(checkedTabs) {
  console.log("タブを作成します");
  let filteredTabs = checkedTabs;
  filteredTabs.sort((a, b) => a.num - b.num);
  const elements = getElements();

  const tab = document.createElement('div');
  const btnSize = `yt-spec-button-shape-next--size-${window.innerWidth >= 1017 ? 's' : 'm'}`;
  tab.id = 'custom-tab';
  tab.classList.add('style-scope', 'yt-button-group');
  tab.style.marginBottom = `${window.innerWidth >= 1017 ? '' : '10px;'}`;
  tab.role = 'tablist';
  tab.innerHTML = /*html*/`
    ${filteredTabs.map((tab, index) => /*html*/`      
      <button
        class="style-scope yt-chip-cloud-chip-renderer yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono ${btnSize} yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--segmented-${index === 0 ? 'start' : 'interval'}"
        id="${tab.id}-tab"
        data-bs-toggle="pill"
        data-bs-target="#${tab.id}"
        type="button"
        role="tab"
        aria-controls="${tab.id}"
        aria-selected="false"
      >
        <span class="style-scope yt-chip-cloud-chip-renderer">${tab.name}</span>
      </button>
    `).join('')}
      <button
        class="style-scope yt-chip-cloud-chip-renderer yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono ${btnSize} yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--segmented-end"
        id="extension-settings-tab"
        data-bs-toggle="pill"
        data-bs-target="#extension-settings"
        type="button"
        role="tab"
        aria-controls="extension-settings"
        aria-selected="false"
      >
        <span class="style-scope yt-chip-cloud-chip-renderer">設定</span>
      </button>
    `;
  tab.style.backgroundColor = "var(--yt-spec-base-background)";
  setTimeout(() => {
    const startButton = tab.querySelector(".yt-spec-button-shape-next--segmented-start");
    const intervalButtons = tab.querySelectorAll(".yt-spec-button-shape-next--segmented-interval");
    console.log("タブを整形");

    if (startButton) {
      const bgColor = window.getComputedStyle(startButton).backgroundColor;
      const rgbaColor = bgColor.replace(/rgb(a)?\((\d+), (\d+), (\d+)(, [\d.]+)?\)/, (_, a, r, g, b) => {
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      });
      intervalButtons.forEach(btn => {
        btn.style.setProperty("--segmented-bg-color", rgbaColor);
      });
    }
  }, 0);


  return tab;
}

function displayElementNone(innerContent) {
  const elements = getElements();
  checkedTabs.forEach(tab => {
    // console.log('tab.elementName', tab.elementName);
    const element = elements[tab.elementName];
    if (element) {
      element.style.display = 'none';
      element.setAttribute('aria-selected', 'false');
    }
  });
  // elements.settings.style.display = 'none';
  // elements.settings.setAttribute('aria-selected', 'false');
  const settings = innerContent.querySelector('#extension-settings');
  if (settings) {
    settings.style.display = 'none';
    settings.setAttribute('aria-selected', 'false');
  }
}

function insertSecondary(secondaryInner, comments) {
  // comments.style.padding = '0 10px 0 10px';
  // comments.style.maxHeight = `${height()}px`;
  // comments.style.overflowY = 'auto';
  comments.setAttribute('aria-selected', 'true');
  secondaryInner.insertBefore(comments, secondaryInner.firstChild);
  // secondaryInner.appendChild(customDiv);
}

function clickTab(innerContent) {
  const buttons = document.querySelectorAll('[data-bs-target]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-bs-target');
      // チャットが選択されたとき
      if (targetId === '#chat-container') getElements().chatViewBtn?.click();
      removeCustomTabSelected();
      displayElementNone(innerContent);
      button.classList.add('custom-tab-selected')
      const targetContent = document.querySelector(targetId);
      if (targetContent) {
        targetContent.style.display = 'block';
      }
    });
  });

}
function removeCustomTabSelected() {
  const buttons = document.querySelectorAll('[data-bs-target]');
  buttons.forEach(button => {
    button.classList.remove('custom-tab-selected');
  });
}


let initialHeight = window.innerHeight; // 初期の高さを取得
window.addEventListener('resize', () => {
  const windowHeight = window.innerHeight;
  // 初期の高さを取得してどのくらい変化したかを確認
  const heightDiff = windowHeight - initialHeight; // 絶対値
  console.log("Height diff:", windowHeight, initialHeight, heightDiff);
  initialHeight = windowHeight; // 新しい高さを初期値として保存
  const { secondaryInner, chat } = getElements();
  if (secondaryInner) {
    setTimeout(() => {
      console.log("secondaryInner", secondaryInner.offsetHeight, heightDiff, chat, document.querySelector("#chat-messages"));
      secondaryInner.style.height = `${secondaryInner.offsetHeight + heightDiff}px`;
      if (chat) {
        chat.style.height = `${chat.offsetHeight + heightDiff}px`;
      }
    }, 1);
  }
});