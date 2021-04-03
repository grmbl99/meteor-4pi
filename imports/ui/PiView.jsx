import React from 'react';
import { useDrop } from 'react-dnd';
import { Feature, ItemTypes } from './Feature.jsx';

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
  let offset=0;
  const sprintsList=[];
  for (const sprint of sprints) {
    if (sprint.pi === props.pi) {
      dict[sprint.sprintname]=offset;
      offset += 65;
      sprintsList.push(<Sprint key={sprint._id} name={sprint.sprintname}/>);
    }
  }

  let size=0;
  let done=0;
  const featuresList=[];
  for (const feature of features) {
    const so=feature.startsprint in dict ? dict[feature.startsprint] : 0;
    const eo=feature.endsprint in dict ? dict[feature.endsprint]+65 : 0;

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

      featuresList.push(<Feature key={feature._id} feature={feature} displaytype={displaytype} so={so} eo={eo} onFeatureClicked={props.onFeatureClicked}/>);
    }
  }

  if(props.comparemodeon) {
    for (const deltafeature of deltafeatures) {
      if(deltafeature.type === 'removed') {
        const feature=deltafeature.feature;
        const so=feature.startsprint in dict ? dict[feature.startsprint] : 0;
        const eo=feature.endsprint in dict ? dict[feature.endsprint]+65 : 0;

        if (feature.pi === props.pi && 
            (props.team === '' || feature.team === props.team) &&
            (props.project === '' || feature.project === props.project)) {
          let displaytype='removed';
          featuresList.push(<Feature key={feature._id} feature={feature} displaytype={displaytype} so={so} eo={eo} onFeatureClicked={props.onFeatureClicked}/>);
        }  
      }
    }
  }

  const percentdone=size>0 ? done/size : 0;
  const percentdonestr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(percentdone);

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
      {sprintsList}
      <div className='pi-progress'>
        <div className='pi-progress-bar'>
          <div className='pi-progress-text'>
            {percentdonestr} [{done}/{size}]
          </div>
          <svg width='455px' height='30px'>
            <rect x='0' y='0' height='30' width='455' fill='rgb(230, 230, 230)'/>
            <rect x='0' y='0' height='30' width={455*percentdone} fill='purple'/>
          </svg>
        </div>
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