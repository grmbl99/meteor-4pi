import React from 'react';
import { useDrop } from 'react-dnd';
import { Feature, ItemTypes } from './Feature.jsx';
import { ProgressBar } from './ProgressBar.jsx';

// calculate feature-start and feature-duration as percentace of nr-of-sprints in a PI
function calcRelFeatureStartAndDuration(feature,dict) {
  const nrsprints=Object.keys(dict).length;

  let duration=0;
  let start=0;
  if (feature.startsprint in dict && feature.endsprint in dict) {
    const startsprint=dict[feature.startsprint];
    const endsprint=dict[feature.endsprint];

    duration=(endsprint-startsprint+1)/nrsprints*100;
    start=startsprint/nrsprints*100;  
  }

  return([start,duration]);
}

export function PiView(props) {  
  const features = props.features;
  const deltafeatures = props.deltafeatures;
  const sprints = props.sprints;

  const [{isOver}, drop] = useDrop(() => ({
    accept: ItemTypes.FEATURE,
    drop: (item) => { props.onFeatureDropped(item.id,props.pi,props.team,props.project) },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }),[props]);

  const dict={};
  let sprintnr=0;
  const sprintsList=[];
  for (const sprint of sprints) {
    if (sprint.pi === props.pi) {
      dict[sprint.sprintname]=sprintnr;
      sprintnr += 1;
      sprintsList.push(<Sprint key={sprint._id} name={sprint.sprintname}/>);
    }
  }

  let size=0;
  let done=0;
  const featuresList=[];
  for (const feature of features) {
    const [start,duration]=calcRelFeatureStartAndDuration(feature,dict);

    if (feature.pi === props.pi && 
        (props.team === '' || feature.team === props.team) &&
        (props.project === '' || feature.project === props.project)) {
      size += feature.size;
      done += feature.done;

      let displaytype='normal';
      if (props.comparemodeon) {
        for (const deltafeature of deltafeatures) {
          if (deltafeature.feature._id === feature._id) {
            if (deltafeature.type === 'added') {
              displaytype='added';
              break;
            } else if (deltafeature.type === 'changed') {
              displaytype='changed';
              break;
            }
          }
        }    
      }

      featuresList.push(<Feature key={feature._id} feature={feature} 
                                 displaytype={displaytype} 
                                 start={start} duration={duration}
                                 onFeatureClicked={props.onFeatureClicked}/>);
    }
  }

  if(props.comparemodeon) {
    for (const deltafeature of deltafeatures) {
      if(deltafeature.type === 'removed') {
        const feature=deltafeature.feature;
        const [start,duration]=calcRelFeatureStartAndDuration(feature,dict);

        if (feature.pi === props.pi && 
            (props.team === '' || feature.team === props.team) &&
            (props.project === '' || feature.project === props.project)) {
          let displaytype='removed';
          featuresList.push(<Feature key={feature._id} feature={feature} 
                                     displaytype={displaytype} 
                                     start={start} duration={duration}
                                     onFeatureClicked={props.onFeatureClicked}/>);
        }  
      }
    }
  }

  const allocationstr = props.allocation === -1 ? '' : 'a=' + Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(props.allocation) + '%';
  const velocitystr = props.velocity === -1 ? '' : 'v=' + Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(props.velocity) + 'sp';

  return (
    <div 
      className='pi-view'
      ref={drop}
      style={{
        opacity: isOver ? 0.5 : 1, 
      }}
    >
      <div className='pi-header'>{props.pi} {props.team} {props.project} {allocationstr} {velocitystr}</div>
      <div className='sprint-grid-container'>
        {sprintsList}
      </div>
      <div className='pi-progress'>
        <ProgressBar className='pi-progress-bar' 
                     fillStyle='pi-progress-bar-fill' 
                     start='0' width='100' size={size} done={done}/>
      </div>
      {featuresList}
    </div>
  );
}

function Sprint(props) {
  return(
    <div className='sprint'>{props.name}</div>
  );
}