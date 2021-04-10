import * as vsoNodeApi from 'azure-devops-node-api';
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';
import { ADSFields, ADSConfig } from '/imports/api/Consts.jsx';

async function getTeamsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/areas/systems/portfolio%20fixed/solution/art%20imaging%20chain?$depth=1
    const queryResult = await witAPI.getClassificationNode(ADSConfig.PROJECT, 'areas', ADSConfig.AREA_OFFSET,1);

    for (const team of queryResult.children) {
      TeamsCollection.insert({teamname: team.name});
    }  
  } catch(e) {
    console.log('error getting teams from ADS: ' + e);
  }
}

async function getSprintsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/iterations/systems/safe%20fixed?$depth=2
    const queryResult = await witAPI.getClassificationNode(ADSConfig.PROJECT, 'iterations', ADSConfig.ITERATION_OFFSET,2);

    for (const pi of queryResult.children) {
      if (pi.hasChildren) {
        for (const sprint of pi.children) {
          const startdate = new Date(sprint.attributes.startDate);
          SprintsCollection.insert({pi: pi.name, sprintname: sprint.name, startdate: startdate});
        }
      }
    }
  } catch(e) {
    console.log('error getting sprints from ADS: ' + e);
  }
}

async function getWorkItemFromADS(witAPI,id) {
  try {
    const queryResult = await witAPI.getWorkItem(id,[
      ADSFields.TITLE, ADSFields.NODENAME, ADSFields.ITERATION_PATH, 
      ADSFields.EFFORT, ADSFields.RELEASE]);

    let pi=queryResult.fields[ADSFields.ITERATION_PATH];
    let projectname=queryResult.fields[ADSFields.RELEASE];
    let teamname=queryResult.fields[ADSFields.NODENAME];
    const name=queryResult.fields[ADSFields.TITLE];
    const size=queryResult.fields[ADSFields.EFFORT];

    pi = pi ? pi.split('\\')[3] : 'undefined';
    projectname = projectname ? projectname.toLowerCase() : 'undefined';
    teamname = teamname ? teamname.toLowerCase() : 'undefined';

    FeaturesCollection.insert({
      id: id, name: name, pi: pi, size: size, done: 1, 
      startsprint: '2151', endsprint: '2201', 
      team: teamname, project: projectname
    });

    ProjectsCollection.upsert({projectname: projectname}, { $set: {projectname: projectname}});
    TeamsCollection.upsert({teamname: teamname}, { $set: {teamname: teamname}});
  } catch(e) {
    console.log('error getting workitem from ADS: ' +e);
  }
}

async function getWorkItemsFromADS(witAPI, pis) {
  try {
    let piSubQuery='';
    for (const [i,pi] of pis.entries()) {
      piSubQuery+=`[Source].[System.IterationPath] UNDER '${ADSConfig.PROJECT}${ADSConfig.ITERATION_OFFSET_WIQL}\\${pi}' ${i!==pis.length-1 ? 'OR ' : ''}`;
    }

    const query = {query: 
      `
      SELECT
          [System.Id]
      FROM workitemLinks
      WHERE
          (
              [Source].[System.TeamProject] = @project
              AND [Source].[System.WorkItemType] = 'Feature'
              AND [Source].[System.AreaPath] UNDER '${ADSConfig.PROJECT}${ADSConfig.AREA_OFFSET_WIQL}'
              AND (${piSubQuery})
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

    const teamContext = { project: ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);  

    for (const workitemlink of queryResult.workItemRelations) {
      if (workitemlink.rel==='System.LinkTypes.Hierarchy-Forward') {
        // console.log(workitemlink.source.id, ' -> ', workitemlink.target.id);
      } else {
        getWorkItemFromADS(witAPI,workitemlink.target.id);
      }
    }
  } catch(e) {
    console.log('error getting workitems from ADS: ' + e);
  }
}

export async function queryADS() {
  const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(ADSConfig.TOKEN); 
  const connection = new vsoNodeApi.WebApi(ADSConfig.URL, authHandler);
  
  try {
    const witAPI = await connection.getWorkItemTrackingApi();

    getSprintsFromADS(witAPI);
    //getTeamsFromADS(witAPI);

    const pis=['PI 21.1','PI 21.2','PI 21.3','PI 21.4'];
    getWorkItemsFromADS(witAPI, pis);  

  } catch(e) {
    console.log('error reading from ADS: ' + e);
  }
}