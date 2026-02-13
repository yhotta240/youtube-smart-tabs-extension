import { Tab, TabId } from '../settings';
import { YouTubeElements, HTMLElementWithReg } from './types';
import { getElements } from './elements';
import { storageState } from './storage';

const SEGMENTED_CLASS = {
  start: 'yt-spec-button-shape-next--segmented-start',
  interval: 'yt-spec-button-shape-next--segmented-interval',
  end: 'yt-spec-button-shape-next--segmented-end',
};

export function createTab(checkedTabs: Tab[]): HTMLElement {
  const filteredTabs: Tab[] = [...checkedTabs];
  filteredTabs.sort((a, b) => a.num - b.num);

  const tab: HTMLDivElement = document.createElement('div');
  const btnSize: string = `yt-spec-button-shape-next--size-${window.innerWidth >= 1017 ? 's' : 'm'}`;
  tab.id = 'custom-tab';
  tab.classList.add('style-scope', 'yt-button-group');
  tab.style.marginBottom = `${window.innerWidth >= 1017 ? '' : '10px;'}`;
  tab.role = 'tablist';
  tab.innerHTML = /*html*/`
      <button
        class="style-scope yt-chip-cloud-chip-renderer yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono ${btnSize} yt-spec-button-shape-next--icon-leading ${SEGMENTED_CLASS.start}"
        id="panels-tab"
        data-bs-toggle="pill"
        data-bs-target="#panels"
        type="button"
        role="tab"
        aria-controls="panels"
        aria-selected="false"
        style="display: none;"
      >
        <span class="style-scope yt-chip-cloud-chip-renderer">パネル</span>
      </button>
    ${filteredTabs.map((tab, index) => /*html*/`
      <button
        class="style-scope yt-chip-cloud-chip-renderer yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono ${btnSize} yt-spec-button-shape-next--icon-leading ${index === 0 ? SEGMENTED_CLASS.start : SEGMENTED_CLASS.interval}"
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
        class="style-scope yt-chip-cloud-chip-renderer yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono ${btnSize} yt-spec-button-shape-next--icon-leading ${SEGMENTED_CLASS.end}"
        id="extension-settings-tab"
        data-bs-toggle="pill"
        data-bs-target="#extension-settings"
        type="button"
        role="tab"
        aria-controls="extension-settings"
        aria-selected="false"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sliders2" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M10.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1H10V1.5a.5.5 0 0 1 .5-.5M12 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-6.5 2A.5.5 0 0 1 6 6v1.5h8.5a.5.5 0 0 1 0 1H6V10a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5M1 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 1 8m9.5 2a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V13H1.5a.5.5 0 0 1 0-1H10v-1.5a.5.5 0 0 1 .5-.5m1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
        </svg>
      </button>
    `;

  setTimeout(() => {
    const startButton = tab.querySelector<HTMLElement>(`.${SEGMENTED_CLASS.start}`);
    const intervalButtons = tab.querySelectorAll<HTMLElement>(`.${SEGMENTED_CLASS.start}, .${SEGMENTED_CLASS.interval}`);
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

export function setActiveTab(customTab: HTMLElement): void {
  const tabs = customTab.querySelectorAll<HTMLElement>('[data-bs-target]');

  const autoSelectTab = (): void => {
    for (const tab of Array.from(tabs)) {
      if (tab.style.display === 'block') {
        tab.click();
        return;
      }
    }
  };

  if (storageState.selectedTab && storageState.selectedTab.id === 'auto') {
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
  } else if (storageState.selectedTab) {
    const targetTab = customTab.querySelector<HTMLElement>(`#${storageState.selectedTab.id}-tab`);
    if (targetTab && targetTab.style.display === 'block') {
      targetTab.click();
    } else {
      autoSelectTab();
    }
  }
}

