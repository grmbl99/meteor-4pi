import * as Collections from '/imports/api/collections';
import { ServerStatus, SyncStatus } from '/imports/api/constants';

function populateOrgFeaturesCollection() {
  [
    {id: '200000', name: 'removed feature', pi: 'PI 21.1', size: 10, progress: 5, startSprint: '2109', endSprint: '2113', team: 'pegasus', project: 'puma'},
    {id: '200001', name: 'removed feature', pi: 'PI 21.1', size: 2, progress: 0, startSprint: '2111', endSprint: '2117', team: 'pegasus', project: 'voip'},
    {id: '100000', name: 'pi changed', pi: 'PI 21.2', size: 10, progress: 5, startSprint: '2109', endSprint: '2113', team: 'pegasus', project: 'puma'},
    {id: '100001', name: 'team changed', pi: 'PI 21.1', size: 2, progress: 0, startSprint: '2111', endSprint: '2117', team: 'mushu', project: 'voip'},
    {id: '100002', name: 'project changed', pi: 'PI 21.1', size: 15, progress: 15, startSprint: '2117', endSprint: 'IP 21.1', team: 'mushu', project: 'tiger'},
    {id: '100003', name: 'pi, tem and project change', pi: 'PI 21.3', size: 30, progress: 15, startSprint: '2109', endSprint: '2119', team: 'pegasus', project: 'voip'},
    {id: '100004', name: 'value changed', pi: 'PI 21.1', size: 20, progress: 10, startSprint: '2111', endSprint: '2113', team: 'pegasus', project: 'puma'},
    {id: '100005', name: 'value changed', pi: 'PI 21.1', size: 2, progress: 0, startSprint: '2109', endSprint: '2111', team: 'pegasus', project: 'voip'},
    {id: '100006', name: 'value changed', pi: 'PI 21.1', size: 30, progress: 13, startSprint: '2109', endSprint: '2117', team: 'mushu', project: 'puma'},
    {id: '100007', name: 'value and pi changed', pi: 'PI 21.3', size: 35, progress: 15, startSprint: '2125', endSprint: 'IP 21.2', team: 'hercules', project: 'tiger'},
    {id: '100008', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, progress: 5, startSprint: '2125', endSprint: '2129', team: 'pegasus', project: 'puma'},
    {id: '100009', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, progress: 0, startSprint: '2129', endSprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
    {id: '100010', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, progress: 3, startSprint: '2123', endSprint: '2129', team: 'mushu', project: 'puma'},
    {id: '100011', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, progress: 15, startSprint: '2123', endSprint: '2123', team: 'hercules', project: 'tiger'},
    {id: '100012', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, progress: 5, startSprint: '2123', endSprint: '2123', team: 'hades', project: 'puma'},
    {id: '100013', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, progress: 0, startSprint: '2133', endSprint: '2143', team: 'hades', project: 'voip'},
    {id: '100014', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, progress: 3, startSprint: '2135', endSprint: 'IP 21.3', team: 'mushu', project: 'puma'},
    {id: '100015', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, progress: 15, startSprint: '2137', endSprint: '2143', team: 'hercules', project: 'tiger'},
    {id: '100016', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, progress: 5, startSprint: '2133', endSprint: '2133', team: 'hades', project: 'puma'},
    {id: '100017', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, progress: 0, startSprint: '2135', endSprint: '2139', team: 'hades', project: 'voip'},
    {id: '100018', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, progress: 15, startSprint: '2135', endSprint: 'IP 21.3', team: 'mushu', project: 'puma'},
    {id: '100019', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, progress: 15, startSprint: '2141', endSprint: '2143', team: 'hercules', project: 'tiger'},
    {id: '100020', name: 'this is a feature for testing', pi: 'PI 21.1', size: 10, progress: 5, startSprint: '2109', endSprint: '2115', team: 'pegasus', project: 'puma'},
    {id: '100021', name: 'this is a feature for testing', pi: 'PI 21.1', size: 2, progress: 0, startSprint: '2111', endSprint: '2117', team: 'pegasus', project: 'voip'},
    {id: '100022', name: 'this is a feature for testing', pi: 'PI 21.1', size: 15, progress: 10, startSprint: '2117', endSprint: 'IP 21.1', team: 'mushu', project: 'puma'},
    {id: '100023', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, progress: 15, startSprint: '2125', endSprint: '2129', team: 'hercules', project: 'tiger'},
    {id: '100024', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, progress: 5, startSprint: '2125', endSprint: '2125', team: 'pegasus', project: 'puma'},
    {id: '100025', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, progress: 2, startSprint: 'IP 21.2', endSprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
    {id: '100026', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, progress: 3, startSprint: '2127', endSprint: 'IP 21.2', team: 'mushu', project: 'puma'},
    {id: '100027', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, progress: 15, startSprint: '2125', endSprint: '2129', team: 'hercules', project: 'tiger'},
    {id: '100028', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, progress: 5, startSprint: '2141', endSprint: '2143', team: 'hercules', project: 'bobcat'},
    {id: '100029', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, progress: 0, startSprint: '2133', endSprint: '2133', team: 'hercules', project: 'voip'},
    {id: '100030', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, progress: 3, startSprint: '2133', endSprint: 'IP 21.3', team: 'mushu', project: 'bobcat'},
    {id: '100031', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, progress: 15, startSprint: '2143', endSprint: 'IP 21.3', team: 'hercules', project: 'tiger'},
    {id: '100032', name: 'this is a feature for testing', pi: 'PI 21.4', size: 10, progress: 5, startSprint: '2147', endSprint: '2149', team: 'hercules', project: 'bobcat'},
    {id: '100033', name: 'this is a feature for testing', pi: 'PI 21.4', size: 2, progress: 0, startSprint: '2149', endSprint: '2151', team: 'pegasus', project: 'voip'},
    {id: '100034', name: 'this is a feature for testing', pi: 'PI 21.4', size: 15, progress: 3, startSprint: '2151', endSprint: 'IP 21.4', team: 'mushu', project: 'bobcat'},
    {id: '100035', name: 'this is a feature for testing', pi: 'PI 21.4', size: 30, progress: 30, startSprint: '2151', endSprint: '2201', team: 'hercules', project: 'tiger'}
  ].forEach(feature => Collections.OrgFeaturesCollection.insert(feature));
}

function populateFeaturesCollection() {
  [
    {id: '100000', name: 'pi changed', pi: 'PI 21.1', size: 10, progress: 5, startSprint: '2109', endSprint: '2113', team: 'pegasus', project: 'puma'},
    {id: '100001', name: 'team changed', pi: 'PI 21.1', size: 2, progress: 0, startSprint: '2111', endSprint: '2117', team: 'pegasus', project: 'voip'},
    {id: '100002', name: 'project changed', pi: 'PI 21.1', size: 15, progress: 15, startSprint: '2117', endSprint: 'IP 21.1', team: 'mushu', project: 'puma'},
    {id: '100003', name: 'pi, tem and project change', pi: 'PI 21.1', size: 30, progress: 15, startSprint: '2109', endSprint: '2119', team: 'hercules', project: 'tiger'},
    {id: '100004', name: 'value changed', pi: 'PI 21.1', size: 10, progress: 5, startSprint: '2111', endSprint: '2113', team: 'pegasus', project: 'puma'},
    {id: '100005', name: 'value changed', pi: 'PI 21.1', size: 2, progress: 0, startSprint: '2111', endSprint: '2117', team: 'pegasus', project: 'voip'},
    {id: '100006', name: 'value changed', pi: 'PI 21.1', size: 15, progress: 3, startSprint: '2117', endSprint: 'IP 21.1', team: 'mushu', project: 'puma'},
    {id: '100007', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, progress: 15, startSprint: '2125', endSprint: 'IP 21.2', team: 'hercules', project: 'tiger'},
    {id: '100008', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, progress: 5, startSprint: '2125', endSprint: '2129', team: 'pegasus', project: 'puma'},
    {id: '100009', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, progress: 0, startSprint: '2129', endSprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
    {id: '100010', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, progress: 3, startSprint: '2123', endSprint: '2129', team: 'mushu', project: 'puma'},
    {id: '100011', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, progress: 15, startSprint: '2123', endSprint: '2123', team: 'hercules', project: 'tiger'},
    {id: '100012', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, progress: 5, startSprint: '2123', endSprint: '2123', team: 'hades', project: 'puma'},
    {id: '100013', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, progress: 0, startSprint: '2133', endSprint: '2143', team: 'hades', project: 'voip'},
    {id: '100014', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, progress: 3, startSprint: '2135', endSprint: 'IP 21.3', team: 'mushu', project: 'puma'},
    {id: '100015', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, progress: 15, startSprint: '2137', endSprint: '2143', team: 'hercules', project: 'tiger'},
    {id: '100016', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, progress: 5, startSprint: '2133', endSprint: '2133', team: 'hades', project: 'puma'},
    {id: '100017', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, progress: 0, startSprint: '2135', endSprint: '2139', team: 'hades', project: 'voip'},
    {id: '100018', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, progress: 15, startSprint: '2135', endSprint: 'IP 21.3', team: 'mushu', project: 'puma'},
    {id: '100019', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, progress: 15, startSprint: '2141', endSprint: '2143', team: 'hercules', project: 'tiger'},
    {id: '100020', name: 'this is a feature for testing', pi: 'PI 21.1', size: 10, progress: 5, startSprint: '2109', endSprint: '2115', team: 'pegasus', project: 'puma'},
    {id: '100021', name: 'this is a feature for testing', pi: 'PI 21.1', size: 2, progress: 0, startSprint: '2111', endSprint: '2117', team: 'pegasus', project: 'voip'},
    {id: '100022', name: 'this is a feature for testing', pi: 'PI 21.1', size: 15, progress: 10, startSprint: '2117', endSprint: 'IP 21.1', team: 'mushu', project: 'puma'},
    {id: '100023', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, progress: 15, startSprint: '2125', endSprint: '2129', team: 'hercules', project: 'tiger'},
    {id: '100024', name: 'this is a feature for testing', pi: 'PI 21.2', size: 10, progress: 5, startSprint: '2125', endSprint: '2125', team: 'pegasus', project: 'puma'},
    {id: '100025', name: 'this is a feature for testing', pi: 'PI 21.2', size: 2, progress: 2, startSprint: 'IP 21.2', endSprint: 'IP 21.2', team: 'pegasus', project: 'voip'},
    {id: '100026', name: 'this is a feature for testing', pi: 'PI 21.2', size: 15, progress: 3, startSprint: '2127', endSprint: 'IP 21.2', team: 'mushu', project: 'puma'},
    {id: '100027', name: 'this is a feature for testing', pi: 'PI 21.2', size: 30, progress: 15, startSprint: '2125', endSprint: '2129', team: 'hercules', project: 'tiger'},
    {id: '100028', name: 'this is a feature for testing', pi: 'PI 21.3', size: 10, progress: 5, startSprint: '2141', endSprint: '2143', team: 'hercules', project: 'bobcat'},
    {id: '100029', name: 'this is a feature for testing', pi: 'PI 21.3', size: 2, progress: 0, startSprint: '2133', endSprint: '2133', team: 'hercules', project: 'voip'},
    {id: '100030', name: 'this is a feature for testing', pi: 'PI 21.3', size: 15, progress: 3, startSprint: '2133', endSprint: 'IP 21.3', team: 'mushu', project: 'bobcat'},
    {id: '100031', name: 'this is a feature for testing', pi: 'PI 21.3', size: 30, progress: 15, startSprint: '2143', endSprint: 'IP 21.3', team: 'hercules', project: 'tiger'},
    {id: '100032', name: 'this is a feature for testing', pi: 'PI 21.4', size: 10, progress: 5, startSprint: '2147', endSprint: '2149', team: 'hercules', project: 'bobcat'},
    {id: '100033', name: 'this is a feature for testing', pi: 'PI 21.4', size: 2, progress: 0, startSprint: '2149', endSprint: '2151', team: 'pegasus', project: 'voip'},
    {id: '100034', name: 'this is a feature for testing', pi: 'PI 21.4', size: 15, progress: 3, startSprint: '2151', endSprint: 'IP 21.4', team: 'mushu', project: 'bobcat'},
    {id: '100035', name: 'this is a feature for testing', pi: 'PI 21.4', size: 30, progress: 30, startSprint: '2151', endSprint: '2201', team: 'hercules', project: 'tiger'}
  ].forEach(feature => Collections.FeaturesCollection.insert(feature));
}

function populateIterationsCollection() { 
  [
    {pi: 'PI 21.1', sprint: '2109'},
    {pi: 'PI 21.1', sprint: '2111'},
    {pi: 'PI 21.1', sprint: '2113'},
    {pi: 'PI 21.1', sprint: '2115'},
    {pi: 'PI 21.1', sprint: '2117'},
    {pi: 'PI 21.1', sprint: '2119'},
    {pi: 'PI 21.1', sprint: 'IP 21.1'},
    {pi: 'PI 21.2', sprint: '2123'},
    {pi: 'PI 21.2', sprint: '2125'},
    {pi: 'PI 21.2', sprint: '2127'},
    {pi: 'PI 21.2', sprint: '2129'},
    {pi: 'PI 21.2', sprint: 'IP 21.2'},
    {pi: 'PI 21.3', sprint: '2133'},
    {pi: 'PI 21.3', sprint: '2135'},
    {pi: 'PI 21.3', sprint: '2137'},
    {pi: 'PI 21.3', sprint: '2139'},
    {pi: 'PI 21.3', sprint: '2141'},
    {pi: 'PI 21.3', sprint: '2143'},
    {pi: 'PI 21.3', sprint: 'IP 21.3'},
    // {pi: 'PI 21.4', sprint: '2147'},
    // {pi: 'PI 21.4', sprint: '2149'},
    // {pi: 'PI 21.4', sprint: '2151'},
    // {pi: 'PI 21.4', sprint: '2201'},
    // {pi: 'PI 21.4', sprint: '2203'},
    // {pi: 'PI 21.4', sprint: '2205'},
    // {pi: 'PI 21.4', sprint: 'IP 21.4'}
  ].forEach(iteration => Collections.IterationsCollection.insert(iteration));
}

function populateTeamsCollection() { 
  [
    {name: 'pegasus'},
    {name: 'mushu'},
    {name: 'hades'},
    {name: 'hercules'}
  ].forEach(team => Collections.TeamsCollection.insert(team));
}

function populateProjectsCollection() { 
  [
    {name: 'tiger'},
    {name: 'puma'},
    {name: 'voip'},
    {name: 'bobcat'}
  ].forEach(project => Collections.ProjectsCollection.insert(project));
}

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
    {key: ServerStatus.ADS_SYNC_STATUS, value: SyncStatus.NONE},
    {key: ServerStatus.ADS_SYNC_DATE, value: ''},
    {key: ServerStatus.ADS_COMPARE_SYNC_DATE, value: ''},
    {key: ServerStatus.ADS_COMPARE_DATE, value: ''}
  ].forEach(status => Collections.ServerStatusCollection.insert(status));
}

export function PopulateCollections() {    
  if (Collections.AllocationsCollection.find().count() === 0) { populateAllocationsCollection(); }
  if (Collections.VelocitiesCollection.find().count() === 0) { populateVelocitiesCollection(); }
  if (Collections.ServerStatusCollection.find().count() === 0) { populateServerStatusCollection(); }

  // these collections are now populated from ADS
  if (Collections.FeaturesCollection.find().count() === 0) { populateFeaturesCollection(); }
  if (Collections.IterationsCollection.find().count() === 0) { populateIterationsCollection(); }
  if (Collections.TeamsCollection.find().count() === 0) { populateTeamsCollection(); }
  if (Collections.ProjectsCollection.find().count() === 0) { populateProjectsCollection();}
  if (Collections.OrgFeaturesCollection.find().count() === 0) { populateOrgFeaturesCollection(); }  
}