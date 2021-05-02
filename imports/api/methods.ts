import { Meteor } from 'meteor/meteor';
//import { check } from 'meteor/check';
import * as Collections from '/imports/api/collections';
import { InputType, UpdateType } from '/imports/api/types';
import { CompareFeatureCollections } from '/server/compare-feature-collections';
import { SyncADS } from '/server/sync-ads';

// Meteor methods, called from clients
Meteor.methods({
  MoveFeature(featureId: string, updates: UpdateType) {
    //check(text, String);

    // if (!this.userId) {
    //   throw new Meteor.Error('Not authorized.');
    // }

    Collections.FeaturesCollection.update({ _id: featureId }, { $set: updates });
  },

  UpdateFeature(input: InputType) {
    //check(text, String);

    // if (!this.userId) {
    //   throw new Meteor.Error('Not authorized.');
    // }

    Collections.FeaturesCollection.update(
      { _id: input._id },
      {
        $set: {
          name: input.name,
          size: input.size,
          progress: input.progress,
          pi: input.pi,
          startSprint: input.startSprint,
          startSprintName: input.startSprintName,
          endSprint: input.endSprint,
          endSprintName: input.endSprintName
        }
      }
    );
  },

  UpdateDeltaFeatureCollection() {
    Collections.DeltaFeaturesCollection.remove({});
    CompareFeatureCollections();
  },

  RefreshCompareADS(date: Date) {
    [Collections.OrgFeaturesCollection, Collections.DeltaFeaturesCollection].forEach((collection) =>
      collection.remove({})
    );

    SyncADS(date);
  },

  RefreshADS() {
    [
      Collections.OrgFeaturesCollection,
      Collections.DeltaFeaturesCollection,
      Collections.FeaturesCollection,
      Collections.IterationsCollection,
      Collections.ProjectsCollection,
      Collections.TeamsCollection
    ].forEach((collection) => collection.remove({}));

    SyncADS(undefined);
  }
});
