import { Tab, tabs, defaultCheckedTabs, defaultSelectedTab } from '../settings';
import { getElements } from './elements';
import { storageState } from './storage';

export function handleSettings(isFirstLoad: boolean): void {
  const { settings } = getElements();
  if (!settings) return;

  const checkbox = settings.querySelectorAll<HTMLElement>("#checkbox");
  const radioButtons = settings.querySelectorAll<HTMLElement>("#radio");

  // デフォルト値の適用
  if (!storageState.checkedTabs) {
    storageState.checkedTabs = defaultCheckedTabs;
    chrome.storage.local.set({ checkedTabs: storageState.checkedTabs });
  }
  if (!storageState.selectedTab) {
    storageState.selectedTab = defaultSelectedTab;
    chrome.storage.local.set({ selectedTab: storageState.selectedTab });
  }

  // チェックボックスの選択状態を復元
  if (storageState.checkedTabs) {
    checkbox.forEach((cb, index) => {
      const labelElement = cb.querySelector<HTMLElement>("#label.style-scope.ytd-settings-checkbox-renderer");
      if (labelElement && storageState.checkedTabs) {
        const labelVal = labelElement.dataset.value ?? '';
        if (storageState.checkedTabs.some((tab) => tab.id === labelVal)) {
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

  // チェックボックスのイベントリスナー
  checkbox.forEach((cb, index) => {
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
        if (tabId && tabNum !== undefined && tabElementName && storageState.checkedTabs) {
          storageState.checkedTabs = storageState.checkedTabs.filter(tab => tab.id !== labelVal);
          storageState.checkedTabs.push({ id: tabId, name: label, num: tabNum, elementName: tabElementName });
        }
      } else if (storageState.checkedTabs) {
        storageState.checkedTabs = storageState.checkedTabs.filter(tab => tab.id !== labelVal);
      }
      chrome.storage.local.set({ checkedTabs: storageState.checkedTabs });
    });
  });

  // ラジオボタンの状態を復元
  if (storageState.selectedTab) {
    radioButtons.forEach((radio, index) => {
      const labelElement = radio.querySelector<HTMLElement>("#label.style-scope.ytd-settings-radio-option-renderer");
      if (!labelElement || !storageState.selectedTab) return;

      const labelVal = labelElement.dataset.value ?? '';
      if (labelVal === storageState.selectedTab.id) {
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

  // ラジオボタンのイベントリスナー
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
      storageState.selectedTab = { id: tabId ?? "auto", name: label, num: tabNum ?? 0, elementName: tabElementName ?? "auto" };
      chrome.storage.local.set({ selectedTab: storageState.selectedTab });

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
    if (!toggle || !storageState.extensionDetails) return;

    const detailData = storageState.extensionDetails.find(d => d.id === detail.dataset.id);
    if (detailData?.isEnabled) toggle.click();

    toggle.addEventListener('click', () => {
      if (detailData) {
        detailData.isEnabled = toggle.getAttribute("aria-pressed") === "true";
        chrome.storage.local.set({ details: storageState.extensionDetails });
      }
    });
  });
}
