import React, { ReactElement } from 'react';
import { useDrop } from 'react-dnd';
import { differenceInCalendarDays, format } from 'date-fns';
import { NOT_SET, START_SPRINT_NOT_SET, ItemTypes, DisplayTypes, ADSConfig } from '/imports/api/constants';
import { Feature } from './feature';
import { ProgressBar } from './progress-bar';
import { CollectionContext } from './context';
import { OnFeatureClickType, OnFeatureDropType, OnFeaturesDisplayedType } from '/imports/api/types';
import { featureType, iterationType } from '/imports/api/collections';

export { PiView };

interface PiViewPropTypes {
  onFeatureDropped: OnFeatureDropType;
  onFeatureClicked: OnFeatureClickType;
  pi: string;
  team: string;
  project: string;
  compareModeOn: boolean;
  allocation: number;
  onFeaturesDisplayed: OnFeaturesDisplayedType;
}

// determine how feature-start&end fall within a PI;
// returns start/end relative to PI-start (i.e. 0=first sprint of PI)
function calcRelFeatureStartEnd(
  feature: featureType,
  piStartSprint: number,
  piEndSprint: number
): [number, number, number, string] {
  let start = NOT_SET;
  let end = NOT_SET;
  let fEnd = NOT_SET;
  let sprintMsg = '';
  let featureMsg = '';

  if (piStartSprint !== START_SPRINT_NOT_SET && piEndSprint !== NOT_SET) {
    if (
      feature.startSprint !== START_SPRINT_NOT_SET &&
      feature.endSprint !== NOT_SET &&
      feature.startSprint <= feature.endSprint
    ) {
      const startMsg = 'start: ' + feature.startSprintName + ' ';
      const endMsg = 'end: ' + feature.endSprintName + ' ';

      if (feature.startSprint < piStartSprint && feature.endSprint < piStartSprint) {
        // before
        sprintMsg = startMsg + endMsg;
      } else if (feature.startSprint < piStartSprint && feature.endSprint <= piEndSprint) {
        // before-in
        sprintMsg = startMsg;
        start = 0;
        end = feature.endSprint - piStartSprint;
      } else if (feature.startSprint <= piEndSprint && feature.endSprint <= piEndSprint) {
        // in
        start = feature.startSprint - piStartSprint;
        end = feature.endSprint - piStartSprint;
      } else if (feature.startSprint < piStartSprint && feature.endSprint > piEndSprint) {
        // before-after
        sprintMsg = startMsg + endMsg;
        start = 0;
        end = piEndSprint - piStartSprint;
      } else if (feature.startSprint <= piEndSprint && feature.endSprint > piEndSprint) {
        // in-after
        sprintMsg = endMsg;
        start = feature.startSprint - piStartSprint;
        end = piEndSprint - piStartSprint;
      } else if (feature.startSprint > piEndSprint && feature.endSprint > piEndSprint) {
        // after
        sprintMsg = startMsg + endMsg;
      }
    }

    const endMsg = 'feature end: ' + feature.featureEndSprintName;
    if (feature.featureEndSprint !== NOT_SET) {
      if (feature.featureEndSprint < piStartSprint) {
        // before
        featureMsg = endMsg;
      } else if (feature.featureEndSprint <= piEndSprint) {
        // in
        fEnd = feature.featureEndSprint - piStartSprint;
      } else if (fEnd > piEndSprint) {
        // after
        featureMsg = endMsg;
      }
    }
  }

  return [start, end, fEnd, sprintMsg + featureMsg];
}

