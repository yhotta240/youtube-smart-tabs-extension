import { getElements, calculateTabsHeight } from '../core/elements';
import { storageState } from '../core/storage';
import { applySecondaryResizeSettings, handleFullscreenResize } from './secondary-resize';

export function renderUI(): void {
  applySecondaryResizeSettings();
  handleFullscreenResize();

  const { primaryInner, secondaryInner } = getElements();

  if (primaryInner) {
    primaryInner.style.paddingBottom = '100px';
  }

  if (secondaryInner) {
    secondaryInner.style.height = `${calculateTabsHeight()}px`;

    const descInner = document.querySelector<HTMLElement>('ytd-watch-metadata.watch-active-metadata #description-inner');
    const isDetailedDesc: boolean | undefined = storageState.extensionDetails?.find(detail => detail.id === 'description-detail')?.isEnabled;

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
}

function handleCommentDetailCSS(): void {
  const isDetailedComments: boolean | undefined = storageState.extensionDetails?.find(detail => detail.id === 'comment-detail')?.isEnabled;
  chrome.runtime.sendMessage({ action: isDetailedComments ? "insertCSS" : "removeCSS" });
}

export function isFullscreen(): boolean {
  return !!document.fullscreenElement;
}

let initialHeight: number = window.innerHeight;
let rafId: number | null = null;

export function initializeResizeHandler(): void {
  window.addEventListener('resize', (ev: Event) => {
    // YouTubeのレイアウト更新のために拡張機能が強制的に発生させるresizeイベントを無視する
    if (!ev.isTrusted) return;
    const windowHeight = window.innerHeight;
    const heightDiff = windowHeight - initialHeight;
    initialHeight = windowHeight;
    const { secondaryInner, chat } = getElements();
    if (!secondaryInner) return;

    if (rafId !== null) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      if (!isFullscreen()) {
        secondaryInner.style.height = `${calculateTabsHeight()}px`;
      }
      if (chat) {
        chat.style.height = `${chat.offsetHeight + heightDiff}px`;
      }
    });
  });
}