export function displayElementNone(innerContent: HTMLElement): void {
  const elements = getElements();
  if (storageState.checkedTabs) {
    storageState.checkedTabs.forEach(tab => {
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
  if (elements.panels) {
    elements.panels.style.display = 'none';
  }
}

export function addTabClickListeners(innerContent: HTMLElement): void {
  const buttons = document.querySelectorAll<HTMLElement>('[data-bs-target]');
  if (storageState.isEventAdded) return;
  storageState.isEventAdded = true;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-bs-target');
      if (!targetId) return;

      if (targetId === '#chat-container') {
        const { chatContainer, showHideChatBtn } = getElements();
        if (chatContainer) {
          showHideChatBtn?.click();
          chatContainer.classList.add('active', 'show');
        }
      }

      removeCustomTabSelected();
      displayElementNone(innerContent);
      button.classList.add('custom-tab-selected')

      const targetContent = document.querySelector<HTMLElement>(targetId);
      if (targetContent) targetContent.style.removeProperty('display');

      if (targetId === '#description') {
        const description = document.querySelector<HTMLElement>('ytd-watch-metadata')
        if (description) description.style.removeProperty('display');
      }

      if (targetId === '#related') {
        const related = getElements().related;
        if (related) {
          related.style.removeProperty('display');
          related.classList.add('active', 'show');
        }
      }

      if (targetId === '#playlist') {
        const playlist = getElements().playlist;
        if (playlist) {
          playlist.style.removeProperty('display');
          playlist.classList.add('active', 'show');
        }
      }

      if (storageState.selectedTab && storageState.selectedTab.id === 'auto') {
        if (storageState.checkedTabs) {
          storageState.checkedTabs.forEach(tab => {
            if (tab.id === targetId.slice(1, targetId.length)) {
              const tabObject: Tab = { num: tab.num, id: tab.id, name: tab.name, elementName: tab.elementName };
              if (!storageState.isFirstSelected) {
                chrome.storage.local.set({ currentTab: tabObject });
              } else {
                storageState.isFirstSelected = false;
              }
            }
          });
        }
      }
    });
  });
}

/** タブ形式の見た目にするため，yt-spec-button-shape-next--segmented クラスのスタイルを調整する */
export function updateSegmentedTabClasses(): void {
  const { customTab } = getElements();
  if (!customTab) return;

  const buttons = Array.from(customTab.querySelectorAll<HTMLElement>('[data-bs-target]'));
  const visibleButtons = buttons.filter((button) => button.style.display !== 'none');

  if (visibleButtons.length === 0) return;

  const first = visibleButtons[0];
  const last = visibleButtons[visibleButtons.length - 1];

  buttons.forEach((button) => {
    button.classList.remove(SEGMENTED_CLASS.start, SEGMENTED_CLASS.interval, SEGMENTED_CLASS.end);
    if (button.style.display === 'none') return;
    if (button === first) {
      button.classList.add(SEGMENTED_CLASS.start);
    } else if (button === last) {
      button.classList.add(SEGMENTED_CLASS.end);
    } else {
      button.classList.add(SEGMENTED_CLASS.interval);
    }
  });
}

export function clickTab(tabId: TabId): void {
  const button = document.querySelector<HTMLElement>(`#custom-tab #${tabId}-tab`);
  if (button) {
    button.click();
  }
}

export function displayTabElement(tabId: TabId): void {
  const button = document.querySelector<HTMLElement>(`#custom-tab #${tabId}-tab`);
  if (button && button.style.display === 'none') {
    button.style.removeProperty('display');
  }
}

export function hideTabElement(tabId: TabId): void {
  const button = document.querySelector<HTMLElement>(`#custom-tab #${tabId}-tab`);
  if (button) {
    button.style.display = 'none';
  }
}

export function removeCustomTabSelected(): void {
  const buttons = document.querySelectorAll<HTMLElement>('[data-bs-target]');
  buttons.forEach(button => {
    button.classList.remove('custom-tab-selected');
  });
}
