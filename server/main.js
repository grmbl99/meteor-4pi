import { Meteor } from 'meteor/meteor';
import { FeaturesCollection, OrgFeaturesCollection, DeltaFeaturesCollection,
         SprintsCollection, TeamsCollection, ProjectsCollection, 
         AllocationsCollection, VelocitiesCollection } from '/imports/api/Collections';
import { DisplayTypes } from '/imports/api/Consts.jsx';
import { queryADS } from './query-ads.js';
import { PopulateCollections } from './populate-collections.js';

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

Meteor.methods({
  UpdateDeltaFeatureCollection() {
    DeltaFeaturesCollection.remove({});
    CompareFeatureCollections();
  }
});

Meteor.startup(() => {
  FeaturesCollection.remove({});
  OrgFeaturesCollection.remove({});
  DeltaFeaturesCollection.remove({});
  SprintsCollection.remove({});
  ProjectsCollection.remove({});
  TeamsCollection.remove({});
  AllocationsCollection.remove({});
  VelocitiesCollection.remove({});

  PopulateCollections();
  queryADS();
});