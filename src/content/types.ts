export interface ExtensionDetail {
  id: string;
  isEnabled: boolean;
}

export interface YouTubeElements {
  below: HTMLElement | null;
  primary: HTMLElement | null;
  primaryInner: HTMLElement | null;
  secondary: HTMLElement | null;
  secondaryInner: HTMLElement | null;
  panels: HTMLElement | null;
  description: HTMLElement | null;
  comments: HTMLElement | null;
  related: HTMLElement | null;
  chatContainer: HTMLElement | null;
  playlist: HTMLElement | null;
  donationShelf: HTMLElement | null;
  settings: HTMLElement | null;
  customTab: HTMLElement | null;
  chatViewBtn: HTMLElement | null;
  chatContainerTab: HTMLElement | null;
  chat: HTMLElement | null;
}

export interface HTMLElementWithReg extends HTMLElement {
  _reg?: boolean;
}

export type ResponsiveWidth = 'large' | 'medium' | null;
