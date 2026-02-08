import { settingsOption, settingDetails, SettingOption, SettingDetails } from '../settings';

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
  const issueLink = 'https://forms.gle/qkaaa2E49GQ5QKMT8';
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