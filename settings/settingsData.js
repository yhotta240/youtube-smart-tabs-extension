const tabs = [
    { num: 1, id: "description", name: "概要", elementName: "description" },
    { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
    { num: 3, id: "comments", name: "コメント", elementName: "comments" },
    { num: 4, id: "related", name: "関連", elementName: "related" },
    { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
    // { num: 6, id: "donation-shelf", name: "寄付", elementName: "donationShelf" },
];

const defaultCheckedTabs = [
    { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
    { num: 3, id: "comments", name: "コメント", elementName: "comments" },
    { num: 4, id: "related", name: "関連", elementName: "related" },
    { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
];
const defaultSelectedTab = { num: 0, id: "auto", name: "自動（推奨）", elementName: "auto" };

const settingsOption = [
    { num: 0, id: "auto", name: "自動（推奨）", elementName: "auto" },
    { num: 1, id: "description", name: "概要", elementName: "description" },
    { num: 2, id: "chat-container", name: "チャット", elementName: "chatContainer" },
    { num: 3, id: "comments", name: "コメント", elementName: "comments" },
    { num: 4, id: "related", name: "関連", elementName: "related" },
    { num: 5, id: "playlist", name: "再生リスト", elementName: "playlist" },
    // { num: 6, id: "donation-shelf", name: "寄付", elementName: "donationShelf" },
];

const settingDetails = [
    { id: "description-detail", elementName: "description", sectionTitle: "概要", title: "概要欄の「一部を表示」ボタンを上部にも表示", subtitle: "概要欄の「もっと見る」ボタンをクリックしたときに，概要欄の下部に表示される「一部を表示」ボタンを上部にも表示します．" },
    { id: "comment-detail", elementName: "comments", sectionTitle: "コメント", title: "コメントヘッダを固定", subtitle: "コメント欄のヘッダ（入力欄）をコンテンツ内の上部に固定します．" },
];