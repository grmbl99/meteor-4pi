// for use with react-dnd drag and drop
export const ItemTypes = {
  FEATURE: 'feature'
};

// to specify how to display a feature (in compare-view)
export const DisplayTypes = {
  NORMAL: 'normal',
  ADDED: 'added',
  REMOVED: 'removed',
  CHANGED: 'changed'
};

export const NOT_SET = -1;
export const START_SPRINT_NOT_SET = 9999;

// fields used in Azure WIQL queries
export const ADSFields = {
  TITLE: 'System.Title',
  NODENAME: 'System.NodeName',
  ITERATION_PATH: 'System.IterationPath',
  EFFORT: 'Microsoft.VSTS.Scheduling.Effort',
  RELEASE: 'Philips.Planning.Release',
  STATE: 'System.State',
  TAGS: 'System.Tags',
  PRIORITY: 'Microsoft.VSTS.Common.BacklogPriority',
  DONE: 'Done',
  STRETCH: 'stretch'
};

// Azure instance specific information
export const ADSConfig = {
  PROJECT: 'IGT',
  URL: 'https://tfsemea1.ta.philips.com/tfs/TPC_Region22/',
  TOKEN: 'dvlfdqm3xzblfaix365ccfkwhax545f6g47dfzb2xk3ifpqlyfrq',
  AREA_OFFSET: '/systems/portfolio fixed/solution/art imaging chain',
  AREA_OFFSET_WIQL: '\\Systems\\Portfolio Fixed\\Solution\\ART Imaging Chain',
  ITERATION_OFFSET: '/systems/safe fixed',
  ITERATION_OFFSET_WIQL: '\\Systems\\SAFe Fixed'
};

// return status for async (future/promise) functions
export const ReturnStatus = {
  OK: true,
  NOT_OK: false
};

// keys for the ServerStatusCollection
export const ServerStatus = {
  ADS_SYNC_STATUS: 'ads-sync-status',
  ADS_SYNC_DATE: 'ads-sync-date',
  ADS_COMPARE_SYNC_DATE: 'ads-compare-sync-date',
  ADS_COMPARE_DATE: 'ads-compare-date'
};

// status of the Azure synchronization
export const SyncStatus = {
  OK: 'ok',
  FAILED: 'failed',
  BUSY: 'busy',
  NONE: 'none'
};
