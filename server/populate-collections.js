// eslint-disable-next-line no-unused-vars
import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';

function populateAllocationsCollection() {
  [
    { team: 'pegasus', project: 'tiger', pi: 'PI 21.1', allocation: 10 },
    { team: 'mushu', project: 'puma', pi: 'PI 21.1', allocation: 80 },
    { team: 'hades', project: 'voip', pi: 'PI 21.1', allocation: 70 },
    { team: 'hercules', project: 'bobcat', pi: 'PI 21.1', allocation: 20 },
    { team: 'pegasus', project: 'tiger', pi: 'PI 21.2', allocation: 10 },
    { team: 'mushu', project: 'puma', pi: 'PI 21.2', allocation: 80 },
    { team: 'hades', project: 'voip', pi: 'PI 21.2', allocation: 70 },
    { team: 'hercules', project: 'bobcat', pi: 'PI 21.2', allocation: 20 }
  ].forEach((allocation) => Collections.AllocationsCollection.insert(allocation));
}

function populateVelocitiesCollection() {
  [
    { team: 'pegasus', pi: 'PI 21.1', velocity: 75 },
    { team: 'mushu', pi: 'PI 21.1', velocity: 60 },
    { team: 'hades', pi: 'PI 21.1', velocity: 80 },
    { team: 'hercules', pi: 'PI 21.1', velocity: 60 },
    { team: 'pegasus', pi: 'PI 21.2', velocity: 75 },
    { team: 'mushu', pi: 'PI 21.2', velocity: 60 },
    { team: 'hades', pi: 'PI 21.2', velocity: 80 },
    { team: 'hercules', pi: 'PI 21.2', velocity: 60 },
    { team: 'pegasus', pi: 'PI 21.3', velocity: 75 },
    { team: 'mushu', pi: 'PI 21.3', velocity: 60 },
    { team: 'hades', pi: 'PI 21.3', velocity: 80 },
    { team: 'hercules', pi: 'PI 21.3', velocity: 60 }
  ].forEach((velocity) => Collections.VelocitiesCollection.insert(velocity));
}

function populateServerStatusCollection() {
  [
    { key: Constants.ServerStatus.ADS_SYNC_STATUS, value: Constants.SyncStatus.NONE },
    { key: Constants.ServerStatus.ADS_SYNC_DATE, value: '' },
    { key: Constants.ServerStatus.ADS_COMPARE_SYNC_DATE, value: '' },
    { key: Constants.ServerStatus.ADS_COMPARE_DATE, value: '' }
  ].forEach((status) => Collections.ServerStatusCollection.insert(status));
}

export function PopulateCollections() {
  if (Collections.AllocationsCollection.find().count() === 0) {
    populateAllocationsCollection();
  }
  if (Collections.VelocitiesCollection.find().count() === 0) {
    populateVelocitiesCollection();
  }
  if (Collections.ServerStatusCollection.find().count() === 0) {
    populateServerStatusCollection();
  }

  // eslint-disable-next-line no-undef
  const teams = EJSON.parse(Assets.getText('teams.json'));
  teams.forEach((team) => Collections.TeamsCollection.insert(team));

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

  // const deltafeatures = JSON.parse(Assets.getText('deltafeatures.json'));
  // deltafeatures.forEach(feature => Collections.DeltaFeaturesCollection.insert(feature));
}
