import { Tab, defaultCheckedTabs, defaultSelectedTab, settingDetails } from '../../settings';
import { ExtensionDetail, ResponsiveWidth } from './types';

type StorageData = {
  isEnabled?: boolean;
  checkedTabs?: Tab[];
  selectedTab?: Tab;
  details?: ExtensionDetail[];
  secondaryResizeEnabled?: boolean;
  secondaryWidth?: number | null;
};

export class StorageState {
  isEnabled: boolean = false;
  checkedTabs: Tab[] | null = null;
  selectedTab: Tab | null = null;
  extensionDetails: ExtensionDetail[] | null = null;
  secondaryResizeEnabled: boolean = false;
  secondaryWidth: number | null = null;
  preRespWidth: ResponsiveWidth = null;
  isFirstSelected: boolean = false;
  isEventAdded: boolean = false;
  preUrl: string | null = null;

  async initialize(onEnableChange: (isEnabled: boolean) => void): Promise<void> {
    const data = await chrome.storage.local.get<StorageData>(['isEnabled', 'checkedTabs', 'selectedTab', 'details', 'secondaryResizeEnabled', 'secondaryWidth']);

    this.isEnabled = data.isEnabled ?? false;
    this.checkedTabs = data.checkedTabs ?? defaultCheckedTabs;
    if (this.checkedTabs) {
      this.checkedTabs.sort((a, b) => a.num - b.num);
    }
    this.selectedTab = data.selectedTab ?? defaultSelectedTab;
    this.extensionDetails = data.details ?? settingDetails;
    this.secondaryResizeEnabled = data.secondaryResizeEnabled ?? false;
    this.secondaryWidth = data.secondaryWidth ?? null;

    onEnableChange(this.isEnabled);

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.isEnabled) {
        this.isEnabled = changes.isEnabled.newValue as boolean;
        window.location.reload();
      }
      if (changes.secondaryResizeEnabled) {
        this.secondaryResizeEnabled = (changes.secondaryResizeEnabled.newValue as boolean) ?? false;
      }
      if (changes.secondaryWidth) {
        this.secondaryWidth = (changes.secondaryWidth.newValue as number | null) ?? null;
      }
    });
  }
}

export const storageState = new StorageState();

export function initializeStorage(callback?: () => void): void {
  storageState.initialize((isEnabled) => {
    if (isEnabled && callback) {
      callback();
    }
  });
}
