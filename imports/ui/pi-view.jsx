import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import { NOT_SET, START_SPRINT_NOT_SET, ItemTypes, DisplayTypes } from '/imports/api/constants';
import { Feature } from './feature';
import { ProgressBar } from './progress-bar';
import { CollectionContext } from './context';

export { PiView };

PiView.propTypes = {
  onFeatureDropped: PropTypes.func.isRequired,
  onFeatureClicked: PropTypes.func.isRequired,
  pi: PropTypes.string.isRequired,
  team: PropTypes.string.isRequired,
  project: PropTypes.string.isRequired,
  compareModeOn: PropTypes.bool.isRequired,
  allocation: PropTypes.number.isRequired,
  onFeaturesDisplayed: PropTypes.func.isRequired
};

// determine how feature-start&end fall within a PI;
// returns start/end relative to PI-start (i.e. 0=first sprint of PI)
function calcRelFeatureStartEnd(feature, piStartSprint, piEndSprint) {
  let start = NOT_SET;
  let end = NOT_SET;
  let fEnd = NOT_SET;

  if (piStartSprint !== START_SPRINT_NOT_SET && piEndSprint !== NOT_SET) {
    if (
      feature.startSprint !== START_SPRINT_NOT_SET &&
      feature.endSprint !== NOT_SET &&
      feature.startSprint <= feature.endSprint
    ) {
      if (feature.startSprint < piStartSprint && feature.endSprint < piStartSprint) {
        // before
      } else if (feature.startSprint < piStartSprint && feature.endSprint <= piEndSprint) {
        // before-in
        start = 0;
        end = feature.endSprint - piStartSprint;
      } else if (feature.startSprint <= piEndSprint && feature.endSprint <= piEndSprint) {
        // in
        start = feature.startSprint - piStartSprint;
        end = feature.endSprint - piStartSprint;
      } else if (feature.startSprint < piStartSprint && feature.endSprint > piEndSprint) {
        // before-after
        start = 0;
        end = piEndSprint - piStartSprint;
      } else if (feature.startSprint <= piEndSprint && feature.endSprint > piEndSprint) {
        // in-after
        start = feature.startSprint - piStartSprint;
        end = piEndSprint - piStartSprint;
      } else if (feature.startSprint > piEndSprint && feature.endSprint > piEndSprint) {
        // after
      }
    }

    if (feature.featureEndSprint !== NOT_SET) {
      if (feature.featureEndSprint < piStartSprint) {
        // before
      } else if (feature.featureEndSprint <= piEndSprint) {
        // in
        fEnd = feature.featureEndSprint - piStartSprint;
      } else if (fEnd > piEndSprint) {
        // after
      }
    }
  }

  return [start, end, fEnd];
}

function PiView(props) {
  const { iterations, features, deltaFeatures } = React.useContext(CollectionContext);

  // feature drag and drop logic
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.FEATURE,
      drop: (item) => {
        props.onFeatureDropped(item.id, props.pi, props.team, props.project);
      },
      collect: (monitor) => ({ isOver: monitor.isOver() })
    }),
    [props]
  );

  // used to let parent (PiViewRow) know how many features are displayed
  React.useEffect(() => {
    props.onFeaturesDisplayed(props.pi, featuresList.length);
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
      sprintsList.push(<Sprint key={iteration._id} name={iteration.sprintName} />);
    }
  }
  const nrSprints = sprintsList.length;
  if (nrSprints === 0) {
    sprintsList.push(<SprintPlaceholder key='1' name='no sprints defined' />);
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
    const [startSprint, endSprint, featureEndSprint] = calcRelFeatureStartEnd(feature, piStart, piEnd);

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
          let displayType = DisplayTypes.REMOVED;
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
        <LoadBadge allocation={props.allocation} size={size} />
        <AllocationBadge allocation={props.allocation} />
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
            orgFeatureEndSprint={NOT_SET}
            orgSize={NOT_SET}
            nrSprints={nrSprints}
          />
        </div>
      </div>
      {featuresList}
    </div>
  );
}

Sprint.propTypes = {
  name: PropTypes.string
};

function Sprint(props) {
  return <div className='sprint'>{props.name}</div>;
}

SprintPlaceholder.propTypes = {
  name: PropTypes.string
};

function SprintPlaceholder(props) {
  return <div className='sprint-placeholder'>{props.name}</div>;
}

AllocationBadge.propTypes = {
  allocation: PropTypes.number
};

function AllocationBadge(props) {
  let className = 'pi-badge pi-allocation-badge';
  let allocStr = '';

  if (props.allocation !== NOT_SET) {
    allocStr += Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      useGrouping: false
    }).format(props.allocation);
  } else {
    className += ' display-none';
  }

  return <div className={className}>Alloc: {allocStr}SP</div>;
}

LoadBadge.propTypes = {
  allocation: PropTypes.number,
  size: PropTypes.number
};

function LoadBadge(props) {
  let className = 'pi-badge pi-load-badge';
  let loadStr = '';

  if (props.allocation !== NOT_SET) {
    if (props.allocation > 0) {
      const load = (props.size / props.allocation) * 100;
      loadStr = Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
        useGrouping: false
      }).format(load);
      if (load > 100) {
        className += ' pi-badge-alert';
      }
    } else {
      if (props.size === 0) {
        loadStr = '0';
      } else {
        loadStr = String.fromCharCode(8734); // infinity sign
        className += ' pi-badge-alert';
      }
    }
  } else {
    className += ' display-none';
  }

  return <div className={className}>Load: {loadStr}%</div>;
}
