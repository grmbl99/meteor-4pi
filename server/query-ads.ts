import { Meteor } from 'meteor/meteor';
import { format } from 'date-fns';
import * as vsoNodeApi from 'azure-devops-node-api';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import * as WorkItemTrackingInterfaces from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as Collections from '/imports/api/collections';
import { ADSFields, ADSConfig, ReturnStatus, NOT_SET, START_SPRINT_NOT_SET } from '/imports/api/constants';

async function getIterationsFromADS(witAPI: IWorkItemTrackingApi) {
  try {
    // https://tfsemea1.ta.philips.com/tfs/TPC_Region22/IGT/_apis/wit/classificationnodes/iterations/systems/safe%20fixed?$depth=2
    const queryResult = await witAPI.getClassificationNode(
      Meteor.settings.public.ADSProject,
      WorkItemTrackingInterfaces.TreeStructureGroup.Iterations,
      ADSConfig.ITERATION_OFFSET,
      2
    );

    let i = 0;
    if (queryResult.children) {
      for (const pi of queryResult.children) {
        const startDate = pi.attributes ? new Date(pi.attributes.startDate) : undefined;
        const finishDate = pi.attributes ? new Date(pi.attributes.finishDate) : undefined;
        Collections.IncrementsCollection.insert({
          pi: pi.name || '',
          startDate: startDate,
          finishDate: finishDate
        });

        if (pi.hasChildren && pi.children) {
          for (const sprint of pi.children) {
            const startDate = sprint.attributes ? new Date(sprint.attributes.startDate) : undefined;
            const finishDate = sprint.attributes ? new Date(sprint.attributes.finishDate) : undefined;
            Collections.IterationsCollection.insert({
              pi: pi.name || '',
              sprint: i++,
              sprintName: sprint.name || '',
              startDate: startDate,
              finishDate: finishDate
            });
          }
        }
      }
    }
  } catch (e) {
    console.log('Error in getIterationsFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getVelocityPlanFromADS(witAPI: IWorkItemTrackingApi, pis: string[]) {
  try {
    let piSubQuery = '';
    for (const [i, pi] of pis.entries()) {
      piSubQuery += `[Source].[System.Title] CONTAINS WORDS '${pi}' ${i !== pis.length - 1 ? 'OR ' : ''}`;
    }

    const areaOffsetWIQL = Meteor.settings.public.AreaOffset.split('/').join('\\');

    const query = {
      query: `
      SELECT
          [System.Id]
      FROM workitemLinks
      WHERE
          (
              [Source].[System.TeamProject] = @project
              AND [Source].[System.WorkItemType] = 'Feature'
              AND (${piSubQuery})
              AND [Source].[System.AreaPath] UNDER '${Meteor.settings.public.ADSProject}${areaOffsetWIQL}'
              AND [Source].[System.State] <> 'Removed'
              AND [Source].[Philips.Planning.Release] = 'Velocity Plan'
          )
          AND (
              [Target].[System.TeamProject] = @project
              AND [Target].[System.WorkItemType] = 'Story'
              AND [Target].[System.State] <> 'Removed'
          )
      ORDER BY [System.IterationId],
          [System.Id]
      MODE (MayContain)`
    };

    const teamContext = { project: Meteor.settings.public.ADSProject };
    const queryResult = await witAPI.queryByWiql(query, teamContext);

    // the ADS query just returns workitem id's
    // get the actual workitem content in parallel (async), wait for all to finish before continueing
    if (queryResult.workItemRelations) {
      const p = [];
      for (const workItemLink of queryResult.workItemRelations) {
        // in the returned hierarchy:
        // - the top level (feature) items hold the team velocity
        // - the child (story) items hold the team allocation percentage per project
        if (workItemLink.target && workItemLink.target.id) {
          p.push(getVelocityPlanItemFromADS(witAPI, workItemLink.target.id, pis));
        }
      }
      await Promise.all(p);
    }
  } catch (e) {
    console.log('Error in getVelocityPlanFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getVelocityPlanItemFromADS(witAPI: IWorkItemTrackingApi, id: number, pis: string[]) {
  try {
    const queryResult = await witAPI.getWorkItem(id, [
      ADSFields.TITLE,
      ADSFields.NODENAME,
      ADSFields.EFFORT,
      ADSFields.RELEASE
    ]);

    if (queryResult.fields) {
      let teamName = queryResult.fields[ADSFields.NODENAME];
      let projectName = queryResult.fields[ADSFields.RELEASE];
      const name = queryResult.fields[ADSFields.TITLE];
      const value = queryResult.fields[ADSFields.EFFORT];

      teamName = teamName ? teamName.toLowerCase() : 'undefined';
      projectName = projectName ? projectName.toLowerCase() : 'undefined';

      for (const pi of pis) {
        if (name.includes(pi)) {
          Collections.VelocityPlanCollection.insert({
            team: teamName,
            project: projectName,
            pi: pi,
            // if projectName is a special string as defined in ADSConfig.VELOCITY_PLAN_PROJECT (i.e. 'velocity plan')
            // size contains the team velocity, otherwise size contains the team allocation percentage
            value: value
          });
        }
      }
    }
  } catch (e) {
    console.log('Error in getVelocityPlanItemFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getFeaturesFromADS(witAPI: IWorkItemTrackingApi, pis: string[], asOfDate: Date | undefined) {
  try {
    const areaOffsetWIQL = Meteor.settings.public.AreaOffset.split('/').join('\\');
    const iterationOffsetWIQL = ADSConfig.ITERATION_OFFSET.split('/').join('\\');

    let piSubQuery = '';
    for (const [i, pi] of pis.entries()) {
      piSubQuery += `[System.IterationPath] UNDER '${Meteor.settings.public.ADSProject}${iterationOffsetWIQL}\\${pi}' ${
        i !== pis.length - 1 ? 'OR ' : ''
      }`;
    }
    const asOfSubQuery = asOfDate ? `ASOF '${format(asOfDate, 'MM/dd/yyyy')}'` : '';

    const query = {
      query: `
      SELECT
          [System.Id]
      FROM workitems
      WHERE
          [System.TeamProject] = @project
          AND [System.WorkItemType] = 'Feature'
          AND [System.AreaPath] UNDER '${Meteor.settings.public.ADSProject}${areaOffsetWIQL}'
          AND (${piSubQuery})
          AND [System.State] <> 'Removed'
      ${asOfSubQuery}`
    };

    const teamContext = { project: Meteor.settings.public.ADSProject };
    const queryResult = await witAPI.queryByWiql(query, teamContext);

    // the ADS query just returns workitem id's
    // get the actual workitem content in parallel (async), wait for all to finish before continueing
    if (queryResult.workItems) {
      const p = [];
      for (const workItem of queryResult.workItems) {
        if (workItem.id) {
          p.push(getFeatureFromADS(witAPI, workItem.id, asOfDate));
        }
      }
      await Promise.all(p);
    }
  } catch (e) {
    console.log('Error in getFeaturesFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getFeatureFromADS(witAPI: IWorkItemTrackingApi, id: number, asOfDate: Date | undefined) {
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

    if (queryResult.fields) {
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
        startSprintName: '',
        endSprint: NOT_SET,
        endSprintName: '',
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
    }
  } catch (e) {
    console.log('Error in getFeatureFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getStoriesFromADS(witAPI: IWorkItemTrackingApi, pis: string[], asOfDate: Date | undefined) {
  try {
    const areaOffsetWIQL = Meteor.settings.public.AreaOffset.split('/').join('\\');
    const iterationOffsetWIQL = ADSConfig.ITERATION_OFFSET.split('/').join('\\');

    let piSubQuery = '';
    for (const [i, pi] of pis.entries()) {
      piSubQuery += `[Source].[System.IterationPath] UNDER '${
        Meteor.settings.public.ADSProject
      }${iterationOffsetWIQL}\\${pi}' ${i !== pis.length - 1 ? 'OR ' : ''}`;
    }
    const asOfSubQuery = asOfDate ? `ASOF '${format(asOfDate, 'MM/dd/yyyy')}'` : '';

    const query = {
      query: `
      SELECT
          [System.Id]
      FROM workitemLinks
      WHERE
          (
              [Source].[System.TeamProject] = @project
              AND [Source].[System.WorkItemType] = 'Feature'
              AND [Source].[System.AreaPath] UNDER '${Meteor.settings.public.ADSProject}${areaOffsetWIQL}'
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

    const teamContext = { project: Meteor.settings.public.ADSProject };
    const queryResult = await witAPI.queryByWiql(query, teamContext);

    // the ADS query just returns workitem id's
    // get the actual workitem content in parallel (async), wait for all to finish before continueing
    if (queryResult.workItemRelations) {
      const p = [];
      for (const workItemLink of queryResult.workItemRelations) {
        if (workItemLink.rel === 'System.LinkTypes.Hierarchy-Forward') {
          if (workItemLink.target && workItemLink.target.id && workItemLink.source && workItemLink.source.id) {
            p.push(getStoryFromADS(witAPI, workItemLink.target.id, workItemLink.source.id, asOfDate, pis));
          }
        }
      }
      await Promise.all(p);
    }
  } catch (e) {
    console.log('Error in getStoriesFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

async function getStoryFromADS(
  witAPI: IWorkItemTrackingApi,
  storyId: number,
  featureId: number,
  asOfDate: Date | undefined,
  pis: string[]
) {
  try {
    const queryResult = await witAPI.getWorkItem(
      storyId,
      [ADSFields.ITERATION_PATH, ADSFields.EFFORT, ADSFields.STATE],
      asOfDate
    );

    if (queryResult.fields) {
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
    }
  } catch (e) {
    console.log('Error in getStoryFromADS');
    throw e;
  }
  return ReturnStatus.OK;
}

export async function QueryADS(date: Date | undefined): Promise<boolean> {
  const authHandler = vsoNodeApi.getPersonalAccessTokenHandler(Meteor.settings.ADSToken);
  const connection = new vsoNodeApi.WebApi(Meteor.settings.public.ADSUrl, authHandler);
  const witAPI = await connection.getWorkItemTrackingApi();

  const x = Collections.getCurrentPIs(Collections.IncrementsCollection.find().fetch());
  console.log(x);
  const pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  // no need to get the iterations, velocity & allocation on every as-of query
  if (!date) {
    console.log('getting sprints');
    await getIterationsFromADS(witAPI);

    console.log('getting velocity plan');
    await getVelocityPlanFromADS(witAPI, pis);
  }

  console.log('getting features');
  await getFeaturesFromADS(witAPI, pis, date);

  console.log('getting stories');
  await getStoriesFromADS(witAPI, pis, date);

  return ReturnStatus.OK;
}
