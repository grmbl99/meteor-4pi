import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './Constants'

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
  }))

  let dict={};
  let offset=0;
  sprints.forEach(sprint => {
    if (sprint.pi === props.pi) {
      dict[sprint.sprintname]=offset;
      offset += 65;
    }
  });

  let size=0;
  let done=0;
  features.forEach(feature => {
    if (feature.pi === props.pi && 
        (props.team === "" || feature.team === props.team) &&
        (props.project === "" || feature.project === props.project)
        ) {
      size += feature.size;
      done += feature.done;
    }
  });
  perct=size>0 ? done/size : 0;
  perctstr = Intl.NumberFormat('en-IN', { style: "percent" }).format(perct);


  const featuresList = features.flatMap((feature) => {
    so=feature.startsprint in dict ? dict[feature.startsprint] : 0;
    eo=feature.endsprint in dict ? dict[feature.endsprint]+65 : 0;
    if (feature.pi === props.pi && 
        (props.team === "" || feature.team === props.team) &&
        (props.project === "" || feature.project === props.project)
      ) {
      return(<Feature key={feature._id} feature={feature} so={so} eo={eo}/>);
    } else {
      return([]);
    }
  });

  const sprintsList = sprints.flatMap((sprint) => {
    if (sprint.pi === props.pi) {
      return(<Sprint key={sprint._id} name={sprint.sprintname} />);
    } else {
      return([]);
    }
  });

  return (
    <div 
      className="piview"
      ref={drop}
      style={{
        opacity: isOver ? 0.5 : 1, 
        backgroundColor: size>140 ? "red" : "lightgreen"
      }}
    >
      <div className="piheader">{props.pi} {props.team} {props.project}</div>
      {sprintsList}
      <div className="piheader">{perctstr} [{done}/{size}]
        <div className="pisize">
          <svg width="450px" height="25px">
            <rect x="0" y="5" height="20" width={465*perct} fill="yellow"/>
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

  return (
    <div 
      className="feature" 
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move"
      }}
    >
      <div className="featurename">{feature.name}</div>
      <div className="featuresize">
        <svg width="450px" height="20px">
          <rect x={props.so} y="0" height="20" width={props.eo-props.so} fill="lightgray"/>
          <rect x={props.so} y="0" height="20" width={(props.eo-props.so)*perct} fill="green"/>
        </svg>
      </div>
    </div>
  );
}

//----------------------------------------------------------------------
function Sprint(props) {
  return(
    <div className="sprint">{props.name}</div>
  );
}