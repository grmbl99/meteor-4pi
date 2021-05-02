import { ServerStatusCollection } from '/imports/api/collections';

export function getServerStatus(key: string): string {
  const status = ServerStatusCollection.findOne({ key: key });
  return status ? status.value : '';
}

export function setServerStatus(key: string, value: string): number {
  return ServerStatusCollection.update({ key: key, value: { $ne: value } }, { $set: { value: value } });
}
