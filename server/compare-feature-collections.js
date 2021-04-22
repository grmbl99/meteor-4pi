import { FeaturesCollection, OrgFeaturesCollection, DeltaFeaturesCollection } from '/imports/api/collections';
import { DisplayTypes } from '/imports/api/constants';

// compare FeaturesCollection with OrgFeaturesCollection: fill DeltaFeaturesCollection
export function CompareFeatureCollections() {
  const features = FeaturesCollection.find({}).fetch();

  for (const feature of features) {
    const orgFeature = OrgFeaturesCollection.findOne({
      id: feature.id
    });
    if (orgFeature) {
      if (feature.pi !== orgFeature.pi || feature.team !== orgFeature.team || feature.project !== orgFeature.project) {
        DeltaFeaturesCollection.insert({
          type: DisplayTypes.ADDED,
          feature: feature
        });
        DeltaFeaturesCollection.insert({
          type: DisplayTypes.REMOVED,
          feature: orgFeature
        });
      }
      if (
        feature.size !== orgFeature.size ||
        feature.progress !== orgFeature.progress ||
        feature.startSprint !== orgFeature.startSprint ||
        feature.endSprint !== orgFeature.endSprint
      ) {
        orgFeature._id = feature._id; // store org data, but allow searching on (current) feature-id
        DeltaFeaturesCollection.insert({
          type: DisplayTypes.CHANGED,
          feature: orgFeature
        });
      }
    } else {
      DeltaFeaturesCollection.insert({
        type: DisplayTypes.ADDED,
        feature: feature
      });
    }
  }

  const orgFeatures = OrgFeaturesCollection.find({}).fetch();
  for (const orgFeature of orgFeatures) {
    const feature = FeaturesCollection.findOne({
      id: orgFeature.id
    });
    if (!feature) {
      DeltaFeaturesCollection.insert({
        type: DisplayTypes.REMOVED,
        feature: orgFeature
      });
    }
  }
}
