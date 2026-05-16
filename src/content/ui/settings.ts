import { tabs, defaultCheckedTabs, defaultSelectedTab, settingsOption, settingDetails, SettingOption, SettingDetails } from '../../settings';
import meta from '../../../public/manifest.meta.json';
import { getElements } from '../elements';
import { applySecondaryResizeSettings } from './secondary-resize';
import { storageState } from '../storage';

export function createCheckbox(option: SettingOption, className: string): string {
  return /*html*/`
    <ytd-settings-checkbox-renderer class="${className}">
      <tp-yt-paper-checkbox id="checkbox" role="checkbox" aria-checked="false"
      class="${className}" tabindex="0" aria-label="${option.name}">
        <div id="checkboxContainer" class="style-scope ytd-settings-checkbox-renderer">
          <div id="checkbox" class="checked style-scope"></div>
        </div>
        <div id="checkbox-label" class="style-scope ytd-settings-checkbox-renderer">
          <div id="label" class="style-scope ytd-settings-checkbox-renderer" data-value="${option.id}">${option.name}</div>
        </div>
      </tp-yt-paper-checkbox>
    </ytd-settings-checkbox-renderer>
  `;
}

export function createRadio(option: SettingOption, className: string): string {
  return /*html*/`
    <ytd-settings-radio-option-renderer class="${className}">
      <tp-yt-paper-radio-button id="radio" class="style-scope ytd-settings-radio-option-renderer" role="radio"
        tabindex="0" toggles="" aria-checked="false" aria-disabled="false" aria-label="${option.name}"
        style="--paper-radio-button-ink-size: 60px;">
        <div id="radioContainer" class="style-scope tp-yt-paper-radio-button">
          <div id="offRadio" class="style-scope"></div>
          <div id="onRadio" class="style-scope"></div>
        </div>
        <div id="label" class="style-scope ytd-settings-radio-option-renderer" data-value="${option.id}">${option.name}</div>
      </tp-yt-paper-radio-button>
    </ytd-settings-radio-option-renderer>
  `;
}

export function createDetail(detail: SettingDetails, className: string): string {
  return /*html*/`
    <ytd-settings-options-renderer id="detail" class="style-scope ytd-item-section-renderer" data-id="${detail.id}" >
      <div id="section" class="${className}">
        <div id="title" class="${className}" style="margin-right: 0;">${detail.sectionTitle}</div>
        <div id="content" class="${className}">
          <div id="options" class="${className}">
            <ytd-settings-switch-renderer class="${className}">
              <tp-yt-paper-toggle-button id="toggle"  noink="" class="style-scope ytd-settings-switch-renderer" role="button" aria-pressed="false" tabindex="0" toggles="" aria-disabled="false" aria-label="概要" style="touch-action: pan-y;">
                <div class="toggle-label style-scope tp-yt-paper-toggle-button" data-value="${detail.id}"></div>
              </tp-yt-paper-toggle-button>
              <div class="style-scope ytd-settings-switch-renderer">
                <div id="title" class="style-scope ytd-settings-switch-renderer">${detail.title}</div>
                <div id="subtitle" class="style-scope ytd-settings-switch-renderer">
                  ${detail.subtitle}
                </div>
              </div>
            </ytd-settings-switch-renderer>
          </div>
        </div>
      </div>
    </ytd-settings-options-renderer>
  `;
}

