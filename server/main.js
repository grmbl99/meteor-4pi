import { Meteor } from 'meteor/meteor';
import * as Collections from '/imports/api/collections';
import { PopulateCollections } from './populate-collections';
import { SyncADS } from './sync-ads';
import '/imports/api/methods.js';

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

  PopulateCollections();
  SyncADS();
});
