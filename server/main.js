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

function syncADS() {
  console.log('query ADS');
  Collections.ServerStatusCollection.update(
    { name: Constants.ServerStatus.ADS_SYNC_STATUS },
    { $set: { status: Constants.SyncStatus.BUSY, date: '' } }
  );

  QueryADS().then(() => { 
    console.log('queryADS succeeded'); 
    const date = new Date();
    Collections.ServerStatusCollection.update(
      { name: Constants.ServerStatus.ADS_SYNC_STATUS },
      { $set: { status: Constants.SyncStatus.OK, date: date }}
    );
  }).catch((e) => { 
    console.log('queryADS failed: ' + e); 
    Collections.ServerStatusCollection.update(
      { name: Constants.ServerStatus.ADS_SYNC_STATUS },
      { $set: { status: Constants.SyncStatus.FAILED, date: '' }}
    );
  });
}

Meteor.methods({
  UpdateDeltaFeatureCollection() {
    Collections.DeltaFeaturesCollection.remove({});
    compareFeatureCollections();
  },

  RefreshADS() {
    Collections.FeaturesCollection.remove({});
    Collections.SprintsCollection.remove({});
    Collections.ProjectsCollection.remove({});
    Collections.TeamsCollection.remove({});
    syncADS();
  }
});

Meteor.startup(() => {
  Collections.OrgFeaturesCollection.remove({});
  Collections.DeltaFeaturesCollection.remove({});
  Collections.AllocationsCollection.remove({});
  Collections.VelocitiesCollection.remove({});

  Collections.FeaturesCollection.remove({});
  Collections.SprintsCollection.remove({});
  Collections.ProjectsCollection.remove({});
  Collections.TeamsCollection.remove({});

  Collections.ServerStatusCollection.remove({});

  PopulateCollections();
  syncADS();
});