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
  orgProgress: PropTypes.number.isRequired
};

function Feature(props) {
  const feature=props.feature;

  // feature drag-and-drop logic
  const [{isDragging}, drag] = useDrag(() => ({
    type: Constants.ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }));

  // style the feature based on DisplayType
  let featureClassName='feature';
  if (props.displayType === Constants.DisplayTypes.ADDED) { featureClassName += ' feature-added'; }
  else if (props.displayType === Constants.DisplayTypes.REMOVED) { featureClassName += ' feature-removed'; }

  // truncate feature name
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
      <div className='feature-progress-bar'>
        <ProgressBar start={props.start} duration={props.duration} duration2={Constants.NOT_SET}
                    size={feature.size} progress={feature.progress}
                    orgStart={props.orgStart} orgDuration={props.orgDuration}
                    orgSize={props.orgSize}/>
      </div>
    </div>
  );
}