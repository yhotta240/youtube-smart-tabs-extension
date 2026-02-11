import './style.css';
import { initializeStorage, setupStorageListener } from './storage';
import { initializeResizeHandler } from './renderer';
import { createObserver } from './observer';

// 初期化処理
initializeStorage(() => {
  // Observerの作成と開始
  const observer = createObserver();
  observer.observe(document.body, { childList: true, subtree: true });
});

// ストレージ変更のリスナー設定
setupStorageListener();
// リサイズハンドラーの初期化
initializeResizeHandler();