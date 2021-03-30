import { Meteor } from 'meteor/meteor';
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';

function insertFeature(feature) { FeaturesCollection.insert(feature);}
function insertSprint(sprint) {SprintsCollection.insert(sprint);}
function insertTeam(team) {TeamsCollection.insert(team);}
function insertProject(project) {ProjectsCollection.insert(project);}

Meteor.startup(() => {
  FeaturesCollection.remove({});
  SprintsCollection.remove({});
  ProjectsCollection.remove({});
  TeamsCollection.remove({});

  if (FeaturesCollection.find().count() === 0) {
    [
      {pi: 'PI 21.1', name: '100000 this is a feature for testing', size: 10, done: 5, startsprint: '2109', endsprint: '2113', team: 'pegasus', project: 'puma'},
      {pi: 'PI 21.1', name: '100001 this is a feature for testing', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {pi: 'PI 21.1', name: '100002 this is a feature for testing', size: 15, done: 15, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'puma'},
      {pi: 'PI 21.1', name: '100003 this is a feature for testing', size: 30, done: 15, startsprint: '2109', endsprint: '2119', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.1', name: '100004 this is a feature for testing', size: 10, done: 5, startsprint: '2111', endsprint: '2113', team: 'pegasus', project: 'puma'},
      {pi: 'PI 21.1', name: '100005 this is a feature for testing', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {pi: 'PI 21.1', name: '100006 this is a feature for testing', size: 15, done: 3, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'puma'},
      {pi: 'PI 21.2', name: '100007 this is a feature for testing', size: 30, done: 15, startsprint: '2125', endsprint: 'IP 21.2', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.2', name: '100008 this is a feature for testing', size: 10, done: 5, startsprint: '2125', endsprint: '2129', team: 'pegasus', project: 'puma'},
      {pi: 'PI 21.2', name: '100009 this is a feature for testing', size: 2, done: 0, startsprint: '2129', endsprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
      {pi: 'PI 21.2', name: '100010 this is a feature for testing', size: 15, done: 3, startsprint: '2123', endsprint: '2129', team: 'mushu', project: 'puma'},
      {pi: 'PI 21.2', name: '100011 this is a feature for testing', size: 30, done: 15, startsprint: '2123', endsprint: '2123', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.2', name: '100012 this is a feature for testing', size: 10, done: 5, startsprint: '2123', endsprint: '2123', team: 'hades', project: 'puma'},
      {pi: 'PI 21.3', name: '100013 this is a feature for testing', size: 2, done: 0, startsprint: '2133', endsprint: '2143', team: 'hades', project: 'voip'},
      {pi: 'PI 21.3', name: '100014 this is a feature for testing', size: 15, done: 3, startsprint: '2135', endsprint: 'IP 21.3', team: 'mushu', project: 'puma'},
      {pi: 'PI 21.3', name: '100015 this is a feature for testing', size: 30, done: 15, startsprint: '2137', endsprint: '2143', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.3', name: '100016 this is a feature for testing', size: 10, done: 5, startsprint: '2133', endsprint: '2133', team: 'hades', project: 'puma'},
      {pi: 'PI 21.3', name: '100017 this is a feature for testing', size: 2, done: 0, startsprint: '2135', endsprint: '2139', team: 'hades', project: 'voip'},
      {pi: 'PI 21.3', name: '100018 this is a feature for testing', size: 15, done: 15, startsprint: '2135', endsprint: 'IP 21.3', team: 'mushu', project: 'puma'},
      {pi: 'PI 21.3', name: '100019 this is a feature for testing', size: 30, done: 15, startsprint: '2141', endsprint: '2143', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.1', name: '100020 this is a feature for testing', size: 10, done: 5, startsprint: '2109', endsprint: '2115', team: 'pegasus', project: 'puma'},
      {pi: 'PI 21.1', name: '100021 this is a feature for testing', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {pi: 'PI 21.1', name: '100022 this is a feature for testing', size: 15, done: 10, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'puma'},
      {pi: 'PI 21.2', name: '100023 this is a feature for testing', size: 30, done: 15, startsprint: '2125', endsprint: '2129', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.2', name: '100024 this is a feature for testing', size: 10, done: 5, startsprint: '2125', endsprint: '2125', team: 'pegasus', project: 'puma'},
      {pi: 'PI 21.2', name: '100025 this is a feature for testing', size: 2, done: 2, startsprint: 'IP 21.2', endsprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
      {pi: 'PI 21.2', name: '100026 this is a feature for testing', size: 15, done: 3, startsprint: '2127', endsprint: 'IP 21.2', team: 'mushu', project: 'puma'},
      {pi: 'PI 21.2', name: '100027 this is a feature for testing', size: 30, done: 15, startsprint: '2125', endsprint: '2129', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.3', name: '100028 this is a feature for testing', size: 10, done: 5, startsprint: '2141', endsprint: '2143', team: 'hercules', project: 'bobcat'},
      {pi: 'PI 21.3', name: '100029 this is a feature for testing', size: 2, done: 0, startsprint: '2133', endsprint: '2133', team: 'hercules', project: 'voip'},
      {pi: 'PI 21.3', name: '100030 this is a feature for testing', size: 15, done: 3, startsprint: '2133', endsprint: 'IP 21.3', team: 'mushu', project: 'bobcat'},
      {pi: 'PI 21.3', name: '100031 this is a feature for testing', size: 30, done: 15, startsprint: '2143', endsprint: 'IP 21.3', team: 'hercules', project: 'tiger'},
      {pi: 'PI 21.4', name: '100032 this is a feature for testing', size: 10, done: 5, startsprint: '2147', endsprint: '2149', team: 'hercules', project: 'bobcat'},
      {pi: 'PI 21.4', name: '100033 this is a feature for testing', size: 2, done: 0, startsprint: '2149', endsprint: '2151', team: 'pegasus', project: 'voip'},
      {pi: 'PI 21.4', name: '100034 this is a feature for testing', size: 15, done: 3, startsprint: '2151', endsprint: 'IP 21.4', team: 'mushu', project: 'bobcat'},
      {pi: 'PI 21.4', name: '100035 this is a feature for testing', size: 30, done: 30, startsprint: '2151', endsprint: '2201', team: 'hercules', project: 'tiger'}
    ].forEach(insertFeature);
  }

  if (SprintsCollection.find().count() === 0) {
    [
      {pi: 'PI 21.1', sprintname: '2109'},
      {pi: 'PI 21.1', sprintname: '2111'},
      {pi: 'PI 21.1', sprintname: '2113'},
      {pi: 'PI 21.1', sprintname: '2115'},
      {pi: 'PI 21.1', sprintname: '2117'},
      {pi: 'PI 21.1', sprintname: '2119'},
      {pi: 'PI 21.1', sprintname: 'IP 21.1'},
      {pi: 'PI 21.2', sprintname: '2123'},
      {pi: 'PI 21.2', sprintname: '2125'},
      {pi: 'PI 21.2', sprintname: '2127'},
      {pi: 'PI 21.2', sprintname: '2129'},
      {pi: 'PI 21.2', sprintname: 'IP 21.2'},
      {pi: 'PI 21.3', sprintname: '2133'},
      {pi: 'PI 21.3', sprintname: '2135'},
      {pi: 'PI 21.3', sprintname: '2137'},
      {pi: 'PI 21.3', sprintname: '2139'},
      {pi: 'PI 21.3', sprintname: '2141'},
      {pi: 'PI 21.3', sprintname: '2143'},
      {pi: 'PI 21.3', sprintname: 'IP 21.3'},
      {pi: 'PI 21.4', sprintname: '2147'},
      {pi: 'PI 21.4', sprintname: '2149'},
      {pi: 'PI 21.4', sprintname: '2151'},
      {pi: 'PI 21.4', sprintname: '2201'},
      {pi: 'PI 21.4', sprintname: '2203'},
      {pi: 'PI 21.4', sprintname: '2205'},
      {pi: 'PI 21.4', sprintname: 'IP 21.4'}
    ].forEach(insertSprint);
  }

  if (TeamsCollection.find().count() === 0) {
    [
      {teamname: 'pegasus'},
      {teamname: 'mushu'},
      {teamname: 'hades'},
      {teamname: 'hercules'}
    ].forEach(insertTeam);
  }

  if (ProjectsCollection.find().count() === 0) {
    [
      {projectname: 'tiger'},
      {projectname: 'puma'},
      {projectname: 'voip'},
      {projectname: 'bobcat'}
    ].forEach(insertProject);
  }
});