function PiView(props: PiViewPropTypes): ReactElement | null {
  const context = React.useContext(CollectionContext);

  if (context) {
    const { iterations, features, deltaFeatures } = context;

    const [nrFeatures, setNrFeatures] = React.useState(0);

    // feature drag and drop logic
    const [{ isOver }, drop] = useDrop(
      () => ({
        accept: ItemTypes.FEATURE,
        drop: (item: { id: number }) => {
          props.onFeatureDropped(item.id, props.pi, props.team, props.project);
        },
        collect: (monitor) => ({ isOver: monitor.isOver() })
      }),
      [props]
    );

    // used to let parent (PiViewRow) know how many features are displayed
    React.useEffect(() => {
      props.onFeaturesDisplayed(props.pi, featuresList.length);
      setNrFeatures(featuresList.length);
    }, [props]);

    const sprintsList = []; // list of Sprint objects
    let piStart = START_SPRINT_NOT_SET;
    let piEnd = NOT_SET;
    for (const iteration of iterations) {
      if (iteration.pi === props.pi) {
        if (iteration.sprint < piStart) {
          piStart = iteration.sprint;
        }
        if (iteration.sprint > piEnd) {
          piEnd = iteration.sprint;
        }
        sprintsList.push(<Sprint key={iteration._id} iteration={iteration} nrFeatures={nrFeatures} />);
      }
    }
    const nrSprints = sprintsList.length;
    if (nrSprints === 0) {
      sprintsList.push(<SprintPlaceholder key='1' name='no iterations' />);
    }

    let size = 0;
    let progress = 0;
    const featuresList = []; // list of Feature objects
    for (const feature of features) {
      let orgStartSprint = NOT_SET;
      let orgEndSprint = NOT_SET;
      let orgFeatureEndSprint = NOT_SET;
      let orgSize = NOT_SET;
      let orgProgress = NOT_SET;
      const [startSprint, endSprint, featureEndSprint, startEndMsg] = calcRelFeatureStartEnd(feature, piStart, piEnd);

      if (
        feature.pi === props.pi &&
        (props.team === '' || feature.team === props.team) &&
        (props.project === '' || feature.project === props.project)
      ) {
        size += feature.size;
        progress += feature.progress;

        // check if this feature is in the delta-features collection;
        // if so, set additional attributes to show delta's
        let displayType = DisplayTypes.NORMAL;
        if (props.compareModeOn) {
          for (const deltaFeature of deltaFeatures) {
            if (deltaFeature.feature._id === feature._id) {
              if (deltaFeature.type === DisplayTypes.ADDED) {
                displayType = DisplayTypes.ADDED;
              }
              if (deltaFeature.type === DisplayTypes.CHANGED) {
                [orgStartSprint, orgEndSprint, orgFeatureEndSprint] = calcRelFeatureStartEnd(
                  deltaFeature.feature,
                  piStart,
                  piEnd
                );
                orgSize = deltaFeature.feature.size;
                orgProgress = deltaFeature.feature.progress;
              }
            }
          }
        }

        featuresList.push(
          <Feature
            key={feature._id}
            feature={feature}
            displayType={displayType}
            startSprint={startSprint}
            endSprint={endSprint}
            featureEndSprint={featureEndSprint}
            orgStartSprint={orgStartSprint}
            orgEndSprint={orgEndSprint}
            orgFeatureEndSprint={orgFeatureEndSprint}
            orgSize={orgSize}
            orgProgress={orgProgress}
            nrSprints={nrSprints}
            onFeatureClicked={props.onFeatureClicked}
            startEndMsg={startEndMsg}
          />
        );
      }
    }

    // also add all relevant 'removed' features from the delta-features collection
    if (props.compareModeOn) {
      for (const deltaFeature of deltaFeatures) {
        if (deltaFeature.type === DisplayTypes.REMOVED) {
          const feature = deltaFeature.feature;
          const [startSprint, endSprint, featureEndSprint] = calcRelFeatureStartEnd(feature, piStart, piEnd);

          if (
            feature.pi === props.pi &&
            (props.team === '' || feature.team === props.team) &&
            (props.project === '' || feature.project === props.project)
          ) {
            const displayType = DisplayTypes.REMOVED;
            featuresList.push(
              <Feature
                key={feature._id}
                feature={feature}
                displayType={displayType}
                startSprint={startSprint}
                endSprint={endSprint}
                featureEndSprint={featureEndSprint}
                orgStartSprint={NOT_SET}
                orgEndSprint={NOT_SET}
                orgFeatureEndSprint={NOT_SET}
                orgSize={NOT_SET}
                orgProgress={NOT_SET}
                nrSprints={nrSprints}
                onFeatureClicked={props.onFeatureClicked}
              />
            );
          }
        }
      }
    }

    return (
      <div
        className='pi-view'
        ref={drop}
        style={{
          opacity: isOver ? 0.5 : featuresList.length === 0 ? 0.1 : 1
        }}
      >
        <div className='pi-header'>
          {props.pi} {props.team} {props.project}
          <LoadInfo allocation={props.allocation} size={size} />
          <AllocationInfo allocation={props.allocation} />
        </div>
        <div className='sprint-grid-container'>{sprintsList}</div>
        <div className='pi-progress'>
          <div className='pi-progress-bar'>
            <ProgressBar
              startSprint={0}
              endSprint={nrSprints - 1}
              featureEndSprint={NOT_SET}
              size={size}
              progress={progress}
              orgStartSprint={NOT_SET}
              orgEndSprint={NOT_SET}
              orgSize={NOT_SET}
              nrSprints={nrSprints}
            />
          </div>
        </div>
        {featuresList}
      </div>
    );
  } else {
    return null;
  }
}

