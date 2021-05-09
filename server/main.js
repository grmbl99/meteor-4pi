import { Meteor } from 'meteor/meteor';
import * as Collections from '/imports/api/collections';
import { PopulateCollections } from './populate-collections';
import { SyncADS } from './sync-ads';
import { version } from '/package.json';
import '/imports/api/methods';

// Runs when the server is started
Meteor.startup(() => {
  [
    Collections.OrgFeaturesCollection,
    Collections.FeaturesCollection,
    Collections.DeltaFeaturesCollection,
    Collections.IterationsCollection,
    Collections.ProjectsCollection,
    Collections.TeamsCollection,
    Collections.VelocityPlanCollection,
    Collections.ServerStatusCollection
  ].forEach((collection) => collection.remove({}));

  console.log('Meteor-4PI v' + version);

  PopulateCollections();

  if (!Meteor.settings.useTestData) {
    SyncADS(undefined);
  }
});
