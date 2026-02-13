import { Tab } from '../settings';
import { extensionSettings } from './tab-ui';
import { YouTubeElements, HTMLElementWithReg } from './types';
import { getElements } from './elements';
import { storageState } from './storage';
import { handleSettings } from './settings-handler';
import { createTab, setActiveTab, clickTab, removeCustomTabSelected, displayElementNone, displayTabElement, hideTabElement, addTabClickListeners, updateSegmentedTabClasses } from './tab-manager';
import { renderUI } from './renderer';

export function handleFirstRender(elements: YouTubeElements, checkedTabs: Tab[], isLargeScreen: boolean): void {
  storageState.isEventAdded = false;
  if (isLargeScreen) {
    const tabs = createTab(checkedTabs);
    if (elements.secondary && elements.secondaryInner) {
      elements.secondary.insertBefore(tabs, elements.secondary.firstChild);
      addTabClickListeners(elements.secondaryInner);
    }
  } else {
    const tabs = createTab(checkedTabs);
    if (elements.below) {
      const targetElement = elements.below.querySelector('#related');
      elements.below.insertBefore(tabs, targetElement);
      addTabClickListeners(elements.below);
    }
  }
}

export function handleResize(elements: YouTubeElements, customTab: HTMLElement, isLargeScreen: boolean): void {
  const sizeClass = 'yt-spec-button-shape-next--size-';
  if (isLargeScreen && storageState.preRespWidth === 'medium') {
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
    if (storageState.checkedTabs) {
      storageState.checkedTabs.forEach(tab => {
        const element = getElements()[tab.elementName as keyof YouTubeElements];
        if (element && elements.secondaryInner) {
          elements.secondaryInner.appendChild(element);
        }
      });
    }
    if (elements.secondaryInner) addTabClickListeners(elements.secondaryInner);
  } else if (!isLargeScreen && storageState.preRespWidth === 'large') {
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
    if (storageState.checkedTabs) {
      storageState.checkedTabs.forEach(tab => {
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
    if (elements.below) addTabClickListeners(elements.below);
  }
}

export function handleUrlChange(): void {
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
    if (!customTab || !storageState.checkedTabs) return;

    const filteredTabs: Tab[] = storageState.checkedTabs.filter(filteredTab => {
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

      if (tabElement) tabElement.style.display = shouldHideTab ? 'none' : 'block';
      return !shouldHideTab;
    });

    filteredTabs.sort((a, b) => a.num - b.num);

    if (filteredTabs.length > 0) {
      const tablist: HTMLElement[] = filteredTabs
        .map(filtered => customTab.querySelector<HTMLElement>(`#${filtered.id}-tab`))
        .filter((tab): tab is HTMLElement => tab !== null);

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
      storageState.isFirstSelected = true;
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

  if (!storageState.checkedTabs) return;
  storageState.checkedTabs.forEach(tab => {
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

export function observePanelsChange(): void {
  const panelsObserver = new MutationObserver(() => {
    const { panels } = getElements();
    if (!panels) return;

    // visibility属性がどれか一つでも"ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"になっているか確認
    let isAnyPanelExpanded = false;
    Array.from(panels.children).forEach(child => {
      const visibleAttr = child.getAttribute("visibility");
      if (visibleAttr === "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED") {
        isAnyPanelExpanded = true;
      }
    });

    if (isAnyPanelExpanded && !panels.classList.contains("observed")) {
      displayTabElement("panels");
      updateSegmentedTabClasses();
      clickTab("panels");
      panels.classList.add("observed");
      // クリップ作成の描画不具合対策としてリサイズイベントを発火
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    } else if (!isAnyPanelExpanded && panels.classList.contains("observed")) {
      hideTabElement("panels");
      updateSegmentedTabClasses();
      panels.classList.remove("observed");
    }
  });
  panelsObserver.observe(document.body, { childList: true, subtree: true });
}

export function observePlaylistChange(): void {
  const playlistObserver = new MutationObserver(() => {
    const { playlist } = getElements();
    if (!playlist) return;

    const isVisible = !playlist.hasAttribute("hidden");
    const isObserved = playlist.classList.contains("observed");

    // 状態が変わっていなければ何もしない
    if (isVisible === isObserved) return;

    if (isVisible) {
      displayTabElement("playlist");
      updateSegmentedTabClasses();
      playlist.classList.add("observed");
    } else {
      hideTabElement("playlist");
      updateSegmentedTabClasses();
      playlist.classList.remove("observed");
    }
  });
  playlistObserver.observe(document.body, { childList: true, subtree: true });
}

export function createObserver(): MutationObserver {
  return new MutationObserver(() => {
    const elements = getElements();
    if (!elements.below && !elements.secondary && !elements.secondaryInner) return;

    if (elements.secondaryInner && !elements.secondaryInner.classList.contains('tab-container')) {
      elements.secondaryInner.classList.add('tab-container');
    }

    const isLargeScreen = window.innerWidth >= 1017;
    const customTab = document.querySelector<HTMLElement>('#custom-tab');
    const url: URL = new URL(window.location.href);
    const preVideoId: string | null = storageState.preUrl ? new URL(storageState.preUrl).searchParams.get("v") : null;
    const currentVideoId: string | null = url.searchParams.get("v");

    if (!customTab) {
      if (storageState.checkedTabs) handleFirstRender(elements, storageState.checkedTabs, isLargeScreen);
      if (preVideoId !== currentVideoId) {
        console.log("URLが変更", storageState.preUrl, "から", url.href);
        handleUrlChange();
        storageState.preUrl = url.href;
      }
    } else {
      handleResize(elements, customTab, isLargeScreen);
      if (preVideoId !== currentVideoId && storageState.preUrl) {
        customTab.remove();
      } else if (preVideoId !== currentVideoId) {
        storageState.preUrl = "https://www.youtube.com/";
      }
    }
    storageState.preRespWidth = isLargeScreen ? 'large' : 'medium';
  });
}
