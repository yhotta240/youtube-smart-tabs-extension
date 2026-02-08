import './style.css';
import { extensionSettings } from './tab-ui';
import { tabs, defaultCheckedTabs, defaultSelectedTab, settingDetails, Tab } from './settingsData';

interface ExtensionDetail {
  id: string;
  isEnabled: boolean;
}

interface YouTubeElements {
  below: HTMLElement | null;
  primary: HTMLElement | null;
  primaryInner: HTMLElement | null;
  secondary: HTMLElement | null;
  secondaryInner: HTMLElement | null;
  description: HTMLElement | null;
  comments: HTMLElement | null;
  related: HTMLElement | null;
  chatContainer: HTMLElement | null;
  playlist: HTMLElement | null;
  donationShelf: HTMLElement | null;
  settings: HTMLElement | null;
  customTab: HTMLElement | null;
  chatViewBtn: HTMLElement | null;
  chatContainerTab: HTMLElement | null;
  chat: HTMLElement | null;
}

interface HTMLElementWithReg extends HTMLElement {
  _reg?: boolean;
}

const getElements = (): YouTubeElements => {
  return {
    below: document.querySelector<HTMLElement>('#below.style-scope.ytd-watch-flexy'),
    primary: document.querySelector<HTMLElement>('#primary.style-scope.ytd-watch-flexy'),
    primaryInner: document.querySelector<HTMLElement>('#primary-inner.style-scope.ytd-watch-flexy'),
    secondary: document.querySelector<HTMLElement>('#secondary.style-scope.ytd-watch-flexy'),
    secondaryInner: document.querySelector<HTMLElement>('#secondary-inner.style-scope.ytd-watch-flexy'),
    description: document.querySelector<HTMLElement>('#below > ytd-watch-metadata'),
    comments: document.querySelector<HTMLElement>('#comments.style-scope.ytd-watch-flexy'),
    related: document.querySelector<HTMLElement>('#related.style-scope.ytd-watch-flexy'),
    chatContainer: document.querySelector<HTMLElement>('#chat-container.style-scope.ytd-watch-flexy'),
    playlist: document.querySelector<HTMLElement>('#playlist.style-scope.ytd-watch-flexy'),
    donationShelf: document.querySelector<HTMLElement>('#donation-shelf.style-scope.ytd-watch-flexy'),
    settings: document.querySelector<HTMLElement>('#extension-settings.style-scope.ytd-watch-flexy'),
    customTab: document.querySelector<HTMLElement>('#custom-tab'),
    chatViewBtn: document.querySelector<HTMLElement>('button-view-model.yt-spec-button-view-model.ytTextCarouselItemViewModelButton'),
    chatContainerTab: document.querySelector<HTMLElement>('#chat-container-tab'),
    chat: document.querySelector<HTMLElement>('#chat'),
  };
};

// ツールの有効/無効を処理する関数
const handleSampleTool = (isEnabled: boolean) => {
  if (isEnabled) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    observer.disconnect();
  }
};

const height = (): number => { // 画面の高さを取得する関数
  const header = document.querySelector('#container.style-scope.ytd-masthead') as HTMLElement | null;
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;
  return windowHeight - headerHeight - 155;
};

let isEnabled: boolean = false;
let checkedTabs: Tab[] | null = null;
let selectedTab: Tab | null = null;
let extensionDetails: ExtensionDetail[] | null = null;
let preRespWidth: 'large' | 'medium' | null = null;
let isFirstSelected: boolean = false;
let isEventAdded: boolean = false;

// 最初の読み込みまたはリロード後に実行する処理
chrome.storage.local.get(['isEnabled', 'checkedTabs', 'selectedTab', 'details'], (data: {
  isEnabled?: boolean;
  checkedTabs?: Tab[];
  selectedTab?: Tab;
  details?: ExtensionDetail[];
}) => {
  isEnabled = data.isEnabled ?? false;
  checkedTabs = data.checkedTabs ?? defaultCheckedTabs;
  if (checkedTabs) {
    checkedTabs.sort((a, b) => a.num - b.num);
  }
  selectedTab = data.selectedTab ?? defaultSelectedTab;
  extensionDetails = data.details ?? settingDetails;
  handleSampleTool(isEnabled);
});

// ストレージの値が変更されたときに実行される処理
chrome.storage.onChanged.addListener((changes) => {
  isEnabled = changes.isEnabled ? changes.isEnabled.newValue as boolean : isEnabled;
  if (changes.isEnabled) {
    window.location.reload();
  }
});

