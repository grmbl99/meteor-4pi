import { Meteor } from 'meteor/meteor';
import { FeaturesCollection, OrgFeaturesCollection, DeltaFeaturesCollection,
         SprintsCollection, TeamsCollection, ProjectsCollection, 
         AllocationsCollection, VelocitiesCollection, ServerStatusCollection } from '/imports/api/collections';
import { DisplayTypes, ServerStatus, SyncStatus } from '/imports/api/constants';
import { queryADS } from './query-ads';
import { PopulateCollections } from './populate-collections';

// compare FeaturesCollection with OrgFeaturesCollection: fill DeltaFeaturesCollection
function CompareFeatureCollections() {
  const features = FeaturesCollection.find({}).fetch();  

  for (const feature of features) {
    const orgfeature = OrgFeaturesCollection.findOne({id: feature.id});
    if (orgfeature) {
      if(feature.pi!==orgfeature.pi || feature.team!==orgfeature.team || feature.project!==orgfeature.project) {
        DeltaFeaturesCollection.insert({type: DisplayTypes.ADDED, feature: feature});
        DeltaFeaturesCollection.insert({type: DisplayTypes.REMOVED, feature: orgfeature});
      }
      if(feature.size!==orgfeature.size || feature.done!==orgfeature.done || 
         feature.startsprint!==orgfeature.startsprint || feature.endsprint!==orgfeature.endsprint) {
        orgfeature._id=feature._id; // store org data, but allow searching on (current) feature-id
        DeltaFeaturesCollection.insert({type: DisplayTypes.CHANGED, feature: orgfeature});
      }
    } else {
      DeltaFeaturesCollection.insert({type: DisplayTypes.ADDED, feature: feature});
    }
  }

  const orgfeatures = OrgFeaturesCollection.find({}).fetch();
  for (const orgfeature of orgfeatures) {
    const feature = FeaturesCollection.findOne({id: orgfeature.id});
    if (!feature) {
      DeltaFeaturesCollection.insert({type: DisplayTypes.REMOVED, feature: orgfeature});
    }
  }
}

function SyncADS() {
  console.log('query ADS');
  ServerStatusCollection.update({name: ServerStatus.ADS_SYNC_STATUS},{ $set: { status: SyncStatus.BUSY, date: '' }});

  queryADS().then(() => { 
    console.log('queryADS succeeded'); 
    const date = new Date();
    ServerStatusCollection.update({name: ServerStatus.ADS_SYNC_STATUS},{ $set: { status: SyncStatus.OK, date: date }});
  }).catch((e) => { 
    console.log('queryADS failed: ' + e); 
    ServerStatusCollection.update({name: ServerStatus.ADS_SYNC_STATUS},{ $set: { status: SyncStatus.FAILED, date: '' }});
  });
}

Meteor.methods({
  UpdateDeltaFeatureCollection() {
    DeltaFeaturesCollection.remove({});
    CompareFeatureCollections();
  },

  RefreshADS() {
    FeaturesCollection.remove({});
    SprintsCollection.remove({});
    ProjectsCollection.remove({});
    TeamsCollection.remove({});
    SyncADS();
  }
});

Meteor.startup(() => {
  OrgFeaturesCollection.remove({});
  DeltaFeaturesCollection.remove({});
  AllocationsCollection.remove({});
  VelocitiesCollection.remove({});

  FeaturesCollection.remove({});
  SprintsCollection.remove({});
  ProjectsCollection.remove({});
  TeamsCollection.remove({});

  ServerStatusCollection.remove({});

  PopulateCollections();
  SyncADS();
});