import './style.css';
import { initializeStorage } from './core/storage';
import { initializeResizeHandler } from './ui/renderer';
import { createObserver, observeYouTubeElements } from './observer';

initializeStorage(() => {
  // Observerの作成と開始
  const observer = createObserver();
  observer.observe(document.body, { childList: true, subtree: true });
});

observeYouTubeElements();
initializeResizeHandler();