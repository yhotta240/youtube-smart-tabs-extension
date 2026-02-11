import { Tab, TabId } from '../settings';
import { YouTubeElements, HTMLElementWithReg } from './types';
import { getElements } from './elements';
import { storageState } from './storage';

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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sliders2" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M10.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4H1.5a.5.5 0 0 1 0-1H10V1.5a.5.5 0 0 1 .5-.5M12 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m-6.5 2A.5.5 0 0 1 6 6v1.5h8.5a.5.5 0 0 1 0 1H6V10a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5M1 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 1 8m9.5 2a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V13H1.5a.5.5 0 0 1 0-1H10v-1.5a.5.5 0 0 1 .5-.5m1.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
        </svg>
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

// 指定されたタブをアクティブに設定する関数
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
}

export function clickTab(innerContent: HTMLElement): void {
  const buttons = document.querySelectorAll<HTMLElement>('[data-bs-target]');
  if (storageState.isEventAdded) return;
  storageState.isEventAdded = true;

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

export function displayTabElement(tabId: TabId): void {
  const button = document.querySelector<HTMLElement>(`#custom-tab #${tabId}-tab`);
  if (button && button.style.display === 'none') {
    button.style.removeProperty('display');
  }
}

export function removeCustomTabSelected(): void {
  const buttons = document.querySelectorAll('[data-bs-target]');
  buttons.forEach(button => {
    button.classList.remove('custom-tab-selected');
  });
}
