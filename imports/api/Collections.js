import { Mongo } from 'meteor/mongo';
 
export const FeaturesCollection = new Mongo.Collection('features');
export const OrgFeaturesCollection = new Mongo.Collection('orgfeatures');
export const DeltaFeaturesCollection = new Mongo.Collection('deltafeatures');
export const SprintsCollection = new Mongo.Collection('sprints');
export const TeamsCollection = new Mongo.Collection('teams');
export const ProjectsCollection = new Mongo.Collection('projects');
export const AllocationsCollection = new Mongo.Collection('allocations');
export const VelocitiesCollection = new Mongo.Collection('velocities');