interface SprintPropTypes {
  iteration: iterationType;
  nrFeatures: number;
}

function Sprint(props: SprintPropTypes) {
  let todayIndicator = null;
  const SPRINT_CSS_WIDTH = 65;
  const FEATURE_CSS_HEIGHT = 47;
  const FEATURE_CSS_OFFSET = 60;

  const today = new Date();
  const offset = differenceInCalendarDays(today, props.iteration.startDate);
  if (offset >= 0 && offset < ADSConfig.ITERATION_DAYS) {
    todayIndicator = (
      <div
        className='today-indicator-line'
        style={{
          left: (SPRINT_CSS_WIDTH * offset) / ADSConfig.ITERATION_DAYS,
          height: props.nrFeatures * FEATURE_CSS_HEIGHT + FEATURE_CSS_OFFSET
        }}
      >
        <div className='today-indicator-date'>{format(today, 'MM/dd')}</div>
      </div>
    );
  }

  return (
    <div className='sprint'>
      {props.iteration.sprintName}
      {todayIndicator}
    </div>
  );
}

interface SprintPlaceholderPropTypes {
  name: string;
}

function SprintPlaceholder(props: SprintPlaceholderPropTypes) {
  return <div className='sprint-placeholder'>{props.name}</div>;
}

interface AllocationInfoPropTypes {
  allocation: number;
}

function AllocationInfo(props: AllocationInfoPropTypes) {
  let className = 'pi-allocation-info';
  let allocStr = '';

  if (props.allocation !== NOT_SET) {
    allocStr += Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      useGrouping: false
    }).format(props.allocation);
  } else {
    className += ' display-none';
  }

  return (
    <div className={className}>
      Alloc: <span className='pi-info-badge-green'>{allocStr}SP</span>
    </div>
  );
}

interface LoadInfoPropTypes {
  allocation: number;
  size: number;
}

function LoadInfo(props: LoadInfoPropTypes) {
  let className = 'pi-load-info';
  let badgeClassName = 'pi-info-badge-green';
  let loadStr = '';

  if (props.allocation !== NOT_SET) {
    if (props.allocation > 0) {
      const load = (props.size / props.allocation) * 100;
      loadStr = Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
        useGrouping: false
      }).format(load);
      if (load > 100) {
        badgeClassName = 'pi-info-badge-red';
      }
    } else {
      if (props.size === 0) {
        loadStr = '0';
      } else {
        loadStr = String.fromCharCode(8734); // infinity sign
        badgeClassName = 'pi-info-badge-red';
      }
    }
  } else {
    className += ' display-none';
  }

  return (
    <div className={className}>
      Load: <span className={badgeClassName}>{loadStr}%</span>
    </div>
  );
}
