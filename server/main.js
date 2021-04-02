import { Meteor } from 'meteor/meteor';
import { FeaturesCollection, OrgFeaturesCollection, AddedFeaturesCollection, RemovedFeaturesCollection, ChangedFeaturesCollection,
         SprintsCollection, TeamsCollection, ProjectsCollection, AllocationCollection, VelocityCollection } from '/imports/api/Collections';

function insertFeature(feature) { FeaturesCollection.insert(feature);}
function insertOrgFeature(feature) {OrgFeaturesCollection.insert(feature);}

function insertAddedFeature(feature) { AddedFeaturesCollection.insert(feature);}
function insertRemovedFeature(feature) { RemovedFeaturesCollection.insert(feature);}
function insertChangedFeature(feature) { ChangedFeaturesCollection.insert(feature);}

function insertSprint(sprint) {SprintsCollection.insert(sprint);}
function insertTeam(team) {TeamsCollection.insert(team);}
function insertProject(project) {ProjectsCollection.insert(project);}
function insertAllocation(allocation) {AllocationCollection.insert(allocation);}
function insertVelocity(velocity) {VelocityCollection.insert(velocity);}

// compare FeaturesCollection with OrgFeaturesCollection
// fill AddedFeaturesCollection, RemovedFeaturesCollection and ChangedFeaturesCollection
function CompareFeatureCollections() {
  const features = FeaturesCollection.find({}).fetch();  
  features.forEach((feature) => {
    const orgfeature = OrgFeaturesCollection.findOne({id: feature.id});
    if (orgfeature) {
      pichanged = feature.pi!==orgfeature.pi;
      teamchanged = feature.team!==orgfeature.team;
      projectchanged = feature.project!==orgfeature.project;

      if(pichanged || teamchanged || projectchanged) {
        insertAddedFeature({
          id: feature.id, 
          name: feature.name,
          size: feature.size,
          done: feature.done,
          startsprint: feature.startsprint,
          endsprint: feature.endsprint,
          pi: pichanged ? feature.pi : '', 
          team: teamchanged ? feature.team : '', 
          project: projectchanged ? feature.project : ''
        });
        insertRemovedFeature({
          id: feature.id, 
          name: orgfeature.name,
          size: orgfeature.size,
          done: orgfeature.done,
          startsprint: orgfeature.startsprint,
          endsprint: orgfeature.endsprint,
          pi: pichanged ? orgfeature.pi : '', 
          team: teamchanged ? orgfeature.team : '', 
          project: projectchanged ? orgfeature.project : ''
        });
      }

      sizechanged = feature.size!==orgfeature.size;
      donechanged = feature.done!==orgfeature.done;
      startsprintchanged = feature.startsprint!==orgfeature.startsprint;
      endsprintchanged = feature.endsprint!==orgfeature.endsprint;

      if(sizechanged || donechanged || startsprintchanged || endsprintchanged) {
        insertChangedFeature(orgfeature);  
      }
    } else {
      insertAddedFeature(feature);
    }
  });

  const orgfeatures = OrgFeaturesCollection.find({}).fetch();  
  orgfeatures.forEach((orgfeature) => {
    const feature = FeaturesCollection.findOne({id: orgfeature.id});
    if (!feature) {
      insertRemovedFeature(orgfeature);
    }
  });
}

