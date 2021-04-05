import React from 'react';
import { useDrag } from 'react-dnd';
import { ProgressBar } from './ProgressBar.jsx';

export const ItemTypes = {
  FEATURE: 'feature'
}

export function Feature(props) {
  const feature=props.feature;

  const [{isDragging}, drag] = useDrag(() => ({
    type: ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }));

  if (props.displaytype === 'added') { featureClassName = 'feature feature-added' }
  else if (props.displaytype === 'removed') { featureClassName = 'feature feature-removed' }
  else if (props.displaytype === 'changed') { featureClassName = 'feature feature-changed' }
  else { featureClassName = 'feature' }

  return (
    <div 
      className={featureClassName} 
      onClick={() => {props.onFeatureClicked(feature)}}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <div className='feature-name'>{feature.id} {feature.name}</div>
      <ProgressBar className='feature-progress-bar' 
                   fillStyle='feature-progress-bar-fill' 
                   start={props.start} width={props.duration} size={feature.size} done={feature.done}
                   orgstart={props.orgstart} orgwidth={props.orgduration}
                   orgsize={props.orgsize} orgdone={props.orgdone}/>
    </div>
  );
}