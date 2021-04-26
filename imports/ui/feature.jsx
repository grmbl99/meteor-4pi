import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { DisplayTypes, ItemTypes, ADSFields } from '/imports/api/constants';
import { ProgressBar } from './progress-bar';

export { Feature };

Feature.propTypes = {
  feature: PropTypes.object.isRequired,
  displayType: PropTypes.string.isRequired,
  onFeatureClicked: PropTypes.func.isRequired,
  startSprint: PropTypes.number.isRequired,
  endSprint: PropTypes.number.isRequired,
  featureEndSprint: PropTypes.number.isRequired,
  orgStartSprint: PropTypes.number.isRequired,
  orgEndSprint: PropTypes.number.isRequired,
  orgFeatureEndSprint: PropTypes.number.isRequired, //not used to display anything at the moment
  orgSize: PropTypes.number.isRequired,
  orgProgress: PropTypes.number.isRequired,
  nrSprints: PropTypes.number.isRequired
};

function Feature(props) {
  const feature = props.feature;

  // feature drag-and-drop logic
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }));

  const tags = feature.tags ? feature.tags.toLowerCase().split('; ') : [];
  const stretchIcon = tags.includes(ADSFields.STRETCH) ? <i className='fa fa-gift' /> : '';

  const tagsIcon = tags.length > 0 ? <Icon name='fa-tags' value={'Tags: ' + feature.tags} /> : '';
  const warningIcon = !feature.warning ? <Icon name='fa-exclamation-triangle' value='this is some warning' /> : '';
  const iterationIcon = tags.length > 0 ? <Icon name='fa-calendar' value={'no start/end'} /> : '';

  // style the feature based on DisplayType
  let featureClassName = 'feature';
  if (props.displayType === DisplayTypes.ADDED) {
    featureClassName += ' feature-added';
  } else if (props.displayType === DisplayTypes.REMOVED) {
    featureClassName += ' feature-removed';
  }

  // truncate feature name
  const maxLength = 60;
  const trimmedName = feature.name.length > maxLength ? feature.name.substring(0, maxLength - 3) + '...' : feature.name;

  return (
    <div
      className={featureClassName}
      onClick={() => {
        props.onFeatureClicked(feature);
      }}
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1
        // cursor: 'move'
      }}
    >
      <div className='feature-name'>
        {stretchIcon}{' '}
        <a href='http://www.google.com' target='_blank' rel='noopener noreferrer' onClick={(e) => e.stopPropagation()}>
          {feature.id}
        </a>{' '}
        {trimmedName}
      </div>
      <div className='feature-icons'>
        {warningIcon}
        {tagsIcon}
        {iterationIcon}
      </div>
      <div className='feature-progress-bar'>
        <ProgressBar
          startSprint={props.startSprint}
          endSprint={props.endSprint}
          featureEndSprint={props.featureEndSprint}
          size={feature.size}
          progress={feature.progress}
          orgStartSprint={props.orgStartSprint}
          orgEndSprint={props.orgEndSprint}
          orgSize={props.orgSize}
          nrSprints={props.nrSprints}
        />
      </div>
    </div>
  );
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

// returns a 'font-awesome' icon-stack with a popover tooltip
function Icon(props) {
  return (
    <span className='tooltip'>
      <span className='fa-stack'>
        <i className='fa fa-circle fa-stack-2x' />
        <i className={props.name + ' fa fa-stack-1x fa-inverse'} />
      </span>
      <span className='tooltip-text'>{props.value}</span>
    </span>
  );
}
