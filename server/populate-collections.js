import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';

function populateAllocationsCollection() { 
  [
    {team: 'pegasus', project: 'tiger', pi: 'PI 21.1', allocation: 10},
    {team: 'mushu', project: 'puma', pi: 'PI 21.1', allocation: 80},
    {team: 'hades', project: 'voip', pi: 'PI 21.1', allocation: 70},
    {team: 'hercules', project: 'bobcat', pi: 'PI 21.1', allocation: 20},
    {team: 'pegasus', project: 'tiger', pi: 'PI 21.2', allocation: 10},
    {team: 'mushu', project: 'puma', pi: 'PI 21.2', allocation: 80},
    {team: 'hades', project: 'voip', pi: 'PI 21.2', allocation: 70},
    {team: 'hercules', project: 'bobcat', pi: 'PI 21.2', allocation: 20}
  ].forEach(allocation => Collections.AllocationsCollection.insert(allocation));      
}

function populateVelocitiesCollection() { 
  [
    {team: 'pegasus', pi: 'PI 21.1', velocity: 75},
    {team: 'mushu', pi: 'PI 21.1', velocity: 60},
    {team: 'hades', pi: 'PI 21.1', velocity: 80},
    {team: 'hercules', pi: 'PI 21.1', velocity: 60},
    {team: 'pegasus', pi: 'PI 21.2', velocity: 75},
    {team: 'mushu', pi: 'PI 21.2', velocity: 60},
    {team: 'hades', pi: 'PI 21.2', velocity: 80},
    {team: 'hercules', pi: 'PI 21.2', velocity: 60},
    {team: 'pegasus', pi: 'PI 21.3', velocity: 75},
    {team: 'mushu', pi: 'PI 21.3', velocity: 60},
    {team: 'hades', pi: 'PI 21.3', velocity: 80},
    {team: 'hercules', pi: 'PI 21.3', velocity: 60} 
  ].forEach(velocity => Collections.VelocitiesCollection.insert(velocity));      
}

function populateServerStatusCollection() { 
  [
    {key: Constants.ServerStatus.ADS_SYNC_STATUS, value: Constants.SyncStatus.NONE},
    {key: Constants.ServerStatus.ADS_SYNC_DATE, value: ''},
    {key: Constants.ServerStatus.ADS_COMPARE_SYNC_DATE, value: ''},
    {key: Constants.ServerStatus.ADS_COMPARE_DATE, value: ''}
  ].forEach(status => Collections.ServerStatusCollection.insert(status));
}

export function PopulateCollections() {    
  if (Collections.AllocationsCollection.find().count() === 0) { populateAllocationsCollection(); }
  if (Collections.VelocitiesCollection.find().count() === 0) { populateVelocitiesCollection(); }
  if (Collections.ServerStatusCollection.find().count() === 0) { populateServerStatusCollection(); }

  let data = EJSON.parse(Assets.getText('teams.json'));
  data.forEach(team => Collections.TeamsCollection.insert(team));

  data = EJSON.parse(Assets.getText('features.json'));
  data.forEach(feature => Collections.FeaturesCollection.insert(feature));

  data = EJSON.parse(Assets.getText('iterations.json'));
  data.forEach(iteration => Collections.IterationsCollection.insert(iteration));

  data = EJSON.parse(Assets.getText('projects.json'));
  data.forEach(project => Collections.ProjectsCollection.insert(project));

  data = EJSON.parse(Assets.getText('orgfeatures.json'));
  data.forEach(feature => Collections.OrgFeaturesCollection.insert(feature));

  // var data = JSON.parse(Assets.getText('deltafeatures.json'));
  // data.forEach(feature => Collections.DeltaFeaturesCollection.insert(feature));
}