// eslint-disable-next-line no-unused-vars
import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { ServerStatus, SyncStatus } from '/imports/api/constants';
import * as Collections from '/imports/api/collections';

function populateServerStatusCollection() {
  [
    { key: ServerStatus.ADS_SYNC_STATUS, value: SyncStatus.NONE },
    { key: ServerStatus.ADS_SYNC_DATE, value: '' },
    { key: ServerStatus.ADS_COMPARE_SYNC_DATE, value: '' },
    { key: ServerStatus.ADS_COMPARE_DATE, value: '' }
  ].forEach((status) => Collections.ServerStatusCollection.insert(status));
}

export function PopulateCollections() {
  if (Collections.ServerStatusCollection.find().count() === 0) {
    populateServerStatusCollection();
  }
/*
  // eslint-disable-next-line no-undef
  const teams = EJSON.parse(Assets.getText('teams.json'));
  teams.forEach((team) => Collections.TeamsCollection.insert(team));

  // eslint-disable-next-line no-undef
  const allocations = EJSON.parse(Assets.getText('allocations.json'));
  allocations.forEach((allocation) => Collections.AllocationsCollection.insert(allocation));

  // eslint-disable-next-line no-undef
  const velocities = EJSON.parse(Assets.getText('velocities.json'));
  velocities.forEach((velocity) => Collections.VelocitiesCollection.insert(velocity));

  // eslint-disable-next-line no-undef
  const features = EJSON.parse(Assets.getText('features.json'));
  features.forEach((feature) => Collections.FeaturesCollection.insert(feature));

  // eslint-disable-next-line no-undef
  const iterations = EJSON.parse(Assets.getText('iterations.json'));
  iterations.forEach((iteration) => Collections.IterationsCollection.insert(iteration));

  // eslint-disable-next-line no-undef
  const projects = EJSON.parse(Assets.getText('projects.json'));
  projects.forEach((project) => Collections.ProjectsCollection.insert(project));

  // eslint-disable-next-line no-undef
  const orgfeatures = EJSON.parse(Assets.getText('orgfeatures.json'));
  orgfeatures.forEach((feature) => Collections.OrgFeaturesCollection.insert(feature));

  // eslint-disable-next-line no-undef
  const velocityPlan = EJSON.parse(Assets.getText('velocity-plan.json'));
  velocityPlan.forEach((planItem) => Collections.VelocityPlanCollection.insert(planItem));
*/
}
