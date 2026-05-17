import type { Tab, TabId } from "../../settings";
import type { YouTubeElements } from "../types";
import { getElements } from "../elements";
import { storageState } from "../storage";

export const EXTENSION_TABS_ID = "extension-tabs";

const SIZE_CLASS = "ytSpecButtonShapeNextSize";

const SEGMENTED_CLASS = {
  start: "ytSpecButtonShapeNextSegmentedStart",
  interval: "ytSpecButtonShapeNextSegmentedInterval",
  end: "ytSpecButtonShapeNextSegmentedEnd",
};

export function createExtensionTabs(checkedTabs: Tab[]): HTMLElement {
  const filteredTabs: Tab[] = [...checkedTabs];
  filteredTabs.sort((a, b) => a.num - b.num);

  const tab: HTMLDivElement = document.createElement("div");
  const btnSize: string = `${SIZE_CLASS}${window.innerWidth >= 1017 ? "S" : "M"}`;
  tab.id = EXTENSION_TABS_ID;
  tab.classList.add("style-scope", "yt-button-group");
  tab.style.marginBottom = `${window.innerWidth >= 1017 ? "" : "10px;"}`;
  tab.role = "tablist";
  tab.innerHTML = /*html*/ `
      <button
        class="ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ${btnSize} ytSpecButtonShapeNextIconLeading ${SEGMENTED_CLASS.start} hidden"
        id="panels-tab"
        data-bs-toggle="pill"
        data-bs-target="#panels"
        type="button"
        role="tab"
        aria-controls="panels"
        aria-selected="false"
      >
        <span class="style-scope yt-chip-cloud-chip-renderer">パネル</span>
      </button>
    ${filteredTabs
      .map(
        (tab, index) => /*html*/ `
      <button
        class="ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ${btnSize} ytSpecButtonShapeNextIconLeading ${index === 0 ? SEGMENTED_CLASS.start : SEGMENTED_CLASS.interval}"
        id="${tab.id}-tab"
        data-bs-toggle="pill"
        data-bs-target="#${tab.id}"
        type="button"
        role="tab"
        aria-controls="${tab.elementName}"
        aria-selected="false"
      >
        <span class="style-scope yt-chip-cloud-chip-renderer">${tab.name}</span>
      </button>
    `,
      )
      .join("")}
      <button
        class="ytSpecButtonShapeNextHost ytSpecButtonShapeNextTonal ytSpecButtonShapeNextMono ${btnSize} ytSpecButtonShapeNextIconLeading ${SEGMENTED_CLASS.end}"
        id="extension-settings-tab"
        data-bs-toggle="pill"
        data-bs-target="#extension-settings"
        type="button"
        role="tab"
        aria-controls="extensionSettings"
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
      intervalButtons.forEach((btn) => {
        btn.style.setProperty("--segmented-bg-color", rgbaColor);
      });
    }
  }, 0);

  return tab;
}

export function setActiveExtensionTab(extensionTabs: HTMLElement): void {
  const tabs = extensionTabs.querySelectorAll<HTMLElement>("[data-bs-target]");

  const autoSelectTab = (): void => {
    for (const tab of Array.from(tabs)) {
      if (tab.style.display === "block") {
        tab.click();
        return;
      }
    }
  };

  if (storageState.selectedTab && storageState.selectedTab.id === "auto") {
    chrome.storage.local.get("currentTab", ({ currentTab }: { currentTab?: Tab }) => {
      if (currentTab) {
        const targetButton = document.querySelector<HTMLElement>(`[data-bs-target="#${currentTab.id}"]`);
        if (targetButton && targetButton.style.display === "block") {
          targetButton.click();
        } else {
          autoSelectTab();
        }
      } else {
        autoSelectTab();
      }
    });
  } else if (storageState.selectedTab) {
    const targetTab = extensionTabs.querySelector<HTMLElement>(`#${storageState.selectedTab.id}-tab`);
    if (targetTab && targetTab.style.display === "block") {
      targetTab.click();
    } else {
      autoSelectTab();
    }
  }
}

