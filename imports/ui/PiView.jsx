import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd'

const ItemTypes = {
  FEATURE: 'feature'
}

//----------------------------------------------------------------------
export function PiView(props) {
  const features = props.features;
  const sprints = props.sprints;

  const [{isOver}, drop] = useDrop(() => ({
    accept: ItemTypes.FEATURE,
    drop: (item) => { props.onFeatureDropped(item.id,props.pi,props.team,props.project) },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }),[props])

  let dict={};
  let offset=0;
  let sprintsList=[];
  sprints.forEach(sprint => {
    if (sprint.pi === props.pi) {
      dict[sprint.sprintname]=offset;
      offset += 65;
      sprintsList.push(<Sprint key={sprint._id} name={sprint.sprintname} />);
    }
  });

  let size=0;
  let done=0;
  let featuresList=[];
  features.forEach(feature => {
    so=feature.startsprint in dict ? dict[feature.startsprint] : 0;
    eo=feature.endsprint in dict ? dict[feature.endsprint]+65 : 0;
    if (feature.pi === props.pi && 
        (props.team === '' || feature.team === props.team) &&
        (props.project === '' || feature.project === props.project)
        ) {
      size += feature.size;
      done += feature.done;
      featuresList.push(<Feature key={feature._id} feature={feature} so={so} eo={eo} onFeatureClicked={props.onFeatureClicked}/>)
    }
  });

  perct=size>0 ? done/size : 0;
  perctstr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(perct);

  return (
    <div 
      className='pi-view'
      ref={drop}
      style={{
        opacity: isOver ? 0.5 : 1, 
      }}
    >
      <div className='pi-header'>{props.pi} {props.team} {props.project}</div>
      {sprintsList}
      <div className='pi-progress'>
        <div className='pi-progress-bar'>
          <div className='pi-progress-text'>
            {perctstr} [{done}/{size}]
          </div>
          <svg width='455px' height='30px'>
            <rect x='0' y='0' height='30' width='455' fill='rgb(230, 230, 230)'/>
            <rect x='0' y='0' height='30' width={455*perct} fill='purple'/>
          </svg>
        </div>
      </div>
      {featuresList}
    </div>
  );
}

//----------------------------------------------------------------------
function Feature(props) {
  const feature=props.feature;

  const [{isDragging}, drag] = useDrag(() => ({
    type: ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    })
  }))

  perct=feature.done/feature.size;
  perctstr=Intl.NumberFormat('en-IN', { style: 'percent' }).format(perct);

  return (
    <div 
      className='feature' 
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <div className='feature-name'>{feature.name}</div>
      <div className='feature-progress-bar' onClick={() => {props.onFeatureClicked(feature)}}>
        <div className='feature-progress-text' style={{left: props.so+5}}>
          {perctstr} [{feature.done}/{feature.size}]
        </div>
        <svg width='455px' height='20px'>
          <rect x={props.so} y='0' height='20' width={props.eo-props.so} fill='rgb(230, 230, 230)'/>
          <rect x={props.so} y='0' height='20' width={(props.eo-props.so)*perct} fill='rgb(81, 122, 235)'/>
        </svg>
      </div>
    </div>
  );
}

//----------------------------------------------------------------------
function Sprint(props) {
  return(
    <div className='sprint'>{props.name}</div>
  );
}