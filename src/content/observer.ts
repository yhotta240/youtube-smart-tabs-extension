import { getElements } from "./elements";
import { storageState } from "./storage";
import { clickTab, displayTabElement, hideTabElement, updateSegmentedTabClasses } from "./ui/tab-manager";
import { handleFirstRender, handleResize, handleUrlChange } from "./ui/layout";


export async function observeYouTubeElements(): Promise<void> {
  // 有効化されていない場合は何もしない
  const data = await chrome.storage.local.get(["isEnabled"]);
  if (!data.isEnabled) return;

  const observer = new MutationObserver(() => {
    const { panels, playlist } = getElements();

    // panels の監視
    if (panels) {
      let isAnyPanelExpanded = false;
      Array.from(panels.children).forEach((child) => {
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
          window.dispatchEvent(new Event("resize"));
        });
      } else if (!isAnyPanelExpanded && panels.classList.contains("observed")) {
        hideTabElement("panels");
        updateSegmentedTabClasses();
        panels.classList.remove("observed");
      }
    }

    // playlist の監視
    if (playlist) {
      const isVisible = !playlist.hasAttribute("hidden");
      const isObserved = playlist.classList.contains("observed");

      // 状態が変わっていなければ何もしない
      if (isVisible !== isObserved) {
        if (isVisible) {
          displayTabElement("playlist");
          updateSegmentedTabClasses();
          playlist.classList.add("observed");
        } else {
          hideTabElement("playlist");
          updateSegmentedTabClasses();
          playlist.classList.remove("observed");
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["visibility", "hidden"],
  });
}

export function createObserver(): MutationObserver {
  return new MutationObserver(() => {
    const elements = getElements();
    if (!elements.below && !elements.secondary && !elements.secondaryInner) return;

    if (elements.secondaryInner && !elements.secondaryInner.classList.contains("tab-container")) {
      elements.secondaryInner.classList.add("tab-container");
    }

    const isLargeScreen = window.innerWidth >= 1017;
    const customTab = document.querySelector<HTMLElement>("#custom-tab");
    const url: URL = new URL(window.location.href);
    const preVideoId: string | null = storageState.preUrl ? new URL(storageState.preUrl).searchParams.get("v") : null;
    const currentVideoId: string | null = url.searchParams.get("v");

    if (!customTab) {
      if (storageState.checkedTabs) handleFirstRender(elements, storageState.checkedTabs, isLargeScreen);
      if (preVideoId !== currentVideoId) {
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
    storageState.preRespWidth = isLargeScreen ? "large" : "medium";
  });
}
