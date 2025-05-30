// content.js
// --- このスクリプトは settings/settingsData.js と settings/extensionSetting.js が先に読み込まれた上で実行される ---
// これらの設定・データを利用して処理を行う

const getElements = () => {
  return {
    below: document.querySelector('#below.style-scope.ytd-watch-flexy'),
    primary: document.querySelector('#primary.style-scope.ytd-watch-flexy'),
    primaryInner: document.querySelector('#primary-inner.style-scope.ytd-watch-flexy'),
    secondary: document.querySelector('#secondary.style-scope.ytd-watch-flexy'),
    secondaryInner: document.querySelector('#secondary-inner.style-scope.ytd-watch-flexy'),
    description: document.querySelector('#below > ytd-watch-metadata'),
    comments: document.querySelector('#comments.style-scope.ytd-watch-flexy'),
    related: document.querySelector('#related.style-scope.ytd-watch-flexy'),
    chatContainer: document.querySelector('#chat-container.style-scope.ytd-watch-flexy'),
    playlist: document.querySelector('#playlist.style-scope.ytd-watch-flexy'),
    donationShelf: document.querySelector('#donation-shelf.style-scope.ytd-watch-flexy'),
    settings: document.querySelector('#extension-settings.style-scope.ytd-watch-flexy'),
    customTab: document.querySelector('#custom-tab'),
    chatViewBtn: document.querySelector('button-view-model.yt-spec-button-view-model.ytTextCarouselItemViewModelButton'),
    chatContainerTab: document.querySelector('#chat-container-tab'),
    chat: document.querySelector('#chat'),
  };
};

// ツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled) => {
  if (isEnabled) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
};

const height = () => { // 画面の高さを取得する関数
  const header = document.querySelector('#container.style-scope.ytd-masthead');
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;
  return windowHeight - headerHeight - 155;
};

let isEnabled = false;
let checkedTabs = null;
let selectedTab = null;
let extensionDetails = null;
let preRespWidth = null;
let isFirstSelected = false;
let isEventAdded = false;

// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['isEnabled', 'checkedTabs', 'selectedTab', 'details'], (data) => {
  isEnabled = data.isEnabled ?? false;
  checkedTabs = data.checkedTabs ?? defaultCheckedTabs;
  checkedTabs.sort((a, b) => a.num - b.num);
  selectedTab = data.selectedTab ?? defaultSelectedTab;
  extensionDetails = data.details ?? settingDetails;
  handleSampleTool(isEnabled);
});

// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue : isEnabled;
  if (changes.isEnabled) {
    window.location.reload();
  }
});