export function extensionSettings(): HTMLElement {
  const settings = document.createElement('div');
  const storeLink = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}`;
  const extensionLink = chrome.runtime.getURL("index.html");
  const issueLink = meta.issues_url;
  const className: string = 'style-scope ytd-settings-options-renderer';
  settings.id = 'extension-settings';
  settings.style.display = 'none';
  settings.setAttribute('aria-selected', 'false');
  settings.classList.add('style-scope', 'ytd-watch-flexy');
  settings.innerHTML = /*html*/ `
    <div class="style-scope ytd-watch-flexy" id="settings-container" style="padding: 10px;">
      <div id="options" class="${className}">
        <ytd-channel-options-renderer class="${className}">
          <div id="store-link" class="link ytd-channel-options-renderer">
            <a class="yt-simple-endpoint bold style-scope yt-formatted-string" spellcheck="false" href="${storeLink}" dir="auto" style-target="bold" target="_blank">
              ストアページに移動</a>
          </div>
          <div id="extension-link" class="link ytd-channel-options-renderer">
            <a class="yt-simple-endpoint bold style-scope yt-formatted-string" spellcheck="false" href="${extensionLink}" dir="auto" style-target="bold" target="_blank">
              拡張機能のページを開く</a>
          </div>
          <div id="issue-link" class="link ytd-channel-options-renderer">
            <a class="yt-simple-endpoint bold style-scope yt-formatted-string" spellcheck="false" href="${issueLink}" dir="auto" style-target="bold" target="_blank">
              問題を報告する</a>
          </div>
        </ytd-channel-options-renderer>
      </div>
      <div id="settings-options" class="${className}" style="border-bottom: 1px solid var(--yt-spec-10-percent-layer);">
        <div id="header" class=" style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer">
          <ytd-item-section-header-renderer class="style-scope ytd-item-section-renderer" modern-typography="" title-style="">
            <div id="header" class="style-scope ytd-item-section-header-renderer">
              <div id="title" class="style-scope ytd-item-section-header-renderer" style="padding-top: 12px; font-size: 1.6rem;">全般</div>
              <div id="subtitle" class="style-scope ytd-item-section-header-renderer">拡張機能のメイン機能に関する設定．設定変更後は再読み込みが必要です．</div>
            </div>
          </ytd-item-section-header-renderer>
        </div>
        <div id="section" class="${className}">
          <div id="settings-title" class="${className}">タブ化するコンテンツ</div>
          <div id="content" class="${className}">
            ${settingsOption.filter(option => option.id !== 'auto').map(option => createCheckbox(option, className)).join('')}
          </div>
        </div>
        <div id="section" class="${className}">
          <div id="settings-title" class="${className}">最初に表示するタブ</div>
          <div id="content" class="${className}">
            <div id="options" class="${className}">
              ${settingsOption.map(option => createRadio(option, className)).join('')}
            </div>
          </div>
        </div>
        <div id="section" class="${className}">
          <div id="settings-title" class="${className}">サイドバー幅を変更</div>
          <div id="content" class="${className}">
            <div id="options" class="${className}">
              <ytd-settings-switch-renderer class="${className}">
                <tp-yt-paper-toggle-button id="secondaryResizeToggle" noink="" class="style-scope ytd-settings-switch-renderer" role="button" aria-pressed="false" tabindex="0" toggles="" aria-disabled="false" aria-label="概要" style="touch-action: pan-y;">
                  <div class="toggle-label style-scope tp-yt-paper-toggle-button" data-value="secondaryResize"></div>
                </tp-yt-paper-toggle-button>
                <div class="style-scope ytd-settings-switch-renderer">
                  <div id="title" class="style-scope ytd-settings-switch-renderer">サイドバー幅をドラッグして変更する（実験的機能）</div>
                  <div id="subtitle" class="style-scope ytd-settings-switch-renderer">
                    有効にすると，動画プレイヤーとサイドバーの境界をドラッグして幅を調整できます．ドラッグ中は境界が強調表示され，設定した幅は次回以降も保持されます．
                  </div>
                </div>
              </ytd-settings-switch-renderer>
            </div>
          </div>
        </div>
      </div>
      <div id="settings-options" class="${className}">
        <div id="header" class=" style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer">
          <ytd-item-section-header-renderer class="style-scope ytd-item-section-renderer" modern-typography="" title-style="">
            <div id="header" class="style-scope ytd-item-section-header-renderer">
              <div id="title" class="style-scope ytd-item-section-header-renderer" style="padding-top: 12px; font-size: 1.6rem;">詳細設定</div>
              <div id="subtitle" class="style-scope ytd-item-section-header-renderer">タブ化されたコンテンツに関する表示設定や細かな機能の有効化に関する設定</div>
            </div>
          </ytd-item-section-header-renderer>
        </div>
        <div id="contents" class=" style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer">
          ${settingDetails.map(detail => createDetail(detail, className)).join('')}
        </div>
      </div>
    </div>
  `;
  return settings;
}

export function handleSettings(isFirstLoad: boolean): void {
  const { settings } = getElements();
  if (!settings) return;

  const checkbox = settings.querySelectorAll<HTMLElement>("#checkbox");
  const radioButtons = settings.querySelectorAll<HTMLElement>("#radio");

  if (!storageState.checkedTabs) {
    storageState.checkedTabs = defaultCheckedTabs;
    chrome.storage.local.set({ checkedTabs: storageState.checkedTabs });
  }
  if (!storageState.selectedTab) {
    storageState.selectedTab = defaultSelectedTab;
    chrome.storage.local.set({ selectedTab: storageState.selectedTab });
  }

  if (storageState.checkedTabs) {
    checkbox.forEach((cb) => {
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

  checkbox.forEach((cb) => {
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

  if (storageState.selectedTab) {
    radioButtons.forEach((radio) => {
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

  radioButtons.forEach((radio) => {
    radio.addEventListener('click', () => {
      radioButtons.forEach((r) => {
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

  const secondaryResizeToggle = settings.querySelector<HTMLElement>("#secondaryResizeToggle");
  if (secondaryResizeToggle) {
    if (storageState.secondaryResizeEnabled) {
      secondaryResizeToggle.setAttribute("aria-pressed", "true");
      secondaryResizeToggle.setAttribute("active", "");
    } else {
      secondaryResizeToggle.setAttribute("aria-pressed", "false");
      secondaryResizeToggle.removeAttribute("active");
    }

    secondaryResizeToggle.addEventListener('click', () => {
      const isEnabled = secondaryResizeToggle.getAttribute("aria-pressed") === "true";
      storageState.secondaryResizeEnabled = isEnabled;

      if (isEnabled) {
        storageState.secondaryWidth = null;
        chrome.storage.local.set({ secondaryResizeEnabled: true, secondaryWidth: null });
      } else {
        storageState.secondaryWidth = null;
        chrome.storage.local.set({ secondaryResizeEnabled: false, secondaryWidth: null });
      }

      void applySecondaryResizeSettings();
    });
  }

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
