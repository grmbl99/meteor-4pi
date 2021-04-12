import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { ProgressBar } from './progress-bar';
import { ItemTypes, DisplayTypes } from '/imports/api/constants';

export { Feature };

Feature.propTypes = {
  feature: PropTypes.object.isRequired,
  displaytype: PropTypes.string.isRequired,
  onFeatureClicked: PropTypes.func.isRequired,
  start: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  orgstart: PropTypes.number.isRequired,
  orgduration: PropTypes.number.isRequired,
  orgsize: PropTypes.number.isRequired,
  orgdone: PropTypes.number.isRequired
};

function Feature(props) {
  const feature=props.feature;

  const [{isDragging}, drag] = useDrag(() => ({
    type: ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }));

  let featureClassName='feature';
  if (props.displaytype === DisplayTypes.ADDED) { featureClassName += ' feature-added'; }
  else if (props.displaytype === DisplayTypes.REMOVED) { featureClassName += ' feature-removed'; }

  const maxlength=60;
  const trimmedName = feature.name.length > maxlength ? feature.name.substring(0, maxlength - 3) + '...' : feature.name;

  return (
    <div 
      className={featureClassName} 
      onClick={() => {props.onFeatureClicked(feature);}}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <div className='feature-name'>{feature.id} {trimmedName}</div>
      <ProgressBar className='feature-progress-bar' 
                   fillStyle='feature-progress-bar-fill' 
                   start={props.start} width={props.duration} size={feature.size} done={feature.done}
                   orgstart={props.orgstart} orgwidth={props.orgduration}
                   orgsize={props.orgsize} orgdone={props.orgdone}/>
    </div>
  );
}