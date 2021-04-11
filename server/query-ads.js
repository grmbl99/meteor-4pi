import * as vsoNodeApi from 'azure-devops-node-api';
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';
import { ADSFields, ADSConfig, NOT_SET, ReturnStatus} from '/imports/api/Consts.jsx';

async function getTeamsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/areas/systems/portfolio%20fixed/solution/art%20imaging%20chain?$depth=1
    const queryResult = await witAPI.getClassificationNode(ADSConfig.PROJECT, 'areas', ADSConfig.AREA_OFFSET,1);

    for (const team of queryResult.children) {
      TeamsCollection.insert({teamname: team.name});
    }
  } catch(e) {
    console.log('Error in getTeamsFromADS');
    throw(e);
  }
  return(ReturnStatus.OK);
}

async function getSprintsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/iterations/systems/safe%20fixed?$depth=2
    const queryResult = await witAPI.getClassificationNode(ADSConfig.PROJECT, 'iterations', ADSConfig.ITERATION_OFFSET,2);

    let i=0;
    for (const pi of queryResult.children) {
      if (pi.hasChildren) {
        for (const sprint of pi.children) {
          const startdate = new Date(sprint.attributes.startDate);
          SprintsCollection.insert({pi: pi.name, sprintnr: i++, sprintname: sprint.name, startdate: startdate});
        }
      }
    }
  } catch(e) {
    console.log('Error in getSprintsFromADS');
    throw(e);
  }
  return(ReturnStatus.OK);
}

async function getFeatureFromADS(witAPI,id) {
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
      id: id, name: name, pi: pi, size: size, done: 0, 
      startsprintnr: 9999, endsprintnr: NOT_SET, 
      team: teamname, project: projectname
    });

    ProjectsCollection.upsert({projectname: projectname}, { $set: {projectname: projectname}});
    TeamsCollection.upsert({teamname: teamname}, { $set: {teamname: teamname}});
  } catch(e) {
    console.log('Error in getFeatureFromADS');
    throw(e);
  }
  return(ReturnStatus.OK);
}

async function getStoryFromADS(witAPI,storyId,featureId) {
  try {
    const queryResult = await witAPI.getWorkItem(storyId,[ADSFields.ITERATION_PATH, ADSFields.EFFORT, ADSFields.STATE]);

    const state=queryResult.fields[ADSFields.STATE];
    const effort=queryResult.fields[ADSFields.EFFORT];
    const parts=queryResult.fields[ADSFields.ITERATION_PATH].split('\\');

    if (effort>0) {
      if (state===ADSFields.DONE) {
        FeaturesCollection.update({id: featureId},{ $inc: { done: effort }});
      } else {
        // FeaturesCollection.update({id: featureId},{ $inc: {size: effort }});
      }
    }

    const sprintname = parts.length>4 ? parts[4] : 'undefined';
    const sprint = SprintsCollection.findOne({sprintname: sprintname});

    if (sprint) {
      FeaturesCollection.update(
        {id: featureId, startsprintnr: { $gt: sprint.sprintnr} },
        {$set: { startsprintnr: sprint.sprintnr, startsprint: sprintname }}
      );
      FeaturesCollection.update(
        {id: featureId, endsprintnr: { $lt: sprint.sprintnr} },
        {$set: { endsprintnr: sprint.sprintnr, endsprint: sprintname }}
      );
    }
  } catch(e) {
    console.log('Error in getStoryFromADS');
    throw(e);
  }
  return(ReturnStatus.OK);
}

async function getStoriesFromADS(witAPI, pis) {
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
          )
      ORDER BY [System.IterationId],
          [System.Id]
      MODE (MustContain)`
    };

    const teamContext = { project: ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);  

    let p = [];
    for (const workitemlink of queryResult.workItemRelations) {
      if (workitemlink.rel==='System.LinkTypes.Hierarchy-Forward') {
        p.push(getStoryFromADS(witAPI,workitemlink.target.id,workitemlink.source.id));
      }
    }
    await Promise.all(p);

  } catch(e) {
    console.log('Error in getStoriesFromADS');
    throw(e);
  }
  return(ReturnStatus.OK);
}

async function getFeaturesFromADS(witAPI, pis) {
  try {
    let piSubQuery='';
    for (const [i,pi] of pis.entries()) {
      piSubQuery+=`[System.IterationPath] UNDER '${ADSConfig.PROJECT}${ADSConfig.ITERATION_OFFSET_WIQL}\\${pi}' ${i!==pis.length-1 ? 'OR ' : ''}`;
    }

    const query = {query: 
      `
      SELECT
          [System.Id]
      FROM workitems
      WHERE
          [System.TeamProject] = @project
          AND [System.WorkItemType] = 'Feature'
          AND [System.AreaPath] UNDER '${ADSConfig.PROJECT}${ADSConfig.AREA_OFFSET_WIQL}'
          AND (${piSubQuery})`
    };

    const teamContext = { project: ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);  

    let p = [];
    for (const workitem of queryResult.workItems) {
      p.push(getFeatureFromADS(witAPI,workitem.id));
    }
    await Promise.all(p);

  } catch(e) {
    console.log('Error in getFeaturesFromADS');
    throw(e);
  }
  return(ReturnStatus.OK);
}

export async function queryADS() {
  const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(ADSConfig.TOKEN); 
  const connection = new vsoNodeApi.WebApi(ADSConfig.URL, authHandler);  
  const witAPI = await connection.getWorkItemTrackingApi();

  const pis=['PI 21.1','PI 21.2','PI 21.3','PI 21.4'];

  console.log('getting sprints');
  await getSprintsFromADS(witAPI);
  //await getTeamsFromADS(witAPI);

  console.log('getting features');
  await getFeaturesFromADS(witAPI, pis);

  console.log('getting stories');
  await getStoriesFromADS(witAPI, pis);

  return(ReturnStatus.OK);
}