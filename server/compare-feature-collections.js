import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';

// compare FeaturesCollection with OrgFeaturesCollection: fill DeltaFeaturesCollection
export function CompareFeatureCollections() {
  const features = Collections.FeaturesCollection.find({}).fetch();

  for (const feature of features) {
    const orgFeature = Collections.OrgFeaturesCollection.findOne({
      id: feature.id
    });
    if (orgFeature) {
      if (feature.pi !== orgFeature.pi || feature.team !== orgFeature.team || feature.project !== orgFeature.project) {
        Collections.DeltaFeaturesCollection.insert({
          type: Constants.DisplayTypes.ADDED,
          feature: feature
        });
        Collections.DeltaFeaturesCollection.insert({
          type: Constants.DisplayTypes.REMOVED,
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
        Collections.DeltaFeaturesCollection.insert({
          type: Constants.DisplayTypes.CHANGED,
          feature: orgFeature
        });
      }
    } else {
      Collections.DeltaFeaturesCollection.insert({
        type: Constants.DisplayTypes.ADDED,
        feature: feature
      });
    }
  }

  const orgFeatures = Collections.OrgFeaturesCollection.find({}).fetch();
  for (const orgFeature of orgFeatures) {
    const feature = Collections.FeaturesCollection.findOne({
      id: orgFeature.id
    });
    if (!feature) {
      Collections.DeltaFeaturesCollection.insert({
        type: Constants.DisplayTypes.REMOVED,
        feature: orgFeature
      });
    }
  }
}
