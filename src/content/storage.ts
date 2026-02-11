import { Tab, defaultCheckedTabs, defaultSelectedTab, settingDetails } from '../settings';
import { ExtensionDetail, ResponsiveWidth } from './types';

type StorageData = {
  isEnabled?: boolean;
  checkedTabs?: Tab[];
  selectedTab?: Tab;
  details?: ExtensionDetail[];
};

export class StorageState {
  isEnabled: boolean = false;
  checkedTabs: Tab[] | null = null;
  selectedTab: Tab | null = null;
  extensionDetails: ExtensionDetail[] | null = null;
  preRespWidth: ResponsiveWidth = null;
  isFirstSelected: boolean = false;
  isEventAdded: boolean = false;
  preUrl: string | null = null;

  async initialize(onEnableChange: (isEnabled: boolean) => void): Promise<void> {
    const data = await chrome.storage.local.get<StorageData>(['isEnabled', 'checkedTabs', 'selectedTab', 'details']);

    this.isEnabled = data.isEnabled ?? false;
    this.checkedTabs = data.checkedTabs ?? defaultCheckedTabs;
    if (this.checkedTabs) {
      this.checkedTabs.sort((a, b) => a.num - b.num);
    }
    this.selectedTab = data.selectedTab ?? defaultSelectedTab;
    this.extensionDetails = data.details ?? settingDetails;

    onEnableChange(this.isEnabled);

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.isEnabled) {
        this.isEnabled = changes.isEnabled.newValue as boolean;
        window.location.reload();
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
