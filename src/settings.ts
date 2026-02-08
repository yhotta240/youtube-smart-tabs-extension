export type Tab = {
  num: number; // 順番
  id: string; // id属性
  name: string; // 表示名
  elementName: string; // 対応する要素名
}

export type SettingOption = {
  num: number; // 順番
  id: string; // id属性
  name: string; // 表示名
  elementName: string; // 対応する要素名
}

export type SettingDetails = {
  id: string; // id属性
  elementName: string; // 対応する要素名
  isEnabled: boolean; // デフォルトの有効/無効状態
  sectionTitle: string; // セクションタイトル
  title: string; // 設定タイトル
  subtitle: string; // 設定サブタイトル
}

export const tabs: Tab[] = [
  { num: 1, id: "description", name: "概要", elementName: "description" },
  { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
  { num: 3, id: "comments", name: "コメント", elementName: "comments" },
  { num: 4, id: "related", name: "関連", elementName: "related" },
  { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
  // { num: 6, id: "donation-shelf", name: "寄付", elementName: "donationShelf" },
];

export const defaultCheckedTabs: Tab[] = [
  { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
  { num: 3, id: "comments", name: "コメント", elementName: "comments" },
  { num: 4, id: "related", name: "関連", elementName: "related" },
  { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
];
export const defaultSelectedTab: Tab = { num: 0, id: "auto", name: "自動（推奨）", elementName: "auto" };

export const settingsOption: SettingOption[] = [
  { num: 0, id: "auto", name: "自動（推奨）", elementName: "auto" },
  { num: 1, id: "description", name: "概要", elementName: "description" },
  { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
  { num: 3, id: "comments", name: "コメント", elementName: "comments" },
  { num: 4, id: "related", name: "関連", elementName: "related" },
  { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
  // { num: 6, id: "donation-shelf", name: "寄付", elementName: "donationShelf" },
];

export const settingDetails: SettingDetails[] = [
  { id: "description-detail", elementName: "description", isEnabled: true, sectionTitle: "概要", title: "概要欄の「一部を表示」ボタンを上部にも表示", subtitle: "概要欄の「もっと見る」ボタンをクリックしたときに，概要欄の下部に表示される「一部を表示」ボタンを上部にも表示します．" },
  { id: "comment-detail", elementName: "comments", isEnabled: false, sectionTitle: "コメント", title: "コメントヘッダを固定", subtitle: "コメント欄のヘッダ（入力欄）をコンテンツ内の上部に固定します．" },
];

export type Settings = {
  [key: string]: any;
};

export async function isEnabled(): Promise<boolean> {
  const data = await getStorage<{ isEnabled?: boolean }>('isEnabled');
  return data.isEnabled === true;
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await setStorage({ isEnabled: enabled });
}

export function getStorage<T extends Record<string, unknown>>(keys: string | string[]): Promise<Partial<T>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve((result ?? {}) as Partial<T>);
    });
  });
}

export function setStorage<T extends Record<string, unknown>>(items: T): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}
