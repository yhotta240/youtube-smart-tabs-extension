import './style.css';
import { initializeStorage } from './storage';
import { initializeResizeHandler } from './renderer';
import { createObserver, observePanelsChange, observePlaylistChange } from './observer';

initializeStorage(() => {
  // Observerの作成と開始
  const observer = createObserver();
  observer.observe(document.body, { childList: true, subtree: true });
});

observePlaylistChange();
observePanelsChange();
initializeResizeHandler();