Meteor.startup(() => {
  FeaturesCollection.remove({});
  OrgFeaturesCollection.remove({});
  SprintsCollection.remove({});
  ProjectsCollection.remove({});
  TeamsCollection.remove({});
  AllocationCollection.remove({});
  VelocityCollection.remove({});

  AddedFeaturesCollection.remove({});
  RemovedFeaturesCollection.remove({});
  ChangedFeaturesCollection.remove({});

  if (OrgFeaturesCollection.find().count() === 0) {
    [
      {id: '200000', name: 'removed feature', pi: 'PI 21.1', size: 10, done: 5, startsprint: '2109', endsprint: '2113', team: 'pegasus', project: 'puma'},
      {id: '200001', name: 'removed feature', pi: 'PI 21.1', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {id: '100000', name: 'pi changed', pi: 'PI 21.2', size: 10, done: 5, startsprint: '2109', endsprint: '2113', team: 'pegasus', project: 'puma'},
      {id: '100001', name: 'team changed', pi: 'PI 21.1', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'mushu', project: 'voip'},
      {id: '100002', name: 'project changed', pi: 'PI 21.1', size: 15, done: 15, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'tiger'},
      {id: '100003', name: 'pi, tem and project change', pi: 'PI 21.3', size: 30, done: 15, startsprint: '2109', endsprint: '2119', team: 'pegasus', project: 'voip'},
      {id: '100004', name: 'value changed', pi: 'PI 21.1', size: 20, done: 10, startsprint: '2111', endsprint: '2113', team: 'pegasus', project: 'puma'},
      {id: '100005', name: 'value changed', pi: 'PI 21.1', size: 2, done: 0, startsprint: '2109', endsprint: '2111', team: 'pegasus', project: 'voip'},
      {id: '100006', name: 'value changed', pi: 'PI 21.1', size: 30, done: 13, startsprint: '2109', endsprint: '2117', team: 'mushu', project: 'puma'},
      {id: '100007', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2125', endsprint: 'IP 21.2', team: 'hercules', project: 'tiger'},
      {id: '100008', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, done: 5, startsprint: '2125', endsprint: '2129', team: 'pegasus', project: 'puma'},
      {id: '100009', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, done: 0, startsprint: '2129', endsprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
      {id: '100010', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, done: 3, startsprint: '2123', endsprint: '2129', team: 'mushu', project: 'puma'},
      {id: '100011', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2123', endsprint: '2123', team: 'hercules', project: 'tiger'},
      {id: '100012', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, done: 5, startsprint: '2123', endsprint: '2123', team: 'hades', project: 'puma'},
      {id: '100013', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, done: 0, startsprint: '2133', endsprint: '2143', team: 'hades', project: 'voip'},
      {id: '100014', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, done: 3, startsprint: '2135', endsprint: 'IP 21.3', team: 'mushu', project: 'puma'},
      {id: '100015', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, done: 15, startsprint: '2137', endsprint: '2143', team: 'hercules', project: 'tiger'},
      {id: '100016', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, done: 5, startsprint: '2133', endsprint: '2133', team: 'hades', project: 'puma'},
      {id: '100017', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, done: 0, startsprint: '2135', endsprint: '2139', team: 'hades', project: 'voip'},
      {id: '100018', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, done: 15, startsprint: '2135', endsprint: 'IP 21.3', team: 'mushu', project: 'puma'},
      {id: '100019', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, done: 15, startsprint: '2141', endsprint: '2143', team: 'hercules', project: 'tiger'},
      {id: '100020', name: 'this is a feature for testing', pi: 'PI 21.1', size: 10, done: 5, startsprint: '2109', endsprint: '2115', team: 'pegasus', project: 'puma'},
      {id: '100021', name: 'this is a feature for testing', pi: 'PI 21.1', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {id: '100022', name: 'this is a feature for testing', pi: 'PI 21.1', size: 15, done: 10, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'puma'},
      {id: '100023', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2125', endsprint: '2129', team: 'hercules', project: 'tiger'},
      {id: '100024', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, done: 5, startsprint: '2125', endsprint: '2125', team: 'pegasus', project: 'puma'},
      {id: '100025', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, done: 2, startsprint: 'IP 21.2', endsprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
      {id: '100026', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, done: 3, startsprint: '2127', endsprint: 'IP 21.2', team: 'mushu', project: 'puma'},
      {id: '100027', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2125', endsprint: '2129', team: 'hercules', project: 'tiger'},
      {id: '100028', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, done: 5, startsprint: '2141', endsprint: '2143', team: 'hercules', project: 'bobcat'},
      {id: '100029', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, done: 0, startsprint: '2133', endsprint: '2133', team: 'hercules', project: 'voip'},
      {id: '100030', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, done: 3, startsprint: '2133', endsprint: 'IP 21.3', team: 'mushu', project: 'bobcat'},
      {id: '100031', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, done: 15, startsprint: '2143', endsprint: 'IP 21.3', team: 'hercules', project: 'tiger'},
      {id: '100032', name: 'this is a feature for testing', pi: 'PI 21.4', size: 10, done: 5, startsprint: '2147', endsprint: '2149', team: 'hercules', project: 'bobcat'},
      {id: '100033', name: 'this is a feature for testing', pi: 'PI 21.4', size: 2, done: 0, startsprint: '2149', endsprint: '2151', team: 'pegasus', project: 'voip'},
      {id: '100034', name: 'this is a feature for testing', pi: 'PI 21.4', size: 15, done: 3, startsprint: '2151', endsprint: 'IP 21.4', team: 'mushu', project: 'bobcat'},
      {id: '100035', name: 'this is a feature for testing', pi: 'PI 21.4', size: 30, done: 30, startsprint: '2151', endsprint: '2201', team: 'hercules', project: 'tiger'}
    ].forEach(insertOrgFeature);
  }

  if (FeaturesCollection.find().count() === 0) {
    [
      {id: '100000', name: 'pi changed', pi: 'PI 21.1', size: 10, done: 5, startsprint: '2109', endsprint: '2113', team: 'pegasus', project: 'puma'},
      {id: '100001', name: 'team changed', pi: 'PI 21.1', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {id: '100002', name: 'project changed', pi: 'PI 21.1', size: 15, done: 15, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'puma'},
      {id: '100003', name: 'pi, tem and project change', pi: 'PI 21.1', size: 30, done: 15, startsprint: '2109', endsprint: '2119', team: 'hercules', project: 'tiger'},
      {id: '100004', name: 'value changed', pi: 'PI 21.1', size: 10, done: 5, startsprint: '2111', endsprint: '2113', team: 'pegasus', project: 'puma'},
      {id: '100005', name: 'value changed', pi: 'PI 21.1', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {id: '100006', name: 'value changed', pi: 'PI 21.1', size: 15, done: 3, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'puma'},
      {id: '100007', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2125', endsprint: 'IP 21.2', team: 'hercules', project: 'tiger'},
      {id: '100008', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, done: 5, startsprint: '2125', endsprint: '2129', team: 'pegasus', project: 'puma'},
      {id: '100009', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, done: 0, startsprint: '2129', endsprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
      {id: '100010', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, done: 3, startsprint: '2123', endsprint: '2129', team: 'mushu', project: 'puma'},
      {id: '100011', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2123', endsprint: '2123', team: 'hercules', project: 'tiger'},
      {id: '100012', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, done: 5, startsprint: '2123', endsprint: '2123', team: 'hades', project: 'puma'},
      {id: '100013', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, done: 0, startsprint: '2133', endsprint: '2143', team: 'hades', project: 'voip'},
      {id: '100014', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, done: 3, startsprint: '2135', endsprint: 'IP 21.3', team: 'mushu', project: 'puma'},
      {id: '100015', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, done: 15, startsprint: '2137', endsprint: '2143', team: 'hercules', project: 'tiger'},
      {id: '100016', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, done: 5, startsprint: '2133', endsprint: '2133', team: 'hades', project: 'puma'},
      {id: '100017', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, done: 0, startsprint: '2135', endsprint: '2139', team: 'hades', project: 'voip'},
      {id: '100018', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, done: 15, startsprint: '2135', endsprint: 'IP 21.3', team: 'mushu', project: 'puma'},
      {id: '100019', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, done: 15, startsprint: '2141', endsprint: '2143', team: 'hercules', project: 'tiger'},
      {id: '100020', name: 'this is a feature for testing', pi: 'PI 21.1', size: 10, done: 5, startsprint: '2109', endsprint: '2115', team: 'pegasus', project: 'puma'},
      {id: '100021', name: 'this is a feature for testing', pi: 'PI 21.1', size: 2, done: 0, startsprint: '2111', endsprint: '2117', team: 'pegasus', project: 'voip'},
      {id: '100022', name: 'this is a feature for testing', pi: 'PI 21.1', size: 15, done: 10, startsprint: '2117', endsprint: 'IP 21.1', team: 'mushu', project: 'puma'},
      {id: '100023', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2125', endsprint: '2129', team: 'hercules', project: 'tiger'},
      {id: '100024', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, done: 5, startsprint: '2125', endsprint: '2125', team: 'pegasus', project: 'puma'},
      {id: '100025', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, done: 2, startsprint: 'IP 21.2', endsprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
      {id: '100026', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, done: 3, startsprint: '2127', endsprint: 'IP 21.2', team: 'mushu', project: 'puma'},
      {id: '100027', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, done: 15, startsprint: '2125', endsprint: '2129', team: 'hercules', project: 'tiger'},
      {id: '100028', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, done: 5, startsprint: '2141', endsprint: '2143', team: 'hercules', project: 'bobcat'},
      {id: '100029', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, done: 0, startsprint: '2133', endsprint: '2133', team: 'hercules', project: 'voip'},
      {id: '100030', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, done: 3, startsprint: '2133', endsprint: 'IP 21.3', team: 'mushu', project: 'bobcat'},
      {id: '100031', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, done: 15, startsprint: '2143', endsprint: 'IP 21.3', team: 'hercules', project: 'tiger'},
      {id: '100032', name: 'this is a feature for testing', pi: 'PI 21.4', size: 10, done: 5, startsprint: '2147', endsprint: '2149', team: 'hercules', project: 'bobcat'},
      {id: '100033', name: 'this is a feature for testing', pi: 'PI 21.4', size: 2, done: 0, startsprint: '2149', endsprint: '2151', team: 'pegasus', project: 'voip'},
      {id: '100034', name: 'this is a feature for testing', pi: 'PI 21.4', size: 15, done: 3, startsprint: '2151', endsprint: 'IP 21.4', team: 'mushu', project: 'bobcat'},
      {id: '100035', name: 'this is a feature for testing', pi: 'PI 21.4', size: 30, done: 30, startsprint: '2151', endsprint: '2201', team: 'hercules', project: 'tiger'}
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

  if (AllocationCollection.find().count() === 0) {
    [
      {teamname: 'pegasus', projectname: 'tiger', pi: 'PI 21.1', allocation: 10},
      {teamname: 'mushu', projectname: 'puma', pi: 'PI 21.1', allocation: 80},
      {teamname: 'hades', projectname: 'voip', pi: 'PI 21.1', allocation: 70},
      {teamname: 'hercules', projectname: 'bobcat', pi: 'PI 21.1', allocation: 20},
      {teamname: 'pegasus', projectname: 'tiger', pi: 'PI 21.2', allocation: 10},
      {teamname: 'mushu', projectname: 'puma', pi: 'PI 21.2', allocation: 80},
      {teamname: 'hades', projectname: 'voip', pi: 'PI 21.2', allocation: 70},
      {teamname: 'hercules', projectname: 'bobcat', pi: 'PI 21.2', allocation: 20}
    ].forEach(insertAllocation);      
  }

  if (VelocityCollection.find().count() === 0) {
    [
      {teamname: 'pegasus', pi: 'PI 21.1', velocity: 75},
      {teamname: 'mushu', pi: 'PI 21.1', velocity: 60},
      {teamname: 'hades', pi: 'PI 21.1', velocity: 80},
      {teamname: 'hercules', pi: 'PI 21.1', velocity: 60},
      {teamname: 'pegasus', pi: 'PI 21.2', velocity: 75},
      {teamname: 'mushu', pi: 'PI 21.2', velocity: 60},
      {teamname: 'hades', pi: 'PI 21.2', velocity: 80},
      {teamname: 'hercules', pi: 'PI 21.2', velocity: 60},
      {teamname: 'pegasus', pi: 'PI 21.3', velocity: 75},
      {teamname: 'mushu', pi: 'PI 21.3', velocity: 60},
      {teamname: 'hades', pi: 'PI 21.3', velocity: 80},
      {teamname: 'hercules', pi: 'PI 21.3', velocity: 60} 
    ].forEach(insertVelocity);      
  }

  CompareFeatureCollections();
});