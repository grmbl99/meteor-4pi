// eslint-disable-next-line no-unused-vars
import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { ServerStatus, SyncStatus } from '/imports/api/constants';
import * as Collections from '/imports/api/collections';

// dummy declaration for Assets, to suppress typescript warnings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Assets: any;

function populateServerStatusCollection() {
  [
    { key: ServerStatus.ADS_SYNC_STATUS, value: SyncStatus.NONE },
    { key: ServerStatus.ADS_SYNC_DATE, value: '' },
    { key: ServerStatus.ADS_COMPARE_SYNC_DATE, value: '' },
    { key: ServerStatus.ADS_COMPARE_DATE, value: '' }
  ].forEach((status) => Collections.ServerStatusCollection.insert(status));
}

export function PopulateCollections(): void {
  if (Collections.ServerStatusCollection.find().count() === 0) {
    populateServerStatusCollection();
  }

  if (Meteor.settings.useTestData) {
    const teams = JSON.parse(Assets.getText('teams.json'));
    teams.forEach((team: Collections.TeamType) => Collections.TeamsCollection.insert(team));

    const features = JSON.parse(Assets.getText('features.json'));
    features.forEach((feature: Collections.FeatureType) => Collections.FeaturesCollection.insert(feature));

    // use EJSON.parse and casting to correctly handle $date values in iterations.json
    const iterations = EJSON.parse(Assets.getText('iterations.json'));
    (iterations as unknown as Collections.IterationType[]).forEach((iteration: Collections.IterationType) => {
      Collections.IterationsCollection.insert(iteration);
    });

    // use EJSON.parse and casting to correctly handle $date values in increments.json
    const increments = EJSON.parse(Assets.getText('increments.json'));
    (increments as unknown as Collections.IncrementType[]).forEach((increment: Collections.IncrementType) => {
      Collections.IncrementsCollection.insert(increment);
    });

    const projects = JSON.parse(Assets.getText('projects.json'));
    projects.forEach((project: Collections.ProjectType) => Collections.ProjectsCollection.insert(project));

    const orgfeatures = JSON.parse(Assets.getText('orgfeatures.json'));
    orgfeatures.forEach((feature: Collections.FeatureType) => Collections.OrgFeaturesCollection.insert(feature));

    const velocityPlan = JSON.parse(Assets.getText('velocityplan.json'));
    velocityPlan.forEach((planItem: Collections.VelocityType) => Collections.VelocityPlanCollection.insert(planItem));
  }
}
