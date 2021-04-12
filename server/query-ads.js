import * as vsoNodeApi from 'azure-devops-node-api';
import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';

async function getTeamsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/areas/systems/portfolio%20fixed/solution/art%20imaging%20chain?$depth=1
    const queryResult = await witAPI.getClassificationNode(Constants.ADSConfig.PROJECT, 'areas', Constants.ADSConfig.AREA_OFFSET,1);

    for (const team of queryResult.children) {
      Collections.TeamsCollection.insert({teamName: team.name});
    }
  } catch(e) {
    console.log('Error in getTeamsFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getSprintsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/iterations/systems/safe%20fixed?$depth=2
    const queryResult = await witAPI.getClassificationNode(Constants.ADSConfig.PROJECT, 'iterations', Constants.ADSConfig.ITERATION_OFFSET,2);

    let i=0;
    for (const pi of queryResult.children) {
      if (pi.hasChildren) {
        for (const sprint of pi.children) {
          const startDate = new Date(sprint.attributes.startDate);
          Collections.SprintsCollection.insert({pi: pi.name, sprintNr: i++, sprintName: sprint.name, startDate: startDate});
        }
      }
    }
  } catch(e) {
    console.log('Error in getSprintsFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getFeatureFromADS(witAPI,id) {
  try {
    const queryResult = await witAPI.getWorkItem(id,[
      Constants.ADSFields.TITLE, Constants.ADSFields.NODENAME, Constants.ADSFields.ITERATION_PATH, 
      Constants.ADSFields.EFFORT, Constants.ADSFields.RELEASE]);

    let pi=queryResult.fields[Constants.ADSFields.ITERATION_PATH];
    let projectName=queryResult.fields[Constants.ADSFields.RELEASE];
    let teamName=queryResult.fields[Constants.ADSFields.NODENAME];
    const name=queryResult.fields[Constants.ADSFields.TITLE];
    const size=queryResult.fields[Constants.ADSFields.EFFORT];

    pi = pi ? pi.split('\\')[3] : 'undefined';
    projectName = projectName ? projectName.toLowerCase() : 'undefined';
    teamName = teamName ? teamName.toLowerCase() : 'undefined';

    Collections.FeaturesCollection.insert({
      id: id, name: name, pi: pi, size: size, done: 0, 
      startSprintNr: 9999, endSprintNr: Constants.NOT_SET, 
      team: teamName, project: projectName
    });

    Collections.ProjectsCollection.upsert({projectName: projectName}, { $set: {projectName: projectName}});
    Collections.TeamsCollection.upsert({teamName: teamName}, { $set: {teamName: teamName}});
  } catch(e) {
    console.log('Error in getFeatureFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getStoryFromADS(witAPI,storyId,featureId) {
  try {
    const queryResult = await witAPI.getWorkItem(storyId,[Constants.ADSFields.ITERATION_PATH, Constants.ADSFields.EFFORT, Constants.ADSFields.STATE]);

    const state=queryResult.fields[Constants.ADSFields.STATE];
    const effort=queryResult.fields[Constants.ADSFields.EFFORT];
    const parts=queryResult.fields[Constants.ADSFields.ITERATION_PATH].split('\\');

    if (effort>0) {
      if (state===Constants.ADSFields.DONE) {
        Collections.FeaturesCollection.update({id: featureId},{ $inc: { done: effort }});
      } else {
        // FeaturesCollection.update({id: featureId},{ $inc: {size: effort }});
      }
    }

    const sprintName = parts.length>4 ? parts[4] : 'undefined';
    const sprint = Collections.SprintsCollection.findOne({sprintName: sprintName});

    if (sprint) {
      Collections.FeaturesCollection.update(
        {id: featureId, startSprintNr: { $gt: sprint.sprintNr} },
        {$set: { startSprintNr: sprint.sprintNr, startSprint: sprintName }}
      );
      Collections.FeaturesCollection.update(
        {id: featureId, endSprintNr: { $lt: sprint.sprintNr} },
        {$set: { endSprintNr: sprint.sprintNr, endSprint: sprintName }}
      );
    }
  } catch(e) {
    console.log('Error in getStoryFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getStoriesFromADS(witAPI, pis) {
  try {
    let piSubQuery='';
    for (const [i,pi] of pis.entries()) {
      piSubQuery+=`[Source].[System.IterationPath] UNDER '${Constants.ADSConfig.PROJECT}${Constants.ADSConfig.ITERATION_OFFSET_WIQL}\\${pi}' ${i!==pis.length-1 ? 'OR ' : ''}`;
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
              AND [Source].[System.AreaPath] UNDER '${Constants.ADSConfig.PROJECT}${Constants.ADSConfig.AREA_OFFSET_WIQL}'
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

    const teamContext = { project: Constants.ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);  

    let p = [];
    for (const workItemLink of queryResult.workItemRelations) {
      if (workItemLink.rel==='System.LinkTypes.Hierarchy-Forward') {
        p.push(getStoryFromADS(witAPI,workItemLink.target.id,workItemLink.source.id));
      }
    }
    await Promise.all(p);

  } catch(e) {
    console.log('Error in getStoriesFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getFeaturesFromADS(witAPI, pis) {
  try {
    let piSubQuery='';
    for (const [i,pi] of pis.entries()) {
      piSubQuery+=`[System.IterationPath] UNDER '${Constants.ADSConfig.PROJECT}${Constants.ADSConfig.ITERATION_OFFSET_WIQL}\\${pi}' ${i!==pis.length-1 ? 'OR ' : ''}`;
    }

    const query = {query: 
      `
      SELECT
          [System.Id]
      FROM workitems
      WHERE
          [System.TeamProject] = @project
          AND [System.WorkItemType] = 'Feature'
          AND [System.AreaPath] UNDER '${Constants.ADSConfig.PROJECT}${Constants.ADSConfig.AREA_OFFSET_WIQL}'
          AND (${piSubQuery})`
    };

    const teamContext = { project: Constants.ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);  

    let p = [];
    for (const workItem of queryResult.workItems) {
      p.push(getFeatureFromADS(witAPI,workItem.id));
    }
    await Promise.all(p);

  } catch(e) {
    console.log('Error in getFeaturesFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

export async function QueryADS() {
  const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(Constants.ADSConfig.TOKEN); 
  const connection = new vsoNodeApi.WebApi(Constants.ADSConfig.URL, authHandler);  
  const witAPI = await connection.getWorkItemTrackingApi();

  const pis=['PI 21.1','PI 21.2','PI 21.3','PI 21.4'];

  console.log('getting sprints');
  await getSprintsFromADS(witAPI);
  //await getTeamsFromADS(witAPI);

  console.log('getting features');
  await getFeaturesFromADS(witAPI, pis);

  console.log('getting stories');
  await getStoriesFromADS(witAPI, pis);

  return(Constants.ReturnStatus.OK);
}