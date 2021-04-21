import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';
import { CompareFeatureCollections } from './compare-feature-collections';
import { QueryADS } from './query-ads';

function featurePostProcessing() {
  const features = Collections.FeaturesCollection.find({}).fetch();

  for (const feature of features) {
    if (feature.size === 0) {
      Collections.FeaturesCollection.update({ id: feature.id }, { $set: { size: feature.featureSize } });
    }
    if (feature.state === Constants.ADSFields.DONE) {
      Collections.FeaturesCollection.update({ id: feature.id }, { $set: { progress: feature.featureSize } });
    }
  }
}

function setServerStatus(key, value) {
  return Collections.ServerStatusCollection.update({ key: key, value: { $ne: value } }, { $set: { value: value } });
}

export function SyncADS(date) {
  // prevent running multiple ADS syncs at the same time
  if (setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.BUSY)) {
    console.log('query ADS ' + date);

    // QueryADS is an async function (promise), so handle result/exceptions in then/catch
    QueryADS(date)
      .then(() => {
        console.log('queryADS succeeded');

        featurePostProcessing();

        const today = new Date();
        if (date) {
          setServerStatus(Constants.ServerStatus.ADS_COMPARE_DATE, date);
          setServerStatus(Constants.ServerStatus.ADS_COMPARE_SYNC_DATE, today);
        } else {
          setServerStatus(Constants.ServerStatus.ADS_SYNC_DATE, today);
          setServerStatus(Constants.ServerStatus.ADS_COMPARE_DATE, today);
          setServerStatus(Constants.ServerStatus.ADS_COMPARE_SYNC_DATE, today);

          // not querying by date: fill OrgFeaturesCollection with FeaturesCollection
          const features = Collections.FeaturesCollection.find({}).fetch();
          for (const feature of features) {
            Collections.OrgFeaturesCollection.insert(feature);
          }
        }

        CompareFeatureCollections();
        setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.OK);
      })
      .catch((e) => {
        console.log('queryADS failed: ' + e);
        setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.FAILED);
      });
  }
}