// ページ読み込み時にsettingsの選択状態を復元
function handleSettings(isFirstLoad) {
  const { settings } = getElements();
  if (!settings) return;
  const checkbox = settings.querySelectorAll("#checkbox");
  const radioButtons = settings.querySelectorAll("#radio");
  // デフォルト値の適用
  if (!checkedTabs) {
    checkedTabs = defaultCheckedTabs;
    chrome.storage.local.set({ checkedTabs });
  }
  if (!selectedTab) {
    selectedTab = defaultSelectedTab;
    chrome.storage.local.set({ selectedTab });
  }
  if (checkedTabs) { // チェックボックスの選択状態を復元
    checkbox.forEach((cb, index) => {
      const labelElement = cb.querySelector("#label.style-scope.ytd-settings-checkbox-renderer");
      if (labelElement) {
        const labelVal = labelElement.dataset.value;
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
  }
  checkbox.forEach((cb, index) => { // チェックボックスのイベントリスナー
    cb.addEventListener('click', () => {
      const labelElement = cb.querySelector("#label.style-scope.ytd-settings-checkbox-renderer");
      const labelVal = labelElement.dataset.value;
      const label = labelElement.textContent;
      const isChecked = cb.getAttribute("aria-checked") === "true";
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
      chrome.storage.local.set({ checkedTabs: checkedTabs });
    });
  });
  // ラジオボタンの状態を復元
  if (selectedTab) {
    radioButtons.forEach((radio, index) => {
      const labelElement = radio.querySelector("#label.style-scope.ytd-settings-radio-option-renderer");
      const labelVal = labelElement.dataset.value;
      if (labelVal === selectedTab.id) {
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
        r.setAttribute("aria-checked", "false");
        r.removeAttribute("checked");
        r.removeAttribute("active");
      });
      const labelElement = radio.querySelector("#label.style-scope.ytd-settings-radio-option-renderer");
      const labelVal = labelElement.dataset.value;
      const label = labelElement.textContent;
      radio.setAttribute("aria-checked", "true");
      radio.setAttribute("checked", "");
      radio.setAttribute("active", "");
      const tabId = tabs.find(tab => tab.id === labelVal)?.id;
      const tabNum = tabs.find(tab => tab.id === labelVal)?.num;
      const tabElementName = tabs.find(tab => tab.id === labelVal)?.elementName;
      selectedTab = { id: tabId ?? "auto", name: label, num: tabNum ?? 0, elementName: tabElementName ?? "auto" };
      chrome.storage.local.set({ selectedTab: selectedTab });
      if (!tabId) {
        chrome.storage.local.set({ currentTab: null });
      }
    });
  });
  // 詳細設定の状態の復元とイベントリスナの追加
  const details = settings.querySelectorAll("#detail");
  if (!details.length) return;
  if (!isFirstLoad) return;
  details.forEach(detail => {
    const toggle = detail.querySelector("#toggle");
    const detailData = extensionDetails.find(d => d.id === detail.dataset.id);
    if (detailData?.isEnabled) toggle.click();
    toggle.addEventListener('click', () => {
      detailData.isEnabled = toggle.getAttribute("aria-pressed") === "true";
      chrome.storage.local.set({ details: extensionDetails });
    });
  });
};

let preUrl = null;
// メインの処理
const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!elements.below && !elements.secondary && !elements.secondaryInner) return;
  if (!elements.secondaryInner.classList.contains('tab-container')) {
    elements.secondaryInner.classList.add('tab-container');
  }
  const isLargeScreen = window.innerWidth >= 1017;
  const customTab = document.querySelector('#custom-tab');
  const url = new URL(window.location.href);
  const preVideoId = preUrl ? new URL(preUrl).searchParams.get("v") : null; //// 前のURLからvideoIdを取得
  const currentVideoId = url.searchParams.get("v"); // 現在のURLからvideoIdを取得
  if (!customTab) {
    handleFirstRender(elements, checkedTabs, isLargeScreen);
    if (preVideoId !== currentVideoId) {
      // console.log("URLが変更", preUrl, "から", url.href);
      handleUrlChange();
      preUrl = url.href;
    }
  } else {
    handleResize(elements, customTab, isLargeScreen);
    if (preVideoId !== currentVideoId && preUrl) {
      // console.log("PreURL:", preUrl, "URL:", url.href);
      customTab.remove();
    } else if (preVideoId !== currentVideoId) {
      preUrl = "https://www.youtube.com/";
    }
  }
  preRespWidth = isLargeScreen ? 'large' : 'medium';
});

// 初回レンダリング時の処理
function handleFirstRender(elements, checkedTabs, isLargeScreen) {
  isEventAdded = false;
  if (isLargeScreen) {
    const tabs = createTab(checkedTabs);
    elements.secondary.insertBefore(tabs, elements.secondary.firstChild);
    clickTab(elements.secondaryInner);
  } else {
    const tabs = createTab(checkedTabs);
    const targetElement = elements.below.querySelector('#related');
    elements.below.insertBefore(tabs, targetElement);
    clickTab(elements.below);
  }
}

// ウィンドウサイズ変更時の処理
function handleResize(elements, customTab, isLargeScreen) {
  const sizeClass = 'yt-spec-button-shape-next--size-';
  if (isLargeScreen && preRespWidth === 'medium') {
    // console.log("Switched to large screen layout");
    renderUI();
    Array.from(customTab.children).forEach(tab => {
      if (tab.classList.contains(`${sizeClass}m`)) {
        tab.classList.replace(`${sizeClass}m`, `${sizeClass}s`);
      }
    });
    // 大画面レイアウトに合わせて要素を移動
    elements.secondary.insertBefore(customTab, elements.secondary.firstChild);
    if (elements.settings) elements.secondaryInner.appendChild(elements.settings);
    handleSettings(false);
    checkedTabs.forEach(tab => {
      const element = getElements()[tab.elementName];
      if (element) {
        elements.secondaryInner.appendChild(element);
      }
    });
    clickTab(elements.secondaryInner);
  } else if (!isLargeScreen && preRespWidth === 'large') {
    // console.log("Switched to medium screen layout");
    Array.from(customTab.children).forEach(tab => {
      if (tab.classList.contains(`${sizeClass}s`)) {
        tab.classList.replace(`${sizeClass}s`, `${sizeClass}m`);
      }
    });
    // 中画面レイアウトに合わせて要素を移動
    if (elements.settings) elements.below.appendChild(elements.settings);
    elements.below.insertBefore(customTab, elements.settings);
    handleSettings(false);
    checkedTabs.forEach(tab => {
      let element;
      if (tab.id === 'description') {
        element = document.querySelector('ytd-watch-metadata');
      } else {
        element = getElements()[tab.elementName];
      }
      if (element) {
        elements.below.appendChild(element);
      }
    });
    clickTab(elements.below);
  }
}

