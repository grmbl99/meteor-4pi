import { Meteor } from 'meteor/meteor';
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';

function insertFeature(feature) {
  FeaturesCollection.insert(feature);
}

function insertSprint(sprint) {
  SprintsCollection.insert(sprint);
}

function insertTeam(team) {
  TeamsCollection.insert(team);
}

function insertProject(project) {
  ProjectsCollection.insert(project);
}

Meteor.startup(() => {
  if (FeaturesCollection.find().count() === 0) {
    [
      {pi: "PI 21.1", name: "this is a feature", size: 10, done: 5, startsprint: "2109", endsprint: "2113", team: "pegasus", project: "puma"},
      {pi: "PI 21.1", name: "some other feature", size: 2, done: 0, startsprint: "2111", endsprint: "2117", team: "pegasus", project: "voip"},
      {pi: "PI 21.1", name: "yet another feature", size: 15, done: 3, startsprint: "2117", endsprint: "IP 21.1", team: "mushu", project: "puma"},
      {pi: "PI 21.2", name: "last feature", size: 30, done: 15, startsprint: "2125", endsprint: "2129", team: "hercules", project: "tiger"}
    ].forEach(insertFeature);
  }


  if (SprintsCollection.find().count() === 0) {
    [
      {pi: "PI 21.1", sprintname: "2109"},
      {pi: "PI 21.1", sprintname: "2111"},
      {pi: "PI 21.1", sprintname: "2113"},
      {pi: "PI 21.1", sprintname: "2115"},
      {pi: "PI 21.1", sprintname: "2117"},
      {pi: "PI 21.1", sprintname: "2119"},
      {pi: "PI 21.1", sprintname: "IP 21.1"},
      {pi: "PI 21.2", sprintname: "2123"},
      {pi: "PI 21.2", sprintname: "2125"},
      {pi: "PI 21.2", sprintname: "2127"},
      {pi: "PI 21.2", sprintname: "2129"},
      {pi: "PI 21.2", sprintname: "IP 21.2"}      
    ].forEach(insertSprint);
  }

  if (TeamsCollection.find().count() === 0) {
    [
      {teamname: "pegasus"},
      {teamname: "mushu"},
      {teamname: "hades"},
      {teamname: "hercules"}
    ].forEach(insertTeam);
  }

  if (ProjectsCollection.find().count() === 0) {
    [
      {projectname: "tiger"},
      {projectname: "puma"},
      {projectname: "voip"},
      {projectname: "bobcat"}
    ].forEach(insertProject);
  }
});