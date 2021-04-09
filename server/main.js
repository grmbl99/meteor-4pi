import { Meteor } from 'meteor/meteor';
import * as vsoNodeApi from 'azure-devops-node-api';
import { FeaturesCollection, OrgFeaturesCollection, DeltaFeaturesCollection,
         SprintsCollection, TeamsCollection, ProjectsCollection, 
         AllocationsCollection, VelocitiesCollection } from '/imports/api/Collections';
import { DisplayTypes } from '/imports/api/Consts.jsx';

function insertFeature(feature) { FeaturesCollection.insert(feature); }
function insertOrgFeature(feature) { OrgFeaturesCollection.insert(feature); }
function insertDeltaFeature(feature) { DeltaFeaturesCollection.insert(feature); }
function insertSprint(sprint) { SprintsCollection.insert(sprint); }
function insertTeam(team) { TeamsCollection.insert(team); }
function insertProject(project) { ProjectsCollection.insert(project); }
function insertAllocation(allocation) { AllocationsCollection.insert(allocation); }
function insertVelocity(velocity) { VelocitiesCollection.insert(velocity); }

// compare FeaturesCollection with OrgFeaturesCollection: fill DeltaFeaturesCollection
function CompareFeatureCollections() {
  const features = FeaturesCollection.find({}).fetch();  

  for (const feature of features) {
    const orgfeature = OrgFeaturesCollection.findOne({id: feature.id});
    if (orgfeature) {
      if(feature.pi!==orgfeature.pi || feature.team!==orgfeature.team || feature.project!==orgfeature.project) {
        insertDeltaFeature({type: DisplayTypes.ADDED, feature: feature});
        insertDeltaFeature({type: DisplayTypes.REMOVED, feature: orgfeature});
      }
      if(feature.size!==orgfeature.size || feature.done!==orgfeature.done || 
         feature.startsprint!==orgfeature.startsprint || feature.endsprint!==orgfeature.endsprint) {
        orgfeature._id=feature._id; // store org data, but allow searching on (current) feature-id
        insertDeltaFeature({type: DisplayTypes.CHANGED, feature: orgfeature});
      }
    } else {
      insertDeltaFeature({type: DisplayTypes.ADDED, feature: feature});
    }
  }

  const orgfeatures = OrgFeaturesCollection.find({}).fetch();
  for (const orgfeature of orgfeatures) {
    const feature = FeaturesCollection.findOne({id: orgfeature.id});
    if (!feature) {
      insertDeltaFeature({type: DisplayTypes.REMOVED, feature: orgfeature});
    }
  }
}
Meteor.methods({
  UpdateDeltaFeatureCollection() {
    DeltaFeaturesCollection.remove({});
    CompareFeatureCollections();
  }
});

