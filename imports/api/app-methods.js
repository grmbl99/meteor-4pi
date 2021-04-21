import { Meteor } from 'meteor/meteor';
//import { check } from 'meteor/check';
import * as Collections from '/imports/api/collections';

Meteor.methods({
  'feature.move'(featureId, updates) {
    //check(text, String);

    // if (!this.userId) {
    //   throw new Meteor.Error('Not authorized.');
    // }

    Collections.FeaturesCollection.update({ _id: featureId }, { $set: updates });
  },

  'feature.update'(input) {
    //check(text, String);

    // if (!this.userId) {
    //   throw new Meteor.Error('Not authorized.');
    // }

    Collections.FeaturesCollection.update(
      { _id: input._id },
      {
        $set: {
          name: input.name,
          size: parseInt(input.size),
          progress: parseInt(input.progress),
          pi: input.pi,
          startSprint: input.startSprint,
          endSprint: input.endSprint
        }
      }
    );
  }
});
