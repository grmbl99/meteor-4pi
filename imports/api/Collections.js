import { Mongo } from 'meteor/mongo';
 
export const FeaturesCollection = new Mongo.Collection('features');
export const SprintsCollection = new Mongo.Collection('sprints');
export const TeamsCollection = new Mongo.Collection('teams');
export const ProjectsCollection = new Mongo.Collection('projects');
export const AllocationCollection = new Mongo.Collection('allocation');
export const VelocityCollection = new Mongo.Collection('velocity');
