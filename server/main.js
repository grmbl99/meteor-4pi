import { Meteor } from 'meteor/meteor';
import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';
import { QueryADS } from './query-ads';
import { PopulateCollections } from './populate-collections';

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
      if(feature.size!==orgFeature.size || feature.done!==orgFeature.done || 
         feature.startsprint!==orgFeature.startsprint || feature.endsprint!==orgFeature.endsprint) {
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

function setServerStatus(key,value,date) {
  Collections.ServerStatusCollection.update(
    { key: key },
    { $set: { value: value, date: date } }
  );
}

function syncADS() {
  console.log('query ADS');
  setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.BUSY, '');

  // QueryADS is an async function (promise), so handle result/exceptions in then/catch
  QueryADS().then(() => { 
    console.log('queryADS succeeded'); 
    const date = new Date();
    setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.OK, date);    
  }).catch((e) => { 
    console.log('queryADS failed: ' + e); 
    setServerStatus(Constants.ServerStatus.ADS_SYNC_STATUS, Constants.SyncStatus.FAILED, '');    
  });
}

// Meteor methods, called from clients
Meteor.methods({

  UpdateDeltaFeatureCollection() {
    Collections.DeltaFeaturesCollection.remove({});
    compareFeatureCollections();
  },

  RefreshADS() {
    [ Collections.FeaturesCollection,
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
    Collections.DeltaFeaturesCollection,
    Collections.AllocationsCollection,
    Collections.VelocitiesCollection,
    Collections.FeaturesCollection,
    Collections.IterationsCollection,
    Collections.ProjectsCollection,
    Collections.TeamsCollection,
    Collections.ServerStatusCollection
  ].forEach(collection => collection.remove({}));

  PopulateCollections();
  syncADS();
});