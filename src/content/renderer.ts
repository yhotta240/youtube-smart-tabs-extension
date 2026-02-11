import { getElements, height } from './elements';
import { storageState } from './storage';

export function renderUI(): void {
  const { primaryInner, secondaryInner } = getElements();

  if (primaryInner) {
    primaryInner.style.paddingBottom = '100px';
  }

  if (secondaryInner) {
    console.log("Setting secondaryInner height");
    secondaryInner.style.height = `${height()}px`;

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

// リサイズイベントハンドラーの初期化
let initialHeight: number = window.innerHeight;
let rafId: number | null = null;

export function initializeResizeHandler(): void {
  window.addEventListener('resize', () => {
    const windowHeight = window.innerHeight;
    const heightDiff = windowHeight - initialHeight;
    initialHeight = windowHeight;
    const { secondaryInner, chat } = getElements();
    if (!secondaryInner) return;

    const secondaryInnerHeight = secondaryInner.clientHeight;

    if (rafId !== null) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      if (isFullscreen()) {
        secondaryInner.style.height = `${secondaryInnerHeight + heightDiff}px`;
      } else {
        secondaryInner.style.height = `${secondaryInner.clientHeight + heightDiff}px`;
      }
      if (chat) {
        chat.style.height = `${chat.offsetHeight + heightDiff}px`;
      }
    });
  });
}
