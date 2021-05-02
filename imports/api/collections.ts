import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface ServerStatusType {
  key: string;
  value: string;
}

export interface featureType {
  _id: string;
  id: number;
  name: string;
  pi: string;
  size: number;
  progress: number;
  startSprint: number;
  endSprint: number;
  startSprintName: string;
  endSprintName: string;
  featureEndSprintName: string;
  featureEndSprint: number;
  tags: string;
  featureSize: number;
  team: string;
  project: string;
  state: string;
  priority: number;
}

export interface iterationType {
  _id: string;
  startDate: Date | undefined;
  finishDate: Date | undefined;
  sprintName: string;
  sprint: number;
  pi: string;
}

export interface velocityType {
  pi: string;
  team: string;
  project: string;
  value: number;
}

export interface deltaFeatureType {
  feature: featureType;
  type: string;
}

export interface teamType {
  _id: string;
  name: string;
}

export interface projectType {
  _id: string;
  name: string;
}

export const FeaturesCollection = new Mongo.Collection<featureType>('features');
export const OrgFeaturesCollection = new Mongo.Collection<featureType>('orgfeatures');
export const DeltaFeaturesCollection = new Mongo.Collection<deltaFeatureType>('deltafeatures');
export const IterationsCollection = new Mongo.Collection<iterationType>('iterations');
export const TeamsCollection = new Mongo.Collection<teamType>('teams');
export const ProjectsCollection = new Mongo.Collection<projectType>('projects');
export const VelocityPlanCollection = new Mongo.Collection<velocityType>('velocityplan');
export const ServerStatusCollection = new Mongo.Collection<ServerStatusType>('serverstatus');

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
  Meteor.publish('velocityplan', function publishVelocityPlan() {
    return VelocityPlanCollection.find();
  });
  Meteor.publish('serverstatus', function publishServerStatus() {
    return ServerStatusCollection.find();
  });
}
