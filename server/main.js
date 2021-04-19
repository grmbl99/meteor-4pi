import { Meteor } from 'meteor/meteor';
import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';
import { QueryADS } from './query-ads';
import { PopulateCollections } from './populate-collections';

function featurePostProcessing() {
  const features = Collections.FeaturesCollection.find({}).fetch();  

  for (const feature of features) {
    if (feature.size===0) {
      Collections.FeaturesCollection.update({id: feature.id},{ $set: { size: feature.featureSize }});
    }
    if (feature.state===Constants.ADSFields.DONE) {
      Collections.FeaturesCollection.update({id: feature.id},{ $set: { progress: feature.featureSize }});
    }
  }
}

// compare FeaturesCollection with OrgFeaturesCollection: fill DeltaFeaturesCollection
function compareFeatureCollections() {
  const features = Collections.FeaturesCollection.find({}).fetch();  

  for (const feature of features) {
    const orgFeature = Collections.OrgFeaturesCollection.findOne({id: feature.id});
    if (orgFeature) {
      if(feature.pi!==orgFeature.pi || feature.team!==orgFeature.team || feature.project!==orgFeature.project) {
        Collections.DeltaFeaturesCollection.insert({type: Constants.DisplayTypes.ADDED, feature: feature});
        Collections.DeltaFeaturesCollection.insert({type: Constants.DisplayTypes.REMOVED, feature: orgFeature});
      }
      if(feature.size!==orgFeature.size || feature.progress!==orgFeature.progress || 
         feature.startSprint!==orgFeature.startSprint || feature.endSprint!==orgFeature.endSprint) {
        orgFeature._id=feature._id; // store org data, but allow searching on (current) feature-id
        Collections.DeltaFeaturesCollection.insert({type: Constants.DisplayTypes.CHANGED, feature: orgFeature});
      }
    } else {
      Collections.DeltaFeaturesCollection.insert({type: Constants.DisplayTypes.ADDED, feature: feature});
    }
  }

  const orgFeatures = Collections.OrgFeaturesCollection.find({}).fetch();
  for (const orgFeature of orgFeatures) {
    const feature = Collections.FeaturesCollection.findOne({id: orgFeature.id});
    if (!feature) {
      Collections.DeltaFeaturesCollection.insert({type: Constants.DisplayTypes.REMOVED, feature: orgFeature});
    }
  }
}

function setServerStatus(key,value) {
  return (
    Collections.ServerStatusCollection.update({key: key, value: { $ne: value} },{ $set: { value: value }})
  );
}

function syncADS(date) {

  // prevent running multiple ADS syncs at the same time
  if (setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS,Constants.SyncStatus.BUSY)) {
    console.log('query ADS ' + date);

    // QueryADS is an async function (promise), so handle result/exceptions in then/catch
    QueryADS(date).then(() => { 
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

      compareFeatureCollections();
      setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.OK);

    }).catch((e) => { 
      console.log('queryADS failed: ' + e); 
      setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.FAILED);    
    });  
  }
}

// Meteor methods, called from clients
Meteor.methods({

  UpdateDeltaFeatureCollection() {
    Collections.DeltaFeaturesCollection.remove({});
    compareFeatureCollections();
  },

  RefreshCompareADS(date) {
    [ Collections.OrgFeaturesCollection,
      Collections.DeltaFeaturesCollection,
    ].forEach(collection => collection.remove({}));

    syncADS(date);
  },

  RefreshADS() {
    [ Collections.OrgFeaturesCollection,
      Collections.DeltaFeaturesCollection,
      Collections.FeaturesCollection,
      Collections.IterationsCollection,
      Collections.ProjectsCollection,
      Collections.TeamsCollection
    ].forEach(collection => collection.remove({}));

    syncADS();
  }
});

// Runs when the server is started
Meteor.startup(() => {
  [ Collections.OrgFeaturesCollection,
    Collections.FeaturesCollection,
    Collections.DeltaFeaturesCollection,
    Collections.IterationsCollection,
    Collections.ProjectsCollection,
    Collections.TeamsCollection,
    Collections.AllocationsCollection,
    Collections.VelocitiesCollection,
    Collections.ServerStatusCollection
  ].forEach(collection => collection.remove({}));

  PopulateCollections();
  // syncADS();
});