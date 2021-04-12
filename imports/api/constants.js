export const ItemTypes = {
  FEATURE: 'feature'
};

export const DisplayTypes = {
  NORMAL: 'normal',
  ADDED: 'added',
  REMOVED: 'removed',
  CHANGED: 'changed'
};

export const NOT_SET = -1;

export const ADSFields = {
  TITLE: 'System.Title',
  NODENAME: 'System.NodeName',
  ITERATION_PATH: 'System.IterationPath',
  EFFORT: 'Microsoft.VSTS.Scheduling.Effort',
  RELEASE: 'Philips.Planning.Release',
  STATE: 'System.State',
  DONE: 'Done'
};

export const ADSConfig = {
  PROJECT: 'IGT',
  URL: 'https://tfsemea1.ta.philips.com/tfs/TPC_Region22/',
  TOKEN: 'dvlfdqm3xzblfaix365ccfkwhax545f6g47dfzb2xk3ifpqlyfrq',
  AREA_OFFSET: '/systems/portfolio fixed/solution/art imaging chain',
  AREA_OFFSET_WIQL: '\\Systems\\Portfolio Fixed\\Solution\\ART Imaging Chain',
  ITERATION_OFFSET: '/systems/safe fixed',
  ITERATION_OFFSET_WIQL: '\\Systems\\SAFe Fixed'
};

export const ReturnStatus = {
  OK: true,
  NOT_OK: false
};

export const ServerStatus = {
  ADS_SYNC_STATUS: 'ads-sync-status'
};

export const SyncStatus = {
  OK: 'ok',
  FAILED: 'failed',
  BUSY: 'busy',
  NONE: 'none'
};