// URL変更時の処理
function handleUrlChange() {
  let tryCount = 0;
  const maxTries = 10;
  moveElement();
  const interval = setInterval(() => {
    const { below, chatContainer, chatViewBtn, chatContainerTab, comments, playlist } = getElements();
    renderUI();
    // チャットリプレイパネルのイベントリスナ登録
    if (chatViewBtn && !chatViewBtn._reg) {
      chatViewBtn.addEventListener('click', () => {
        removeCustomTabSelected();
        displayElementNone(below);
        chatContainer.style.display = 'block';
        chatContainerTab.click();
      }, { once: true });
      chatViewBtn._reg = true;
    }
    const commentsHidden = comments.hasAttribute("hidden");
    const teaserCarousel = document.querySelector("#teaser-carousel");
    const customTab = document.querySelector('#custom-tab');
    let filteredTabs = checkedTabs.filter(filteredTab => {
      const element = getElements()[filteredTab.elementName];
      const tabElement = customTab.querySelector(`#${filteredTab.id}-tab`);
      let shouldHideTab = false;
      if (filteredTab.id === 'chat-container') {
        shouldHideTab = !(filteredTab.id === 'chat-container' && !teaserCarousel.hasAttribute("hidden") || element?.children.length === 2);
      }
      if (filteredTab.id === 'comments') {
        shouldHideTab = (commentsHidden);
      }
      if (filteredTab.id === 'related') {
        shouldHideTab = !(element && element.children.length > 1);
      }
      if (filteredTab.id === 'playlist') {
        shouldHideTab = playlist.hasAttribute("hidden");
      }
      // console.log(filteredTab.id, "を", shouldHideTab ? "非表示" : "表示");
      tabElement.style.display = shouldHideTab ? 'none' : 'block';
      return !shouldHideTab;
    });
    filteredTabs.sort((a, b) => a.num - b.num);
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
    if (tryCount === 0) {
      isFirstSelected = true;
      setActiveTab(customTab);
    }
    // 最大試行回数に達したら終了
    if (!commentsHidden || tryCount >= maxTries) {
      setActiveTab(customTab);
      clearInterval(interval);
      return;
    }
    tryCount++;
  }, 500);
}

function moveElement() {
  const { below, secondaryInner, settings } = getElements();
  if (!below && !secondaryInner) return;
  const isLargeScreen = window.innerWidth >= 1017;
  const parent = isLargeScreen ? secondaryInner : below;
  if (!settings) {
    parent.appendChild(extensionSettings());
    handleSettings(true);
  } else {
    parent.appendChild(settings);
  }
  checkedTabs.forEach(tab => {
    const element = getElements()[tab.elementName];
    if (element) {
      if (tab.elementName === "chatContainer") {
        return;
      }
      appendElement(tab);
    }
  });
  function appendElement(tab) {
    (isLargeScreen ?
      secondaryInner.appendChild(getElements()[tab.elementName]) :
      below.appendChild(getElements()[tab.elementName])
    );
  }
}

// タブの選択状態を管理する関数
function setActiveTab(customTab) {
  const tabs = customTab.querySelectorAll('[data-bs-target]');
  const autoSelectTab = () => {
    for (const tab of tabs) {
      if (tab.style.display === 'block') {
        tab.click();
        return;
      }
    }
  };
  if (selectedTab.id === 'auto') {
    chrome.storage.local.get('currentTab', ({ currentTab }) => {
      if (currentTab) {
        const targetButton = document.querySelector(`[data-bs-target="#${currentTab.id}"]`);
        if (targetButton && targetButton.style.display === 'block') {
          targetButton.click();
        } else {
          autoSelectTab();
        }
      } else {
        autoSelectTab();
      }
    });
  } else {
    const targetTab = customTab.querySelector(`#${selectedTab.id}-tab`);
    if (targetTab && targetTab.style.display === 'block') {
      targetTab.click();
    } else {
      autoSelectTab();
    }
  }
}

