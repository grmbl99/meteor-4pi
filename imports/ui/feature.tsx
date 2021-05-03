import React, { ReactElement } from 'react';
import { Meteor } from 'meteor/meteor';
import { useDrag } from 'react-dnd';
import { DisplayTypes, ItemTypes, ADSFields } from '/imports/api/constants';
import { ProgressBar } from './progress-bar';
import { OnFeatureClickType } from '/imports/api/types';
import { FeatureType } from '/imports/api/collections';

export { Feature };

interface FeaturePropTypes {
  feature: FeatureType;
  displayType: string;
  onFeatureClicked: OnFeatureClickType;
  startSprint: number;
  endSprint: number;
  featureEndSprint: number;
  orgStartSprint: number;
  orgEndSprint: number;
  orgFeatureEndSprint: number; //not used to display anything at the moment
  orgSize: number;
  orgProgress: number;
  nrSprints: number;
  startEndMsg?: string;
}

function Feature(props: FeaturePropTypes): ReactElement {
  const feature = props.feature;

  // feature drag-and-drop logic
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FEATURE,
    item: { id: feature._id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }));

  const tags = feature.tags ? feature.tags.toLowerCase().split('; ') : [];

  let warningMsg = '';
  if (feature.size !== feature.featureSize) {
    const storySizeStr = Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(
      feature.size
    );
    const featureSizeStr = Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(
      feature.featureSize
    );
    warningMsg += 'story-size=' + storySizeStr + ',  feature-size=' + featureSizeStr;
  }

  const stretchIcon = tags.includes(ADSFields.STRETCH) ? <i className='fas fa-gift' /> : '';
  const tagsIcon = tags.length > 0 ? <Icon name='fa-tags' value={'Tags: ' + feature.tags} /> : '';
  const warningIcon = warningMsg ? <Icon name='fa-exclamation-triangle' value={warningMsg} /> : '';
  const calendarIcon = props.startEndMsg ? <Icon name='fa-calendar' value={props.startEndMsg} /> : '';

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

  // workitem URL
  const workItemUrl =
    Meteor.settings.public.ADSUrl + Meteor.settings.public.ADSProject + '/_workitems/edit/' + feature.id;

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
        <a href={workItemUrl} target='_blank' rel='noopener noreferrer' onClick={(e) => e.stopPropagation()}>
          {feature.id}
        </a>{' '}
        {trimmedName}
      </div>
      <div className='feature-icons'>
        {warningIcon}
        {tagsIcon}
        {calendarIcon}
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

interface IconPropTypes {
  name: string;
  value: string;
}

// returns a 'font-awesome' icon-stack with a popover tooltip
function Icon(props: IconPropTypes) {
  return (
    <span className='tooltip'>
      <span className='fa-stack'>
        <i className='fas fa-circle fa-stack-2x' />
        <i className={'fas ' + props.name + ' fa-stack-1x fa-inverse'} />
      </span>
      <span className='tooltip-text'>{props.value}</span>
    </span>
  );
}
