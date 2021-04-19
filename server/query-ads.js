import * as vsoNodeApi from 'azure-devops-node-api';
import * as Collections from '/imports/api/collections';
import * as Constants from '/imports/api/constants';
import { format } from 'date-fns';

/*
async function getTeamsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/areas/systems/portfolio%20fixed/solution/art%20imaging%20chain?$depth=1
    const queryResult = await witAPI.getClassificationNode(Constants.ADSConfig.PROJECT, 'areas', Constants.ADSConfig.AREA_OFFSET,1);

    for (const team of queryResult.children) {
      Collections.TeamsCollection.insert({name: team.name});
    }
  } catch(e) {
    console.log('Error in getTeamsFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}
*/

async function getIterationsFromADS(witAPI) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/iterations/systems/safe%20fixed?$depth=2
    const queryResult = await witAPI.getClassificationNode(Constants.ADSConfig.PROJECT, 'iterations', Constants.ADSConfig.ITERATION_OFFSET,2);

    let i=0;
    for (const pi of queryResult.children) {
      if (pi.hasChildren) {
        for (const sprint of pi.children) {
          const startDate = new Date(sprint.attributes.startDate);
          Collections.IterationsCollection.insert({pi: pi.name, sprint: i++, sprintName: sprint.name, startDate: startDate});
        }
      }
    }
  } catch(e) {
    console.log('Error in getIterationsFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getFeatureFromADS(witAPI,id,asOfDate) {
  try {
    const queryResult = await witAPI.getWorkItem(id,[
      Constants.ADSFields.TITLE, Constants.ADSFields.NODENAME, Constants.ADSFields.ITERATION_PATH,
      Constants.ADSFields.STATE, Constants.ADSFields.TAGS, Constants.ADSFields.PRIORITY,
      Constants.ADSFields.EFFORT, Constants.ADSFields.RELEASE],asOfDate);

    let projectName=queryResult.fields[Constants.ADSFields.RELEASE];
    let teamName=queryResult.fields[Constants.ADSFields.NODENAME];
    const parts=queryResult.fields[Constants.ADSFields.ITERATION_PATH].split('\\');
    const name=queryResult.fields[Constants.ADSFields.TITLE];
    const size=queryResult.fields[Constants.ADSFields.EFFORT];
    const state=queryResult.fields[Constants.ADSFields.STATE];
    const tags=queryResult.fields[Constants.ADSFields.TAGS];
    const priority=queryResult.fields[Constants.ADSFields.PRIORITY];

    projectName = projectName ? projectName.toLowerCase() : 'undefined';
    teamName = teamName ? teamName.toLowerCase() : 'undefined';

    const pi = parts.length>3 ? parts[3] : 'undefined';
    const sprintName = parts.length>4 ? parts[4] : 'undefined';

    const iteration = Collections.IterationsCollection.findOne({sprintName: sprintName});
    const sprint = iteration ? iteration.sprint : Constants.NOT_SET;

    const collection = asOfDate ? Collections.OrgFeaturesCollection : Collections.FeaturesCollection;
    collection.insert({
      id: id, name: name, pi: pi, featureSize: size ? size : 0, progress: 0, 
      startSprint: Constants.START_SPRINT_NOT_SET, endSprint: Constants.NOT_SET, 
      team: teamName, project: projectName, featureEndSprint: sprint, featureEndSprintName: sprintName,
      size: 0, state: state, tags: tags, priority: priority
    });

    Collections.ProjectsCollection.upsert({name: projectName}, { $set: {name: projectName}});
    Collections.TeamsCollection.upsert({name: teamName}, { $set: {name: teamName}});
  } catch(e) {
    console.log('Error in getFeatureFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getStoryFromADS(witAPI,storyId,featureId,asOfDate) {
  try {
    const queryResult = await witAPI.getWorkItem(storyId,[
      Constants.ADSFields.ITERATION_PATH, Constants.ADSFields.EFFORT, Constants.ADSFields.STATE],asOfDate);

    const state=queryResult.fields[Constants.ADSFields.STATE];
    const effort=queryResult.fields[Constants.ADSFields.EFFORT];
    const parts=queryResult.fields[Constants.ADSFields.ITERATION_PATH].split('\\');

    const collection = asOfDate ? Collections.OrgFeaturesCollection : Collections.FeaturesCollection;

    if (effort>0) {
      // adds storypoints to size
      collection.update({id: featureId},{ $inc: { size: effort }});

      if (state===Constants.ADSFields.DONE) {
        // adds storypoints for 'done' stories
        collection.update({id: featureId},{ $inc: { progress: effort }});
      }
    }

    const sprintName = parts.length>4 ? parts[4] : 'undefined';
    const iteration = Collections.IterationsCollection.findOne({sprintName: sprintName});

    // set startSprint/endSprint in feature to first and last sprint of child stories
    if (iteration) {
      collection.update(
        {id: featureId, startSprint: { $gt: iteration.sprint} },
        {$set: { startSprint: iteration.sprint, startSprintName: sprintName }}
      );
      collection.update(
        {id: featureId, endSprint: { $lt: iteration.sprint} },
        {$set: { endSprint: iteration.sprint, endSprintName: sprintName }}
      );
    }
  } catch(e) {
    console.log('Error in getStoryFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getStoriesFromADS(witAPI, pis, asOfDate) {
  try {
    let piSubQuery='';
    for (const [i,pi] of pis.entries()) {
      piSubQuery+=`[Source].[System.IterationPath] UNDER '${Constants.ADSConfig.PROJECT}${Constants.ADSConfig.ITERATION_OFFSET_WIQL}\\${pi}' ${i!==pis.length-1 ? 'OR ' : ''}`;
    }
    const asOfSubQuery=asOfDate ? `ASOF '${asOfDate}'` : '';

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
              AND [Source].[System.State] <> 'Removed'
          )
          AND (
              [Target].[System.TeamProject] = @project
              AND [Target].[System.WorkItemType] = 'Story'
              AND NOT [Target].[System.Tags] CONTAINS 'refinementStory'
              AND [Target].[System.State] <> 'Removed'
          )
      ORDER BY [System.IterationId],
          [System.Id]
      ${asOfSubQuery}
      MODE (MayContain)`
    };

    const teamContext = { project: Constants.ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);  

    // the ADS query just returns workitem id's
    // get the actual workitem content in parallel (async), wait for all to finish before continueing
    let p = [];
    for (const workItemLink of queryResult.workItemRelations) {
      if (workItemLink.rel==='System.LinkTypes.Hierarchy-Forward') {
        p.push(getStoryFromADS(witAPI,workItemLink.target.id,workItemLink.source.id,asOfDate));
      }
    }
    await Promise.all(p);

  } catch(e) {
    console.log('Error in getStoriesFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

async function getFeaturesFromADS(witAPI, pis, asOfDate) {
  try {
    let piSubQuery='';
    for (const [i,pi] of pis.entries()) {
      piSubQuery+=`[System.IterationPath] UNDER '${Constants.ADSConfig.PROJECT}${Constants.ADSConfig.ITERATION_OFFSET_WIQL}\\${pi}' ${i!==pis.length-1 ? 'OR ' : ''}`;
    }
    const asOfSubQuery=asOfDate ? `ASOF '${asOfDate}'` : '';

    const query = {query: 
      `
      SELECT
          [System.Id]
      FROM workitems
      WHERE
          [System.TeamProject] = @project
          AND [System.WorkItemType] = 'Feature'
          AND [System.AreaPath] UNDER '${Constants.ADSConfig.PROJECT}${Constants.ADSConfig.AREA_OFFSET_WIQL}'
          AND (${piSubQuery})
          AND [System.State] <> 'Removed'
      ${asOfSubQuery}`
    };

    const teamContext = { project: Constants.ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);  

    // the ADS query just returns workitem id's
    // get the actual workitem content in parallel (async), wait for all to finish before continueing
    let p = [];
    for (const workItem of queryResult.workItems) {
      p.push(getFeatureFromADS(witAPI,workItem.id,asOfDate));
    }
    await Promise.all(p);

  } catch(e) {
    console.log('Error in getFeaturesFromADS');
    throw(e);
  }
  return(Constants.ReturnStatus.OK);
}

export async function QueryADS(date) {
  const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(Constants.ADSConfig.TOKEN); 
  const connection = new vsoNodeApi.WebApi(Constants.ADSConfig.URL, authHandler);  
  const witAPI = await connection.getWorkItemTrackingApi();

  const pis=['PI 21.1','PI 21.2','PI 21.3','PI 21.4'];
  const asOfDate = date ? format(date, 'MM/dd/yyyy') : '';

  // no need to get the iterations on every as-of query
  if (!asOfDate) {
    console.log('getting sprints');
    await getIterationsFromADS(witAPI);
  }

  console.log('getting features');
  await getFeaturesFromADS(witAPI, pis, asOfDate);

  console.log('getting stories');
  await getStoriesFromADS(witAPI, pis, asOfDate);

  return(Constants.ReturnStatus.OK);
}
