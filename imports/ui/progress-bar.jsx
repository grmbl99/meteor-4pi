import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from '/imports/api/constants';

export { ProgressBar };

ProgressBar.propTypes = {
  start: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  duration2: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  done: PropTypes.number.isRequired,
  orgStart: PropTypes.number.isRequired,
  orgDuration: PropTypes.number.isRequired,
  orgSize: PropTypes.number.isRequired
};

function ProgressBar(props) {
  const perctDone = props.size>0 ? props.done/props.size : 0;
  const perctDoneStr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(perctDone);
  const sizeStr=Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(props.size);
  const doneStr=Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(props.done);

  // determine wether to display the progress bar
  let progressBar='';
  let width = props.duration;
  if (props.start===0 && props.duration===0) {
    width=100; //no bar is displayed, use 100% of the width so text is nicly right-aligned
  } else {
    progressBar=
      <div className='progress-bar-total' style={{left: props.start+'%', width: width+'%'}}>
        <div className='progress-bar-done' style={{width: perctDoneStr}}/>
      </div>;
  }

  // determine whether to display the 'delta-size' badge
  let deltaBadge='';
  if (props.orgSize!==Constants.NOT_SET) {
    const delta=props.size - props.orgSize;
    const deltaStr=Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(delta);
    if (delta<0) {
      deltaBadge=<span className='inline-badge inline-badge-green'> {deltaStr}</span>;
    } else if (delta>0) {
      deltaBadge=<span className='inline-badge inline-badge-red'> +{deltaStr}</span>;
    }
  }

  // determine whether to display the delta-bar
  let deltaBar='';  
  if (props.orgStart!==Constants.NOT_SET && props.orgDuration!==Constants.NOT_SET &&
    (props.orgDuration!==props.duration || props.orgStart!==props.start)) {
      deltaBar=<div className='delta-bar' style={{left: props.orgStart+'%', width: props.orgDuration+'%'}}/>;
  }

  // determine whether to display the feature end marker
  let endMarker='';
  if (props.duration2!==Constants.NOT_SET) {
    endMarker=<div className='end-marker' style={{left: props.start+'%', width: props.duration2+'%'}}/>;
  }

  return (
      <div className='progress-bar'>
        {progressBar}

        <div className='progress-text' style={{left: props.start+'%', width: width+'%'}}>
          {perctDoneStr} [{doneStr}/{sizeStr}{deltaBadge}]
        </div>

        {deltaBar}
        {endMarker}
      </div>
  );
}