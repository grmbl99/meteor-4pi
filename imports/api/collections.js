import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FeaturesCollection = new Mongo.Collection('features');
export const OrgFeaturesCollection = new Mongo.Collection('orgfeatures');
export const DeltaFeaturesCollection = new Mongo.Collection('deltafeatures');
export const IterationsCollection = new Mongo.Collection('iterations');
export const TeamsCollection = new Mongo.Collection('teams');
export const ProjectsCollection = new Mongo.Collection('projects');
export const AllocationsCollection = new Mongo.Collection('allocations');
export const VelocitiesCollection = new Mongo.Collection('velocities');
export const ServerStatusCollection = new Mongo.Collection('serverstatus');

if (Meteor.isServer) {
  FeaturesCollection._ensureIndex({ id: 1, priority: 1 });
  OrgFeaturesCollection._ensureIndex({ id: 1 });
  IterationsCollection._ensureIndex({ sprintName: 1 });
  TeamsCollection._ensureIndex({ name: 1 });
  ProjectsCollection._ensureIndex({ name: 1 });

  // not using arrow function in Meteor.publish
  // as we might need to use 'this' inside the function

  Meteor.publish('features', function publishFeatures() {
    return FeaturesCollection.find();
  });
  Meteor.publish('deltafeatures', function publishDeltaFeatures() {
    return DeltaFeaturesCollection.find();
  });
  Meteor.publish('iterations', function publishIterations() {
    return IterationsCollection.find();
  });
  Meteor.publish('teams', function publishTeams() {
    return TeamsCollection.find();
  });
  Meteor.publish('projects', function publishProjects() {
    return ProjectsCollection.find();
  });
  Meteor.publish('allocations', function publishAllocations() {
    return AllocationsCollection.find();
  });
  Meteor.publish('velocities', function publishVelocities() {
    return VelocitiesCollection.find();
  });
  Meteor.publish('serverstatus', function publishServerStatus() {
    return ServerStatusCollection.find();
  });
}
