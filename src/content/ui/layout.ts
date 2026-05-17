import { Tab } from "../../settings";
import { createExtensionSettings, handleSettings } from "./settings";
import { YouTubeElements, HTMLElementWithReg } from "../types";
import { getElements } from "../elements";
import { storageState } from "../storage";
import { createExtensionTabs, setActiveExtensionTab, removeSelectedExtensionTabs, hideExtensionTabContent, registerExtensionTabClickListeners, toggleExtensionTabsSize } from "./tab-manager";
import { renderUI } from "./renderer";
import { applySecondaryResizeSettings } from "./secondary-resize";

export function handleFirstRender(checkedTabs: Tab[]): void {
  const elements = getElements();
  storageState.isEventAdded = false;
  const tabs = createExtensionTabs(checkedTabs);
  if (isLargeScreen()) {
    if (elements.secondary && elements.secondaryInner) {
      elements.secondary.insertBefore(tabs, elements.secondary.firstChild);
      registerExtensionTabClickListeners();
    }
  } else {
    const primaryInner = elements.primaryInner;
    if (primaryInner) {
      // primaryInner の player と below の間にタブを挿入
      if (primaryInner.firstChild) {
        primaryInner.insertBefore(tabs, elements.below);
      }
      registerExtensionTabClickListeners();
    }
  }
}

export function handleWindowResize(extensionTabs: HTMLElement): void {
  const elements = getElements();
  const { secondary, secondaryInner, extensionSettings, primaryInner, below } = elements;
  if (isLargeScreen() && storageState.preRespWidth === "medium") {
    renderUI();
    toggleExtensionTabsSize(true);
    if (secondary) {
      secondary.insertBefore(extensionTabs, secondary.firstChild);
    }
    if (extensionSettings && secondaryInner) {
      secondaryInner.appendChild(extensionSettings);
    }
    handleSettings(false);
    if (storageState.checkedTabs) {
      storageState.checkedTabs.forEach((tab) => {
        const element = elements[tab.elementName as keyof YouTubeElements];
        if (element && secondaryInner) {
          secondaryInner.appendChild(element as HTMLElement);
        }
      });
    }
    registerExtensionTabClickListeners();
  } else if (!isLargeScreen() && storageState.preRespWidth === "large") {
    applySecondaryResizeSettings();
    toggleExtensionTabsSize(false);
    if (extensionSettings && below) {
      below.appendChild(extensionSettings);
    }
    if (primaryInner) {
      primaryInner.insertBefore(extensionTabs, below);
    }
    handleSettings(false);
    if (storageState.checkedTabs) {
      storageState.checkedTabs.forEach((tab) => {
        const element = elements[tab.elementName as keyof YouTubeElements];
        if (element && below) {
          below.appendChild(element);
        }
      });
    }
    registerExtensionTabClickListeners();
  }
}

export function handleUrlChange(): void {
  let tryCount: number = 0;
  const maxTries: number = 10;
  moveElement();

  const interval = setInterval(() => {
    const { chatContainer, chatViewBtn, chatContainerTab, comments, playlist } = getElements();
    if (!comments) return;

    if (tryCount === 0) {
      renderUI();
    }

    if (chatViewBtn && !(chatViewBtn as HTMLElementWithReg)._reg) {
      chatViewBtn.addEventListener(
        "click",
        () => {
          removeSelectedExtensionTabs();
          if (chatContainer && chatContainerTab) {
            hideExtensionTabContent();
            chatContainer.style.display = "block";
            chatContainerTab.click();
          }
        },
        { once: true },
      );
      (chatViewBtn as HTMLElementWithReg)._reg = true;
    }

    const commentsHidden: boolean = comments.hasAttribute("hidden");
    const teaserCarousel = document.querySelector<HTMLElement>("#teaser-carousel");
    const { extensionTabs } = getElements();
    if (!extensionTabs || !storageState.checkedTabs) return;

    const filteredTabs: Tab[] = storageState.checkedTabs.filter((filteredTab) => {
      const element = getElements()[filteredTab.elementName as keyof YouTubeElements];
      const tabElement = extensionTabs.querySelector<HTMLElement>(`#${filteredTab.id}-tab`);
      let shouldHideTab: boolean = false;

      if (filteredTab.id === "chat-container") {
        shouldHideTab = !((filteredTab.id === "chat-container" && teaserCarousel && !teaserCarousel.hasAttribute("hidden")) || element?.children.length === 2);
      }
      if (filteredTab.id === "comments") {
        shouldHideTab = commentsHidden;
      }
      if (filteredTab.id === "related") {
        shouldHideTab = !(element && element.children.length > 1);
      }
      if (filteredTab.id === "playlist") {
        shouldHideTab = playlist ? playlist.hasAttribute("hidden") : true;
      }

      if (tabElement) tabElement.style.display = shouldHideTab ? "none" : "block";
      return !shouldHideTab;
    });

    filteredTabs.sort((a, b) => a.num - b.num);

    if (filteredTabs.length > 0) {
      const tablist: HTMLElement[] = filteredTabs.map((filtered) => extensionTabs.querySelector<HTMLElement>(`#${filtered.id}-tab`)).filter((tab): tab is HTMLElement => tab !== null);

      tablist.forEach((tab, index) => {
        if (index === 0) {
          tab.classList.remove("ytSpecButtonShapeNextSegmentedInterval");
          tab.classList.add("ytSpecButtonShapeNextSegmentedStart");
        } else {
          tab.classList.remove("ytSpecButtonShapeNextSegmentedStart");
          tab.classList.add("ytSpecButtonShapeNextSegmentedInterval");
        }
      });
    }

    if (tryCount === 0) {
      storageState.isFirstSelected = true;
      setActiveExtensionTab(extensionTabs);
    }

    if (!commentsHidden || tryCount >= maxTries) {
      setActiveExtensionTab(extensionTabs);
      clearInterval(interval);
      return;
    }
    tryCount++;
  }, 500);
}

function moveElement(): void {
  const { below, secondaryInner, extensionSettings } = getElements();
  if (!below && !secondaryInner) return;

  const parent = isLargeScreen() ? secondaryInner : below;
  if (!parent) return;

  if (!extensionSettings) {
    parent.appendChild(createExtensionSettings());
    handleSettings(true);
  } else {
    parent.appendChild(extensionSettings);
  }

  if (!storageState.checkedTabs) return;
  storageState.checkedTabs.forEach((tab) => {
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
    if (isLargeScreen() && secondaryInner) {
      secondaryInner.appendChild(element);
    } else if (!isLargeScreen() && below) {
      below.appendChild(element);
    }
  }
}

export function isLargeScreen(): boolean {
  return window.innerWidth >= 1017;
}