function renderUI() {
  const { primaryInner, secondaryInner } = getElements();
  if (primaryInner) {
    primaryInner.style.paddingBottom = '100px';
  }
  if (secondaryInner) {
    secondaryInner.style.height = `${height()}px`;
    const descInner = document.querySelector('ytd-watch-metadata.watch-active-metadata #description-inner');
    const isDetailedDesc = extensionDetails.find(detail => detail.id === 'description-detail')?.isEnabled;
    handleCommentDetailCSS();
    if (!descInner) return;
    if (!isDetailedDesc) return;
    const descBtn = descInner.querySelector('#collapse');
    const expandBtn = descInner.querySelector('#description-inline-expander');
    const existClonedBtn = descInner.querySelector('#cloneCollapse');
    const isExpanded = descInner.querySelector('#description-inline-expander').hasAttribute('is-expanded');
    if (descBtn && expandBtn && !existClonedBtn) {
      const cloneDescBtn = descBtn.cloneNode(true);
      cloneDescBtn.id = 'cloneCollapse';
      cloneDescBtn.classList.add('cloneBtn');
      descInner.insertBefore(cloneDescBtn, descInner.firstChild);
      expandBtn.addEventListener('click', () => {
        cloneDescBtn.removeAttribute('hidden');
      });
      cloneDescBtn.addEventListener('click', () => {
        descBtn.click();
      });
      descBtn.addEventListener('click', () => {
        setTimeout(() => {
          cloneDescBtn.setAttribute('hidden', '');
        }, 100);
      });
    } else if (existClonedBtn && !isExpanded) {
      existClonedBtn.style.display = 'block';
      existClonedBtn.setAttribute('hidden', '');
    }
  }
  function handleCommentDetailCSS() {
    const isDetailedComments = extensionDetails.find(detail => detail.id === 'comment-detail')?.isEnabled;
    chrome.runtime.sendMessage({ action: isDetailedComments ? "insertCSS" : "removeCSS" });
  }
}

function createTab(checkedTabs) {
  let filteredTabs = checkedTabs;
  filteredTabs.sort((a, b) => a.num - b.num);
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
  setTimeout(() => {
    const startButton = tab.querySelector(".yt-spec-button-shape-next--segmented-start");
    const intervalButtons = tab.querySelectorAll(".yt-spec-button-shape-next--segmented-interval");
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
    const element = elements[tab.elementName];
    if (element) {
      element.style.display = 'none';
      element.setAttribute('aria-selected', 'false');
    }
    if (tab.elementName == "description") {
      const description = document.querySelector('ytd-watch-metadata')
      if (description) description.style.display = 'none';
    }
  });
  elements.settings.style.display = 'none';
  const settings = innerContent.querySelector('#extension-settings');
  if (settings) {
    settings.style.display = 'none';
    settings.setAttribute('aria-selected', 'false');
  }
}

function clickTab(innerContent) {
  const buttons = document.querySelectorAll('[data-bs-target]');
  if (isEventAdded) return;
  isEventAdded = true;
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-bs-target');
      if (targetId === '#chat-container') getElements().chatViewBtn?.click();
      removeCustomTabSelected();
      displayElementNone(innerContent);
      button.classList.add('custom-tab-selected')
      const targetContent = document.querySelector(targetId);
      if (targetContent) targetContent.style.display = 'block';
      if (targetId === '#description') {
        const description = document.querySelector('ytd-watch-metadata')
        if (description) description.style.display = 'block';
      }
      if (targetId === '#playlist') {
        const playlist = getElements().playlist;
        if (playlist) {
          playlist.style.display = 'block';
          playlist.classList.add('active', 'show');
        }
      }
      if (selectedTab.id === 'auto') {
        checkedTabs.forEach(tab => {
          if (tab.id === targetId.slice(1, targetId.length)) {
            const tabObject = { num: tab.num, id: tab.id, name: tab.name, elementName: tab.elementName };
            if (!isFirstSelected) {
              chrome.storage.local.set({ currentTab: tabObject });
            } else {
              isFirstSelected = false;
            }
          }
        });
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

let initialHeight = window.innerHeight;
window.addEventListener('resize', () => {
  const windowHeight = window.innerHeight;
  const heightDiff = windowHeight - initialHeight;
  initialHeight = windowHeight;
  const { secondaryInner, chat } = getElements();
  if (secondaryInner) {
    setTimeout(() => {
      secondaryInner.style.height = `${secondaryInner.offsetHeight + heightDiff}px`;
      if (chat) {
        chat.style.height = `${chat.offsetHeight + heightDiff}px`;
      }
    }, 100);
  }
});