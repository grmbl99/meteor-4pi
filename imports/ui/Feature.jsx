import React from 'react';
import { useDrag } from 'react-dnd'

export const ItemTypes = {
  FEATURE: 'feature'
}

export function Feature(props) {
  const feature=props.feature;

  const [{isDragging}, drag] = useDrag(() => ({
    type: ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    })
  }))

  const perct=feature.done/feature.size;
  const perctstr=Intl.NumberFormat('en-IN', { style: 'percent' }).format(perct);

  if (props.displaytype === 'added') {featureClassName = 'feature feature-added'}
  else if (props.displaytype === 'removed') {featureClassName = 'feature feature-removed'}
  else if (props.displaytype === 'changed') {featureClassName = 'feature feature-changed'}
  else {featureClassName = 'feature'}

  return (
    <div 
      className={featureClassName} 
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <div className='feature-name'>{feature.id} {feature.name}</div>
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