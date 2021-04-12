import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import * as Constants from '/imports/api/constants';
import { ProgressBar } from './progress-bar';

export { Feature };

Feature.propTypes = {
  feature: PropTypes.object.isRequired,
  displayType: PropTypes.string.isRequired,
  onFeatureClicked: PropTypes.func.isRequired,
  start: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  orgStart: PropTypes.number.isRequired,
  orgDuration: PropTypes.number.isRequired,
  orgSize: PropTypes.number.isRequired,
  orgDone: PropTypes.number.isRequired
};

function Feature(props) {
  const feature=props.feature;

  const [{isDragging}, drag] = useDrag(() => ({
    type: Constants.ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }));

  let featureClassName='feature';
  if (props.displayType === Constants.DisplayTypes.ADDED) { featureClassName += ' feature-added'; }
  else if (props.displayType === Constants.DisplayTypes.REMOVED) { featureClassName += ' feature-removed'; }

  const maxLength=60;
  const trimmedName = feature.name.length > maxLength ? feature.name.substring(0, maxLength - 3) + '...' : feature.name;

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
                   orgstart={props.orgStart} orgwidth={props.orgDuration}
                   orgsize={props.orgSize} orgdone={props.orgDone}/>
    </div>
  );
}