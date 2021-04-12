import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import * as Constants from '/imports/api/constants';
import { Feature } from './feature';
import { ProgressBar } from './progress-bar';

export { PiView };

PiView.propTypes = {
  features: PropTypes.array.isRequired,
  deltaFeatures: PropTypes.array.isRequired,
  iterations: PropTypes.array.isRequired,
  onFeatureDropped: PropTypes.func.isRequired,
  onFeatureClicked: PropTypes.func.isRequired,
  pi: PropTypes.string.isRequired,
  team: PropTypes.string.isRequired,
  project: PropTypes.string.isRequired,
  compareModeOn: PropTypes.bool.isRequired,
  allocation: PropTypes.number.isRequired
};

// calculate feature-start and feature-duration as percentace of nr-of-sprints in a PI
function calcRelFeatureStartAndDuration(feature,sprintsDict) {
  const nrSprints=Object.keys(sprintsDict).length;

  let duration=0;
  let start=0;
  if (feature.startSprint in sprintsDict && feature.endSprint in sprintsDict) {
    const startSprint=sprintsDict[feature.startSprint];
    const endSprint=sprintsDict[feature.endSprint];

    duration=(endSprint-startSprint+1)/nrSprints*100;
    start=startSprint/nrSprints*100;  
  }

  return([start,duration]);
}

function PiView(props) {  
  const features = props.features;
  const deltaFeatures = props.deltaFeatures;
  const iterations = props.iterations;

  const [{isOver}, drop] = useDrop(() => ({
    accept: Constants.ItemTypes.FEATURE,
    drop: (item) => { props.onFeatureDropped(item.id,props.pi,props.team,props.project); },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }),[props]);

  const sprintsDict={};
  const sprintsList=[];
  let sprintNr=0;
  for (const iteration of iterations) {
    if (iteration.pi === props.pi) {
      sprintsDict[iteration.sprint]=sprintNr;
      sprintNr += 1;
      sprintsList.push(<Sprint key={iteration._id} name={iteration.sprint}/>);
    }
  }
  if (sprintNr===0) { sprintsList.push(<SprintPlaceholder key='1' name='no sprints defined'/>); }

  let size=0;
  let done=0;
  const featuresList=[];
  for (const feature of features) {
    let orgStart=Constants.NOT_SET;
    let orgDuration=Constants.NOT_SET;
    let orgSize=Constants.NOT_SET;
    let orgDone=Constants.NOT_SET;
    const [start,duration]=calcRelFeatureStartAndDuration(feature,sprintsDict);

    if (feature.pi === props.pi && 
        (props.team === '' || feature.team === props.team) &&
        (props.project === '' || feature.project === props.project)) {
      size += feature.size;
      done += feature.done;

      let displayType=Constants.DisplayTypes.NORMAL;
      if (props.compareModeOn) {
        for (const deltaFeature of deltaFeatures) {
          if (deltaFeature.feature._id === feature._id) {
            if (deltaFeature.type === Constants.DisplayTypes.ADDED) {
              displayType=Constants.DisplayTypes.ADDED;
            }
            if (deltaFeature.type === Constants.DisplayTypes.CHANGED) {
              [orgStart,orgDuration]=calcRelFeatureStartAndDuration(deltaFeature.feature,sprintsDict);
              orgSize=deltaFeature.feature.size;
              orgDone=deltaFeature.feature.done;
            }
          }
        }    
      }

      featuresList.push(<Feature key={feature._id} feature={feature} 
                                 displayType={displayType} 
                                 start={start} duration={duration}
                                 orgStart={orgStart} orgDuration={orgDuration}
                                 orgSize={orgSize} orgDone={orgDone}
                                 onFeatureClicked={props.onFeatureClicked}/>);
    }
  }

  if(props.compareModeOn) {
    for (const deltaFeature of deltaFeatures) {
      if(deltaFeature.type === Constants.DisplayTypes.REMOVED) {
        const feature=deltaFeature.feature;
        const [start,duration]=calcRelFeatureStartAndDuration(feature,sprintsDict);

        if (feature.pi === props.pi && 
            (props.team === '' || feature.team === props.team) &&
            (props.project === '' || feature.project === props.project)) {
          let displayType=Constants.DisplayTypes.REMOVED;
          featuresList.push(<Feature key={feature._id} feature={feature} 
                                     displayType={displayType} 
                                     start={start} duration={duration}
                                     orgStart={Constants.NOT_SET} orgDuration={Constants.NOT_SET}
                                     orgSize={Constants.NOT_SET} orgDone={Constants.NOT_SET}
                                     onFeatureClicked={props.onFeatureClicked}/>);
        }  
      }
    }
  }

  return (
    <div 
      className='pi-view'
      ref={drop}
      style={{
        opacity: isOver ? 0.5 : featuresList.length===0 ? 0.1 : 1, 
      }}
    >
      <div className='pi-header'>
        {props.pi} {props.team} {props.project} 
        <LoadBadge allocation={props.allocation} size={size}/>
        <AllocationBadge allocation={props.allocation}/>
      </div>
      <div className='sprint-grid-container'>
        {sprintsList}
      </div>
      <div className='pi-progress'>
        <ProgressBar className='pi-progress-bar' 
                     fillStyle='pi-progress-bar-fill' 
                     start={0} width={100} size={size} done={done}/>
      </div>
      {featuresList}
    </div>
  );
}

Sprint.propTypes = {
  name: PropTypes.string
};

function Sprint(props) {
  return(
    <div className='sprint'>{props.name}</div>
  );
}

SprintPlaceholder.propTypes = {
  name: PropTypes.string
};

function SprintPlaceholder(props) {
  return(
    <div className='sprint-placeholder'>{props.name}</div>
  );
}

AllocationBadge.propTypes = {
  allocation: PropTypes.number
};

function AllocationBadge(props) {
  let className='pi-badge pi-allocation-badge';
  let allocStr='';

  if (props.allocation!==Constants.NOT_SET) {
    allocStr+=Intl.NumberFormat('en-IN', { maximumFractionDigits: 0, useGrouping: false }).format(props.allocation);
  } else {
    className+=' display-none';
  }

  return(
    <div className={className}>Alloc: {allocStr}SP</div>
  );
}

LoadBadge.propTypes = {
  allocation: PropTypes.number,
  size: PropTypes.number
};

function LoadBadge(props) {
  let className='pi-badge pi-load-badge';
  let loadStr='';

  if (props.allocation!==Constants.NOT_SET) {
    if (props.allocation>0) {
      const load=props.size/props.allocation*100;
      loadStr=Intl.NumberFormat('en-IN', { maximumFractionDigits: 0, useGrouping: false }).format(load);
      if (load>100) {
        className+=' pi-badge-alert';
      }
    } else {
      if (props.size===0) {
        loadStr='0';
      } else {
        loadStr=String.fromCharCode(8734); // infinity sign
        className+=' pi-badge-alert';
      }
    }  
  } else {
    className+=' display-none';
  }

  return(
    <div className={className}>Load: {loadStr}%</div>
  );
}