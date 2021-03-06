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
  ITERATION_OFFSET: '/systems/safe fixed',
  ITERATION_DAYS: 14,
  VELOCITY_PLAN_PROJECT: 'velocity plan '
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

export const EMPTY_FEATURE = {
  name: '',
  pi: '',
  size: 0,
  progress: 0,
  startSprint: START_SPRINT_NOT_SET,
  endSprint: NOT_SET,
  startSprintName: '',
  endSprintName: '',
  _id: '',
  id: 0,
  featureEndSprintName: '',
  featureEndSprint: NOT_SET,
  tags: '',
  featureSize: 0,
  team: '',
  project: '',
  state: '',
  priority: 0
};
