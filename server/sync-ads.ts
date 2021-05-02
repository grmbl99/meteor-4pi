import { FeaturesCollection, OrgFeaturesCollection } from '/imports/api/collections';
import { ServerStatus, SyncStatus, ADSFields } from '/imports/api/constants';
import { setServerStatus } from '/imports/api/server-status';
import { CompareFeatureCollections } from './compare-feature-collections';
import { QueryADS } from './query-ads';

function featurePostProcessing() {
  const features = FeaturesCollection.find({}).fetch();

  for (const feature of features) {
    if (feature.size === 0) {
      FeaturesCollection.update({ id: feature.id }, { $set: { size: feature.featureSize } });
    }
    if (feature.state === ADSFields.DONE && feature.progress === 0) {
      FeaturesCollection.update({ id: feature.id }, { $set: { progress: feature.featureSize } });
    }
  }
}

export function SyncADS(date: string): void {
  // prevent running multiple ADS syncs at the same time
  if (setServerStatus(ServerStatus.ADS_SYNC_STATUS, SyncStatus.BUSY)) {
    console.log('query ADS ' + date);

    // QueryADS is an async function (promise), so handle result/exceptions in then/catch
    QueryADS(date)
      .then(() => {
        console.log('queryADS succeeded');

        featurePostProcessing();

        const today = new Date();
        if (date) {
          setServerStatus(ServerStatus.ADS_COMPARE_DATE, date);
          setServerStatus(ServerStatus.ADS_COMPARE_SYNC_DATE, today.toISOString());
        } else {
          setServerStatus(ServerStatus.ADS_SYNC_DATE, today.toISOString());
          setServerStatus(ServerStatus.ADS_COMPARE_DATE, today.toISOString());
          setServerStatus(ServerStatus.ADS_COMPARE_SYNC_DATE, today.toISOString());

          // not querying by date: fill OrgFeaturesCollection with FeaturesCollection
          const features = FeaturesCollection.find({}).fetch();
          for (const feature of features) {
            OrgFeaturesCollection.insert(feature);
          }
        }

        CompareFeatureCollections();
        setServerStatus(ServerStatus.ADS_SYNC_STATUS, SyncStatus.OK);
      })
      .catch((e) => {
        console.log('queryADS failed: ' + e);
        setServerStatus(ServerStatus.ADS_SYNC_STATUS, SyncStatus.FAILED);
      });
  }
}
