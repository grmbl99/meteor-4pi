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
}
