import * as vsoNodeApi from 'azure-devops-node-api';
import * as Collections from '/imports/api/collections';
import { ADSFields, ADSConfig, ReturnStatus, NOT_SET, START_SPRINT_NOT_SET } from '/imports/api/constants';
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
    const queryResult = await witAPI.getClassificationNode(
      ADSConfig.PROJECT,
      'iterations',
      ADSConfig.ITERATION_OFFSET,
      2
    );

    let i = 0;
    for (const pi of queryResult.children) {
      if (pi.hasChildren) {
        for (const sprint of pi.children) {
          const startDate = new Date(sprint.attributes.startDate);
          const finishDate = new Date(sprint.attributes.finishDate);
          Collections.IterationsCollection.insert({
            pi: pi.name,
            sprint: i++,
            sprintName: sprint.name,
            startDate: startDate,
            finishDate: finishDate
          });
        }
      }
    }
  } catch (e) {
    console.log('Error in getIterationsFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getFeatureFromADS(witAPI, id, asOfDate) {
  try {
    const queryResult = await witAPI.getWorkItem(
      id,
      [
        ADSFields.TITLE,
        ADSFields.NODENAME,
        ADSFields.ITERATION_PATH,
        ADSFields.STATE,
        ADSFields.TAGS,
        ADSFields.PRIORITY,
        ADSFields.EFFORT,
        ADSFields.RELEASE
      ],
      asOfDate
    );

    let projectName = queryResult.fields[ADSFields.RELEASE];
    let teamName = queryResult.fields[ADSFields.NODENAME];
    const parts = queryResult.fields[ADSFields.ITERATION_PATH].split('\\');
    const name = queryResult.fields[ADSFields.TITLE];
    const size = queryResult.fields[ADSFields.EFFORT];
    const state = queryResult.fields[ADSFields.STATE];
    const tags = queryResult.fields[ADSFields.TAGS];
    const priority = queryResult.fields[ADSFields.PRIORITY];

    projectName = projectName ? projectName.toLowerCase() : 'undefined';
    teamName = teamName ? teamName.toLowerCase() : 'undefined';

    const pi = parts.length > 3 ? parts[3] : 'undefined';
    const sprintName = parts.length > 4 ? parts[4] : 'undefined';

    const iteration = Collections.IterationsCollection.findOne({
      sprintName: sprintName
    });
    const sprint = iteration ? iteration.sprint : NOT_SET;

    const collection = asOfDate ? Collections.OrgFeaturesCollection : Collections.FeaturesCollection;
    collection.insert({
      id: id,
      name: name,
      pi: pi,
      featureSize: size ? size : 0,
      progress: 0,
      startSprint: START_SPRINT_NOT_SET,
      endSprint: NOT_SET,
      team: teamName,
      project: projectName,
      featureEndSprint: sprint,
      featureEndSprintName: sprintName,
      size: 0,
      state: state,
      tags: tags,
      priority: priority
    });

    Collections.ProjectsCollection.upsert({ name: projectName }, { $set: { name: projectName } });
    Collections.TeamsCollection.upsert({ name: teamName }, { $set: { name: teamName } });
  } catch (e) {
    console.log('Error in getFeatureFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getStoryFromADS(witAPI, storyId, featureId, asOfDate, pis) {
  try {
    const queryResult = await witAPI.getWorkItem(
      storyId,
      [ADSFields.ITERATION_PATH, ADSFields.EFFORT, ADSFields.STATE],
      asOfDate
    );

    const state = queryResult.fields[ADSFields.STATE];
    const effort = queryResult.fields[ADSFields.EFFORT];
    const parts = queryResult.fields[ADSFields.ITERATION_PATH].split('\\');

    const pi = parts.length > 3 ? parts[3] : 'undefined';

    // only include stories in our current pi scope
    if (pis.includes(pi)) {
      const collection = asOfDate ? Collections.OrgFeaturesCollection : Collections.FeaturesCollection;

      if (effort > 0) {
        // adds storypoints to size
        collection.update({ id: featureId }, { $inc: { size: effort } });

        if (state === ADSFields.DONE) {
          // adds storypoints for 'done' stories
          collection.update({ id: featureId }, { $inc: { progress: effort } });
        }
      }

      const sprintName = parts.length > 4 ? parts[4] : 'undefined';
      const iteration = Collections.IterationsCollection.findOne({
        sprintName: sprintName
      });

      // set startSprint/endSprint in feature to first and last sprint of child stories
      if (iteration) {
        collection.update(
          { id: featureId, startSprint: { $gt: iteration.sprint } },
          { $set: { startSprint: iteration.sprint, startSprintName: sprintName } }
        );
        collection.update(
          { id: featureId, endSprint: { $lt: iteration.sprint } },
          { $set: { endSprint: iteration.sprint, endSprintName: sprintName } }
        );
      }
    }
  } catch (e) {
    console.log('Error in getStoryFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getStoriesFromADS(witAPI, pis, asOfDate) {
  try {
    let piSubQuery = '';
    for (const [i, pi] of pis.entries()) {
      piSubQuery += `[Source].[System.IterationPath] UNDER '${ADSConfig.PROJECT}${
        ADSConfig.ITERATION_OFFSET_WIQL
      }\\${pi}' ${i !== pis.length - 1 ? 'OR ' : ''}`;
    }
    const asOfSubQuery = asOfDate ? `ASOF '${asOfDate}'` : '';

    const query = {
      query: `
      SELECT
          [System.Id]
      FROM workitemLinks
      WHERE
          (
              [Source].[System.TeamProject] = @project
              AND [Source].[System.WorkItemType] = 'Feature'
              AND [Source].[System.AreaPath] UNDER '${ADSConfig.PROJECT}${ADSConfig.AREA_OFFSET_WIQL}'
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

    const teamContext = { project: ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);

    // the ADS query just returns workitem id's
    // get the actual workitem content in parallel (async), wait for all to finish before continueing
    let p = [];
    for (const workItemLink of queryResult.workItemRelations) {
      if (workItemLink.rel === 'System.LinkTypes.Hierarchy-Forward') {
        p.push(getStoryFromADS(witAPI, workItemLink.target.id, workItemLink.source.id, asOfDate, pis));
      }
    }
    await Promise.all(p);
  } catch (e) {
    console.log('Error in getStoriesFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getFeaturesFromADS(witAPI, pis, asOfDate) {
  try {
    let piSubQuery = '';
    for (const [i, pi] of pis.entries()) {
      piSubQuery += `[System.IterationPath] UNDER '${ADSConfig.PROJECT}${ADSConfig.ITERATION_OFFSET_WIQL}\\${pi}' ${
        i !== pis.length - 1 ? 'OR ' : ''
      }`;
    }
    const asOfSubQuery = asOfDate ? `ASOF '${asOfDate}'` : '';

    const query = {
      query: `
      SELECT
          [System.Id]
      FROM workitems
      WHERE
          [System.TeamProject] = @project
          AND [System.WorkItemType] = 'Feature'
          AND [System.AreaPath] UNDER '${ADSConfig.PROJECT}${ADSConfig.AREA_OFFSET_WIQL}'
          AND (${piSubQuery})
          AND [System.State] <> 'Removed'
      ${asOfSubQuery}`
    };

    const teamContext = { project: ADSConfig.PROJECT };
    const queryResult = await witAPI.queryByWiql(query, teamContext);

    // the ADS query just returns workitem id's
    // get the actual workitem content in parallel (async), wait for all to finish before continueing
    let p = [];
    for (const workItem of queryResult.workItems) {
      p.push(getFeatureFromADS(witAPI, workItem.id, asOfDate));
    }
    await Promise.all(p);
  } catch (e) {
    console.log('Error in getFeaturesFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

export async function QueryADS(date) {
  const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(ADSConfig.TOKEN);
  const connection = new vsoNodeApi.WebApi(ADSConfig.URL, authHandler);
  const witAPI = await connection.getWorkItemTrackingApi();

  const pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];
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

  return ReturnStatus.OK;
}