Meteor.startup(() => {
  FeaturesCollection.remove({});
  OrgFeaturesCollection.remove({});
  DeltaFeaturesCollection.remove({});
  SprintsCollection.remove({});
  ProjectsCollection.remove({});
  TeamsCollection.remove({});
  AllocationsCollection.remove({});
  VelocitiesCollection.remove({});

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
      {id: '100007', name: 'value and pi changed', pi: 'PI 21.3', size: 35, done: 15, startsprint: '2125', endsprint: 'IP 21.2', team: 'hercules', project: 'tiger'},
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
      // {pi: 'PI 21.4', sprintname: '2147'},
      // {pi: 'PI 21.4', sprintname: '2149'},
      // {pi: 'PI 21.4', sprintname: '2151'},
      // {pi: 'PI 21.4', sprintname: '2201'},
      // {pi: 'PI 21.4', sprintname: '2203'},
      // {pi: 'PI 21.4', sprintname: '2205'},
      // {pi: 'PI 21.4', sprintname: 'IP 21.4'}
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

  if (AllocationsCollection.find().count() === 0) {
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

  if (VelocitiesCollection.find().count() === 0) {
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
  
  async function getAreas(witAPI) {
    try {
      const queryResult = await witAPI.getClassificationNode('IGT', 'areas', '/systems/portfolio fixed/solution/art imaging chain',2);
  
      console.log(queryResult.name);
      for (const child of queryResult.children) {
        console.log('  ' + child.path);
        if (child.hasChildren) {
          for (const grandchild of child.children) {
            console.log('    ' + grandchild.path);
          }
        }
      }  
    } catch(e) {
      console.log('error getting areas: ' + e);
    }
  }

  async function getIterations(witAPI) {
    try {
      const queryResult = await witAPI.getClassificationNode('IGT', 'iterations', '/systems/safe fixed',2);
  
      console.log(queryResult.name);
      for (const child of queryResult.children) {
        console.log('  ' + child.name);
        if (child.hasChildren) {
          for (const grandchild of child.children) {
            const date = new Date(grandchild.attributes.startDate);
            console.log('    ' + grandchild.name + ' ' + date.getFullYear() + ' ' + date.getMonth() + ' ' + date.getDay());
          }
        }
      }
    } catch(e) {
      console.log('error getting iterations: ' + e);
    }
  }

  async function getWorkItem(witAPI,id) {
    try {
      const queryResult = await witAPI.getWorkItem(id,[
        'System.Title', 'System.NodeName', 'System.IterationPath', 
        'Microsoft.VSTS.Scheduling.Effort', 'Philips.Planning.Release']);

      let res = queryResult.id;
      res+=', ' + queryResult.fields['System.Title'];
      res+=', ' + queryResult.fields['System.NodeName'];
      res+=', ' + queryResult.fields['System.IterationPath'];
      res+=', ' + queryResult.fields['Microsoft.VSTS.Scheduling.Effort'];
      res+=', ' + queryResult.fields['Philips.Planning.Release'];
      console.log(res);
    } catch(e) {
      console.log('error getting workitem: ' +e);
    }
  }

  async function getWorkItems(witAPI, query) {
    try {
      const teamContext = { project: 'IGT' };
      const queryResult = await witAPI.queryByWiql(query, teamContext);  

      for (const workitemlink of queryResult.workItemRelations) {
        if (workitemlink.rel==='System.LinkTypes.Hierarchy-Forward') {
          console.log(workitemlink.source.id, ' -> ', workitemlink.target.id);
        } else {
          console.log(workitemlink.target.id);
          getWorkItem(witAPI,workitemlink.target.id);
        }
      }
    } catch(e) {
      console.log('error getting workitems: ' + e);
    }
  }

  async function queryADS() {
    const url = 'https://tfsemea1.ta.philips.com/tfs/TPC_Region22/';
    const token = 'dvlfdqm3xzblfaix365ccfkwhax545f6g47dfzb2xk3ifpqlyfrq';
    const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(token); 
    const connection = new vsoNodeApi.WebApi(url, authHandler);
  
    const query = {query: 
      `SELECT
          [System.Id]
      FROM workitemLinks
      WHERE
          (
              [Source].[System.TeamProject] = @project
              AND [Source].[System.WorkItemType] = 'Feature'
              AND [Source].[System.IterationPath] UNDER 'IGT\\Systems\\SAFe Fixed\\PI 21.1'
              AND [Source].[System.AreaPath] UNDER 'IGT\\Systems\\Portfolio Fixed\\Solution\\ART Imaging Chain'
          )
          AND (
              [Target].[System.TeamProject] = @project
              AND [Target].[System.WorkItemType] = 'Story'
              AND [Target].[System.State] = 'Done'
          )
      ORDER BY [System.IterationId],
          [System.Id]
      MODE (MustContain)`
    };
  
    try {
      const witAPI = await connection.getWorkItemTrackingApi();

      getIterations(witAPI);
      getAreas(witAPI);
      getWorkItems(witAPI, query);  
    } catch(e) {
      console.log('error reading from ADS: ' + e);
    }
  }

  queryADS();
});