export function hideExtensionTabContent(): void {
  const elements = getElements();
  if (storageState.checkedTabs) {
    storageState.checkedTabs.forEach((tab) => {
      const element = elements[tab.elementName as keyof YouTubeElements];
      if (element) {
        element.classList.add("hidden");
        element.classList.remove("active", "show");
      }
    });
  }
  const settings = elements.extensionSettings;
  const panels = elements.panels;
  if (settings) {
    settings.classList.add("hidden");
    settings.classList.remove("active", "show");
  }
  if (panels) {
    panels.classList.add("hidden");
    panels.classList.remove("active", "show");
  }
}

export function registerExtensionTabClickListeners(): void {
  const { extensionTabs } = getElements();
  const buttons = extensionTabs?.querySelectorAll<HTMLElement>("[data-bs-target]");
  if (storageState.isEventAdded) return;
  storageState.isEventAdded = true;

  buttons?.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-bs-target");
      const elementName = button.getAttribute("aria-controls") as keyof YouTubeElements | null;
      if (!targetId || !elementName) return;

      removeSelectedExtensionTabs();
      hideExtensionTabContent();
      button.classList.add("extension-tabs-selected");

      if (targetId === "#chat-container") {
        const { chatContainer, chat, showHideChatBtn } = getElements();
        if (chatContainer && chat && chat.hasAttribute("collapsed") && showHideChatBtn) {
          chatContainer.classList.remove("hidden");
          chatContainer.classList.add("active", "show");
          showHideChatBtn.click();
        }
      }

      const targetContent = getElements()[elementName];
      if (targetContent) {
        targetContent.classList.remove("hidden");
        targetContent.classList.add("active", "show");
      }

      if (storageState.selectedTab && storageState.selectedTab.id === "auto") {
        if (storageState.checkedTabs) {
          storageState.checkedTabs.forEach((tab) => {
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

/** タブ形式の見た目にするため，ytSpecButtonShapeNextSegmented クラスのスタイルを調整する */
export function updateExtensionTabClasses(): void {
  const { extensionTabs } = getElements();
  if (!extensionTabs) return;

  const buttons = Array.from(extensionTabs.querySelectorAll<HTMLElement>("[data-bs-target]"));
  const visibleButtons = buttons.filter((button) => button.classList.contains("hidden") === false);

  if (visibleButtons.length === 0) return;

  const first = visibleButtons[0];
  const last = visibleButtons[visibleButtons.length - 1];

  buttons.forEach((button) => {
    button.classList.remove(SEGMENTED_CLASS.start, SEGMENTED_CLASS.interval, SEGMENTED_CLASS.end);
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
  const { extensionTabs } = getElements();
  if (!extensionTabs) return;

  const button = extensionTabs.querySelector<HTMLElement>(`#${tabId}-tab`);
  if (button) {
    button.click();
  }
}

export function displayExtensionTab(tabId: TabId): void {
  const { extensionTabs } = getElements();
  if (!extensionTabs) return;

  const button = extensionTabs.querySelector<HTMLElement>(`#${tabId}-tab`);
  if (button && button.classList.contains("hidden")) {
    button.classList.remove("hidden");
  }
}

export function hideExtensionTab(tabId: TabId): void {
  const { extensionTabs } = getElements();
  if (!extensionTabs) return;

  const button = extensionTabs.querySelector<HTMLElement>(`#${tabId}-tab`);
  if (button) {
    button.classList.add("hidden");
  }
}

export function removeSelectedExtensionTabs(): void {
  const { extensionTabs } = getElements();
  if (!extensionTabs) return;

  const buttons = extensionTabs.querySelectorAll<HTMLElement>("[data-bs-target]");
  buttons.forEach((button) => {
    button.classList.remove("extension-tabs-selected");
  });
}

export function toggleExtensionTabsSize(isLarge: boolean): void {
  const { extensionTabs } = getElements();
  if (!extensionTabs) return;
  const sizeSuffix = isLarge ? "S" : "M";

  Array.from(extensionTabs.children).forEach((tab) => {
    if (tab.classList.contains(`${SIZE_CLASS}${sizeSuffix}`)) {
      tab.classList.replace(`${SIZE_CLASS}${sizeSuffix}`, `${SIZE_CLASS}${isLarge ? "M" : "S"}`);
    }
  });
}
