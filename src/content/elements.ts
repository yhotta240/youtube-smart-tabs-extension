import { YouTubeElements } from './types';

export const getElements = (): YouTubeElements => {
  return {
    below: document.querySelector<HTMLElement>('#below.style-scope.ytd-watch-flexy'),
    primary: document.querySelector<HTMLElement>('#primary.style-scope.ytd-watch-flexy'),
    primaryInner: document.querySelector<HTMLElement>('#primary-inner.style-scope.ytd-watch-flexy'),
    secondary: document.querySelector<HTMLElement>('#secondary.style-scope.ytd-watch-flexy'),
    secondaryInner: document.querySelector<HTMLElement>('#secondary-inner.style-scope.ytd-watch-flexy'),
    panels: document.querySelector<HTMLElement>('#panels.style-scope.ytd-watch-flexy'),
    description: document.querySelector<HTMLElement>('#below > ytd-watch-metadata'),
    comments: document.querySelector<HTMLElement>('#comments.style-scope.ytd-watch-flexy'),
    related: document.querySelector<HTMLElement>('#related.style-scope.ytd-watch-flexy'),
    chatContainer: document.querySelector<HTMLElement>('#chat-container.style-scope.ytd-watch-flexy'),
    playlist: document.querySelector<HTMLElement>('#playlist.style-scope.ytd-watch-flexy'),
    donationShelf: document.querySelector<HTMLElement>('#donation-shelf.style-scope.ytd-watch-flexy'),
    settings: document.querySelector<HTMLElement>('#extension-settings.style-scope.ytd-watch-flexy'),
    customTab: document.querySelector<HTMLElement>('#custom-tab'),
    chatViewBtn: document.querySelector<HTMLElement>('button-view-model.yt-spec-button-view-model.ytTextCarouselItemViewModelButton'),
    chatContainerTab: document.querySelector<HTMLElement>('#chat-container-tab'),
    chat: document.querySelector<HTMLElement>('#chat'),
    showHideChatBtn: document.querySelector<HTMLElement>('#chat-container.style-scope.ytd-watch-flexy #show-hide-button button'),
  };
};

export const height = (): number => {
  const header = document.querySelector('#container.style-scope.ytd-masthead') as HTMLElement | null;
  const headerHeight = header ? header.offsetHeight : 0;
  const windowHeight = window.innerHeight;
  return windowHeight - headerHeight - 155;
};
