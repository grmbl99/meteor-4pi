import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './Constants'

export function PiView(props) {
  const features = props.features;

  const [{isOver}, drop] = useDrop(() => ({
    accept: ItemTypes.FEATURE,
    drop: (item) => { props.onFeatureDropped(item.id,props.name) },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  let size=0;
  features.forEach(feature => {
    if (feature.pi === props.name) {
      size += feature.size;
    }
  });

  const listItems = features.flatMap((feature) => {
    if (feature.pi === props.name) {
      return(<Feature key={feature._id} feature={feature} />);
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
      {props.name}: total size: {size}
      {listItems}
    </div>
  );
}

function Feature(props) {
  const feature=props.feature;

  const [{isDragging}, drag] = useDrag(() => ({
    type: ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    })
  }))

  return (
    <div 
      className="feature" 
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move"
      }}
    >
      <div className="featurename">Featurename: {feature.name}</div>
      <div className="featuresize">
        <svg width="100px" height="20px">
          <rect height="20" width={feature.size} fill="green"/>
        </svg>
      </div>
    </div>
  );
}
