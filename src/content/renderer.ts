import { getElements, height } from './elements';
import { storageState } from './storage';

export function renderUI(): void {
  insertDragHandle();
  setupSidebarRatio();
  handleDrag();
  handleFullscreenResize();

  const { primaryInner, secondaryInner } = getElements();

  if (primaryInner) {
    primaryInner.style.paddingBottom = '100px';
  }

  if (secondaryInner) {
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

export function isLargeScreenLayout(): boolean {
  return window.innerWidth >= 1017;
}

let initialHeight: number = window.innerHeight;
let rafId: number | null = null;
let resizeTimeout: number | undefined;
let fullscreenResizeInitialized = false;

export function initializeResizeHandler(): void {
  window.addEventListener('resize', (ev: Event) => {
    // YouTubeのレイアウト更新のために拡張機能が強制的に発生させるresizeイベントを無視する
    if (!ev.isTrusted) return;
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

function handleFullscreenResize(): void {
  if (fullscreenResizeInitialized) return;
  fullscreenResizeInitialized = true;
  window.addEventListener('resize', (ev: Event) => {
    // YouTubeのレイアウト更新のために拡張機能が強制的に発生させるresizeイベントを無視する
    if (!ev.isTrusted) return;
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      if (isLargeScreenLayout()) setupSidebarRatio();
    }, 200);
  });
}

function insertDragHandle(): void {
  const { secondaryInner, dragHandle: exist } = getElements();
  if (exist) return;
  const dragHandle = document.createElement('div');
  dragHandle.classList.add('style-scope', 'ytd-watch-flexy', 'yst-drag-handle');
  secondaryInner?.insertAdjacentElement('beforebegin', dragHandle);
}

type SidebarElements = {
  primary: HTMLElement;
  secondary: HTMLElement;
  ytdWatchFlexy: HTMLElement;
  video: HTMLElement;
};

function applySidebarWidths(columnsWidth: number, primaryWidth: number, els: SidebarElements): void {
  const secondaryWidth = Math.max(columnsWidth - primaryWidth, 0);
  els.primary.style.setProperty('--yst-primary-width', `${Math.floor(primaryWidth)}px`, 'important');
  els.primary.classList.add('yst-custom-sidebar-width');
  els.secondary.style.setProperty('--yst-secondary-width', `${Math.floor(secondaryWidth)}px`, 'important');
  els.secondary.classList.add('yst-custom-sidebar-width');
  els.ytdWatchFlexy.classList.add('yst-custom-sidebar-width');
  els.video.classList.add('yst-custom-sidebar-width');
}

async function setupSidebarRatio(): Promise<void> {
  const { columns, primary, secondary, ytdWatchFlexy, video } = getElements();
  if (!columns || !primary || !secondary || !ytdWatchFlexy || !video) return;
  try {
    const data = await chrome.storage.local.get(['sidebarRatio']);
    let ratio = (data?.sidebarRatio as number) ?? 0.5;
    ratio = Math.min(Math.max(ratio, 0.05), 0.95);
    const columnsWidth = columns.clientWidth;
    const primaryWidth = Math.floor(columnsWidth * ratio);
    applySidebarWidths(columnsWidth, primaryWidth, { primary, secondary, ytdWatchFlexy, video });
    // 強制的にリサイズイベントを発生させてYouTubeのレイアウトを更新
    window.dispatchEvent(new Event('resize'));
  } catch (err) {
    console.error('[youtube-smart-tabs] setupSidebarRatio error', err);
  }
}

let isDragging = false;
let dragListenersInitialized = false;
function handleDrag(): void {
  const { columns, primary, secondary, ytdWatchFlexy, dragHandle, video } = getElements();
  if (!columns || !primary || !secondary || !dragHandle || !ytdWatchFlexy || !video) return;
  if (dragListenersInitialized) return;
  dragListenersInitialized = true;

  const minPrimary = 100; // 最小サイドバー幅 px

  const start = (e: PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    isDragging = true;
    dragHandle.classList.add('dragging');
    document.documentElement.style.userSelect = 'none';
  };

  const stop = (e?: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    try { dragHandle.releasePointerCapture?.((e as PointerEvent)?.pointerId); } catch { }
    dragHandle.classList.remove('dragging');
    document.documentElement.style.userSelect = '';
    (async () => {
      const columnsWidth = columns.clientWidth;
      const primaryWidth = Math.round(primary.getBoundingClientRect().width);
      const ratio = Math.min(Math.max(primaryWidth / columnsWidth, 0.05), 0.95);
      await chrome.storage.local.set({ sidebarRatio: ratio });
      // 強制的にリサイズイベントを発生させてYouTubeのレイアウトを更新
      window.dispatchEvent(new Event('resize'));
    })();
  };

  const move = (clientX: number) => {
    if (!isDragging) return;
    const rect = columns.getBoundingClientRect();
    const columnsWidth = columns.clientWidth;
    let primaryWidth = clientX - rect.left;
    primaryWidth = Math.min(Math.max(primaryWidth, minPrimary), columnsWidth - minPrimary);
    applySidebarWidths(columnsWidth, primaryWidth, { primary, secondary, ytdWatchFlexy, video });
  };

  dragHandle.addEventListener('pointerdown', (ev: PointerEvent) => {
    ev.preventDefault();
    start(ev);
  });

  document.addEventListener('pointermove', (ev: PointerEvent) => {
    if (!isDragging) return;
    move(ev.clientX);
  });

  document.addEventListener('pointerup', (ev: PointerEvent) => {
    stop(ev);
  });
}