// ページ読み込み時にsettingsの選択状態を復元
function handleSettings(isFirstLoad: boolean): void {
  const { settings } = getElements();
  if (!settings) return;
  const checkbox = settings.querySelectorAll<HTMLElement>("#checkbox");
  const radioButtons = settings.querySelectorAll<HTMLElement>("#radio");
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
      const labelElement = cb.querySelector<HTMLElement>("#label.style-scope.ytd-settings-checkbox-renderer");
      if (labelElement && checkedTabs) {
        const labelVal = labelElement.dataset.value ?? '';
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
      const labelElement = cb.querySelector<HTMLElement>("#label.style-scope.ytd-settings-checkbox-renderer");
      if (!labelElement) return;
      const labelVal = labelElement.dataset.value ?? '';
      const label = labelElement.textContent ?? '';
      const isChecked = cb.getAttribute("aria-checked") === "true";
      if (isChecked) {
        const tabId = tabs.find(tab => tab.id === labelVal)?.id;
        const tabNum = tabs.find(tab => tab.id === labelVal)?.num;
        const tabElementName = tabs.find(tab => tab.id === labelVal)?.elementName;
        if (tabId && tabNum !== undefined && tabElementName && checkedTabs) {
          checkedTabs = checkedTabs.filter(tab => tab.id !== labelVal);
          checkedTabs.push({ id: tabId, name: label, num: tabNum, elementName: tabElementName });
        }
      } else if (checkedTabs) {
        checkedTabs = checkedTabs.filter(tab => tab.id !== labelVal);
      }
      chrome.storage.local.set({ checkedTabs: checkedTabs });
    });
  });
  // ラジオボタンの状態を復元
  if (selectedTab) {
    radioButtons.forEach((radio, index) => {
      const labelElement = radio.querySelector<HTMLElement>("#label.style-scope.ytd-settings-radio-option-renderer");
      if (!labelElement || !selectedTab) return;
      const labelVal = labelElement.dataset.value ?? '';
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
      const labelElement = radio.querySelector<HTMLElement>("#label.style-scope.ytd-settings-radio-option-renderer");
      if (!labelElement) return;
      const labelVal = labelElement.dataset.value ?? '';
      const label = labelElement.textContent ?? '';
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
  const details = settings.querySelectorAll<HTMLElement>("#detail");
  if (!details.length) return;
  if (!isFirstLoad) return;
  details.forEach(detail => {
    const toggle = detail.querySelector<HTMLElement>("#toggle");
    if (!toggle || !extensionDetails) return;
    const detailData = extensionDetails.find(d => d.id === detail.dataset.id);
    if (detailData?.isEnabled) toggle.click();
    toggle.addEventListener('click', () => {
      if (detailData) {
        detailData.isEnabled = toggle.getAttribute("aria-pressed") === "true";
        chrome.storage.local.set({ details: extensionDetails });
      }
    });
  });
};

let preUrl: string | null = null;
// メインの処理
const observer = new MutationObserver(() => {
  const elements = getElements();
  if (!elements.below && !elements.secondary && !elements.secondaryInner) return;
  if (elements.secondaryInner && !elements.secondaryInner.classList.contains('tab-container')) {
    elements.secondaryInner.classList.add('tab-container');
  }
  const isLargeScreen = window.innerWidth >= 1017;
  const customTab = document.querySelector<HTMLElement>('#custom-tab');
  const url: URL = new URL(window.location.href);
  const preVideoId: string | null = preUrl ? new URL(preUrl).searchParams.get("v") : null; //// 前のURLからvideoIdを取得
  const currentVideoId: string | null = url.searchParams.get("v"); // 現在のURLからvideoIdを取得
  if (!customTab) {
    if (checkedTabs) handleFirstRender(elements, checkedTabs, isLargeScreen);
    if (preVideoId !== currentVideoId) {
      console.log("URLが変更", preUrl, "から", url.href);
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
function handleFirstRender(elements: YouTubeElements, checkedTabs: Tab[], isLargeScreen: boolean): void {
  isEventAdded = false;
  if (isLargeScreen) {
    const tabs = createTab(checkedTabs);
    if (elements.secondary && elements.secondaryInner) {
      elements.secondary.insertBefore(tabs, elements.secondary.firstChild);
      clickTab(elements.secondaryInner);
    }
  } else {
    const tabs = createTab(checkedTabs);
    if (elements.below) {
      const targetElement = elements.below.querySelector('#related');
      elements.below.insertBefore(tabs, targetElement);
      clickTab(elements.below);
    }
  }
}

// ウィンドウサイズ変更時の処理
function handleResize(elements: YouTubeElements, customTab: HTMLElement, isLargeScreen: boolean): void {
  const sizeClass = 'yt-spec-button-shape-next--size-';
  if (isLargeScreen && preRespWidth === 'medium') {
    renderUI();
    Array.from(customTab.children).forEach(tab => {
      if (tab.classList.contains(`${sizeClass}m`)) {
        tab.classList.replace(`${sizeClass}m`, `${sizeClass}s`);
      }
    });
    // 大画面レイアウトに合わせて要素を移動
    if (elements.secondary) {
      elements.secondary.insertBefore(customTab, elements.secondary.firstChild);
    }
    if (elements.settings && elements.secondaryInner) {
      elements.secondaryInner.appendChild(elements.settings);
    }
    handleSettings(false);
    if (checkedTabs) {
      checkedTabs.forEach(tab => {
        const element = getElements()[tab.elementName as keyof YouTubeElements];
        if (element && elements.secondaryInner) {
          elements.secondaryInner.appendChild(element);
        }
      });
    }
    if (elements.secondaryInner) clickTab(elements.secondaryInner);
  } else if (!isLargeScreen && preRespWidth === 'large') {
    // console.log("Switched to medium screen layout");
    Array.from(customTab.children).forEach(tab => {
      if (tab.classList.contains(`${sizeClass}s`)) {
        tab.classList.replace(`${sizeClass}s`, `${sizeClass}m`);
      }
    });
    // 中画面レイアウトに合わせて要素を移動
    if (elements.settings && elements.below) {
      elements.below.appendChild(elements.settings);
    }
    if (elements.below) {
      elements.below.insertBefore(customTab, elements.settings);
    }
    handleSettings(false);
    if (checkedTabs) {
      checkedTabs.forEach(tab => {
        let element: HTMLElement | null;
        if (tab.id === 'description') {
          element = document.querySelector<HTMLElement>('ytd-watch-metadata');
        } else {
          element = getElements()[tab.elementName as keyof YouTubeElements];
        }
        if (element && elements.below) {
          elements.below.appendChild(element);
        }
      });
    }
    if (elements.below) clickTab(elements.below);
  }
}

// URL変更時の処理
function handleUrlChange(): void {
  let tryCount: number = 0;
  const maxTries: number = 10;
  moveElement();
  const interval = setInterval(() => {
    const { below, chatContainer, chatViewBtn, chatContainerTab, comments, playlist } = getElements();
    if (!below || !comments) return;

    // 一回だけUIをレンダリングする
    if (tryCount === 0) {
      renderUI();
    }
    // チャットリプレイパネルのイベントリスナ登録
    if (chatViewBtn && !(chatViewBtn as HTMLElementWithReg)._reg) {
      chatViewBtn.addEventListener('click', () => {
        removeCustomTabSelected();
        if (below && chatContainer && chatContainerTab) {
          displayElementNone(below);
          chatContainer.style.display = 'block';
          chatContainerTab.click();
        }
      }, { once: true });
      (chatViewBtn as HTMLElementWithReg)._reg = true;
    }
    const commentsHidden: boolean = comments.hasAttribute("hidden");
    const teaserCarousel = document.querySelector<HTMLElement>("#teaser-carousel");
    const customTab = document.querySelector<HTMLElement>('#custom-tab');
    if (!customTab || !checkedTabs) return;
    const filteredTabs: Tab[] = checkedTabs.filter(filteredTab => {
      const element = getElements()[filteredTab.elementName as keyof YouTubeElements];
      const tabElement = customTab.querySelector<HTMLElement>(`#${filteredTab.id}-tab`);
      let shouldHideTab: boolean = false;
      if (filteredTab.id === 'chat-container') {
        shouldHideTab = !(filteredTab.id === 'chat-container' && teaserCarousel && !teaserCarousel.hasAttribute("hidden") || element?.children.length === 2);
      }
      if (filteredTab.id === 'comments') {
        shouldHideTab = (commentsHidden);
      }
      if (filteredTab.id === 'related') {
        shouldHideTab = !(element && element.children.length > 1);
      }
      if (filteredTab.id === 'playlist') {
        shouldHideTab = playlist ? playlist.hasAttribute("hidden") : true;
      }
      // console.log(filteredTab.id, "を", shouldHideTab ? "非表示" : "表示");
      if (tabElement) tabElement.style.display = shouldHideTab ? 'none' : 'block';
      return !shouldHideTab;
    });
    filteredTabs.sort((a, b) => a.num - b.num);
    if (filteredTabs.length > 0) {
      const tablist: HTMLElement[] = filteredTabs
        .map(filtered => customTab.querySelector<HTMLElement>(`#${filtered.id}-tab`)) // 各IDに対応する要素を取得
        .filter((tab): tab is HTMLElement => tab !== null); // 存在する要素だけに絞る
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

function moveElement(): void {
  const { below, secondaryInner, settings } = getElements();
  if (!below && !secondaryInner) return;
  const isLargeScreen = window.innerWidth >= 1017;
  const parent = isLargeScreen ? secondaryInner : below;
  if (!parent) return;
  if (!settings) {
    parent.appendChild(extensionSettings());
    handleSettings(true);
  } else {
    parent.appendChild(settings);
  }
  if (!checkedTabs) return;
  checkedTabs.forEach(tab => {
    const element = getElements()[tab.elementName as keyof YouTubeElements];
    if (element) {
      if (tab.elementName === "chatContainer") {
        return;
      }
      appendElement(tab);
    }
  });
  function appendElement(tab: Tab): void {
    const element = getElements()[tab.elementName as keyof YouTubeElements];
    if (!element) return;
    if (isLargeScreen && secondaryInner) {
      secondaryInner.appendChild(element);
    } else if (!isLargeScreen && below) {
      below.appendChild(element);
    }
  }
}

// タブの選択状態を管理する関数
function setActiveTab(customTab: HTMLElement): void {
  const tabs = customTab.querySelectorAll<HTMLElement>('[data-bs-target]');
  const autoSelectTab = (): void => {
    for (const tab of Array.from(tabs)) {
      if (tab.style.display === 'block') {
        tab.click();
        return;
      }
    }
  };
  if (selectedTab && selectedTab.id === 'auto') {
    chrome.storage.local.get('currentTab', ({ currentTab }: { currentTab?: Tab }) => {
      if (currentTab) {
        const targetButton = document.querySelector<HTMLElement>(`[data-bs-target="#${currentTab.id}"]`);
        if (targetButton && targetButton.style.display === 'block') {
          targetButton.click();
        } else {
          autoSelectTab();
        }
      } else {
        autoSelectTab();
      }
    });
  } else if (selectedTab) {
    const targetTab = customTab.querySelector<HTMLElement>(`#${selectedTab.id}-tab`);
    if (targetTab && targetTab.style.display === 'block') {
      targetTab.click();
    } else {
      autoSelectTab();
    }
  }
}

function renderUI(): void {
  const { primaryInner, secondaryInner } = getElements();
  if (primaryInner) {
    primaryInner.style.paddingBottom = '100px';
  }
  if (secondaryInner) {
    console.log("Setting secondaryInner height");
    secondaryInner.style.height = `${height()}px`;
    const descInner = document.querySelector<HTMLElement>('ytd-watch-metadata.watch-active-metadata #description-inner');
    const isDetailedDesc: boolean | undefined = extensionDetails?.find(detail => detail.id === 'description-detail')?.isEnabled;
    handleCommentDetailCSS();
    if (!descInner) return;
    if (!isDetailedDesc) return;
    const descBtn = descInner.querySelector<HTMLElement>('#collapse');
    const expandBtn = descInner.querySelector<HTMLElement>('#description-inline-expander');
    const existClonedBtn = descInner.querySelector<HTMLElement>('#cloneCollapse');
    const isExpanded = descInner.querySelector('#description-inline-expander')?.hasAttribute('is-expanded');
    if (descBtn && expandBtn && !existClonedBtn) {
      const cloneDescBtn = descBtn.cloneNode(true) as HTMLElement;
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
  function handleCommentDetailCSS(): void {
    const isDetailedComments: boolean | undefined = extensionDetails?.find(detail => detail.id === 'comment-detail')?.isEnabled;
    chrome.runtime.sendMessage({ action: isDetailedComments ? "insertCSS" : "removeCSS" });
  }
}

function createTab(checkedTabs: Tab[]): HTMLElement {
  const filteredTabs: Tab[] = [...checkedTabs];
  filteredTabs.sort((a, b) => a.num - b.num);
  const tab: HTMLDivElement = document.createElement('div');
  const btnSize: string = `yt-spec-button-shape-next--size-${window.innerWidth >= 1017 ? 's' : 'm'}`;
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
    const startButton = tab.querySelector<HTMLElement>(".yt-spec-button-shape-next--segmented-start");
    const intervalButtons = tab.querySelectorAll<HTMLElement>(".yt-spec-button-shape-next--segmented-interval");
    if (startButton) {
      const bgColor: string = window.getComputedStyle(startButton).backgroundColor;
      const rgbaColor: string = bgColor.replace(/rgb(a)?\((\d+), (\d+), (\d+)(, [\d.]+)?\)/, (_, a, r, g, b) => {
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      });
      intervalButtons.forEach(btn => {
        btn.style.setProperty("--segmented-bg-color", rgbaColor);
      });
    }
  }, 0);
  return tab;
}

function displayElementNone(innerContent: HTMLElement): void {
  const elements = getElements();
  if (checkedTabs) {
    checkedTabs.forEach(tab => {
      const element = elements[tab.elementName as keyof YouTubeElements];
      if (element) {
        element.style.display = 'none';
        element.setAttribute('aria-selected', 'false');
      }
      if (tab.elementName === "description") {
        const description = document.querySelector<HTMLElement>('ytd-watch-metadata')
        if (description) description.style.display = 'none';
      }
    });
  }
  if (elements.settings) {
    elements.settings.style.display = 'none';
  }
  const settings = innerContent.querySelector<HTMLElement>('#extension-settings');
  if (settings) {
    settings.style.display = 'none';
    settings.setAttribute('aria-selected', 'false');
  }
}

function clickTab(innerContent: HTMLElement): void {
  const buttons = document.querySelectorAll<HTMLElement>('[data-bs-target]');
  if (isEventAdded) return;
  isEventAdded = true;
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-bs-target');
      if (!targetId) return;
      if (targetId === '#chat-container') (getElements().chatViewBtn as HTMLElementWithReg)?.click();
      removeCustomTabSelected();
      displayElementNone(innerContent);
      button.classList.add('custom-tab-selected')
      const targetContent = document.querySelector<HTMLElement>(targetId);
      if (targetContent) targetContent.style.display = 'block';
      if (targetId === '#description') {
        const description = document.querySelector<HTMLElement>('ytd-watch-metadata')
        if (description) description.style.display = 'block';
      }
      if (targetId === '#playlist') {
        const playlist = getElements().playlist;
        if (playlist) {
          playlist.style.display = 'block';
          playlist.classList.add('active', 'show');
        }
      }
      if (selectedTab && selectedTab.id === 'auto') {
        if (checkedTabs) {
          checkedTabs.forEach(tab => {
            if (tab.id === targetId.slice(1, targetId.length)) {
              const tabObject: Tab = { num: tab.num, id: tab.id, name: tab.name, elementName: tab.elementName };
              if (!isFirstSelected) {
                chrome.storage.local.set({ currentTab: tabObject });
              } else {
                isFirstSelected = false;
              }
            }
          });
        }
      }
    });
  });
}

function removeCustomTabSelected(): void {
  const buttons = document.querySelectorAll('[data-bs-target]');
  buttons.forEach(button => {
    button.classList.remove('custom-tab-selected');
  });
}

let initialHeight: number = window.innerHeight;
let rafId: number | null = null;

window.addEventListener('resize', () => {
  const windowHeight = window.innerHeight;
  const heightDiff = windowHeight - initialHeight;
  initialHeight = windowHeight;
  const { secondaryInner, chat } = getElements();
  if (!secondaryInner) return;

  const secondaryInnerHeight = secondaryInner.clientHeight;

  if (rafId !== null) cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    if (isFullscreen()) {
      secondaryInner.style.height = `${secondaryInnerHeight + heightDiff}px`;
    } else {
      secondaryInner.style.height = `${secondaryInner.clientHeight + heightDiff}px`;
    }
    if (chat) {
      chat.style.height = `${chat.offsetHeight + heightDiff}px`;
    }
  });
});

// フルスクリーン状態を確認する
function isFullscreen(): boolean {
  return !!document.fullscreenElement;
}