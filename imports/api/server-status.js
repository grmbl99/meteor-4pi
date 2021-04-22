import { ServerStatusCollection } from '/imports/api/collections';

export function getServerStatus(key) {
  const status = ServerStatusCollection.findOne({ key: key });
  return status ? status.value : '';
}

export function setServerStatus(key, value) {
  return ServerStatusCollection.update({ key: key, value: { $ne: value } }, { $set: { value: value } });
}
