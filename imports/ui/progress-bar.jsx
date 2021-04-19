import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from '/imports/api/constants';

export { ProgressBar };

// calculate start & duration as percentace of nr-of-sprints in a PI
function calcDuration(startSprint,endSprint,nrSprints) {
  let pDuration=0;
  let pStart=0;

  if (startSprint!==Constants.NOT_SET && endSprint!==Constants.NOT_SET && nrSprints!==0) {
    pDuration=(endSprint-startSprint+1)/nrSprints*100;
    pStart=startSprint/nrSprints*100;
  }

  return([pStart,pDuration]);
}


ProgressBar.propTypes = {
  startSprint: PropTypes.number.isRequired,
  endSprint: PropTypes.number.isRequired,
  featureEndSprint: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  orgStartSprint: PropTypes.number.isRequired,
  orgEndSprint: PropTypes.number.isRequired,
  orgSize: PropTypes.number.isRequired,
  nrSprints: PropTypes.number.isRequired
};

function ProgressBar(props) {
  let perctDone = props.size>0 ? props.progress/props.size : 0;
  const perctDoneStr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(perctDone > 1 ? 1 : perctDone);
  const sizeStr=Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(props.size);
  const progressStr=Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(props.progress);

  // determine wether to display the progress bar
  let progressBar='';
  let [start,width] = calcDuration(props.startSprint,props.endSprint,props.nrSprints);
  if (width===0) {
    width=100; //no bar is displayed, use 100% of the width so text is nicely right-aligned
  } else {
    progressBar=
      <div className='progress-bar-total' style={{left: start+'%', width: width+'%'}}>
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
  if (props.orgStartSprint!==Constants.NOT_SET && props.orgEndSprint!==Constants.NOT_SET &&
    (props.orgStartSprint!==props.startSprint || props.orgEndSprint!==props.endSprint)) {
      let [start,width] = calcDuration(props.orgStartSprint,props.orgEndSprint,props.nrSprints);
      deltaBar=<div className='delta-bar' style={{left: start+'%', width: width+'%'}}/>;
  }

  // determine whether to display the feature end marker
  let endMarker='';
  if (props.featureEndSprint!==Constants.NOT_SET && props.featureEndSprint!==props.endSprint) {
    let [start,width] = calcDuration(props.startSprint,props.featureEndSprint,props.nrSprints);
    endMarker=<div className='end-marker' style={{left: start+'%', width: width+'%'}}/>;
  }

  return (
      <div className='progress-bar'>
        {progressBar}

        <div className='progress-text' style={{left: start+'%', width: width+'%'}}>
          {perctDoneStr} [{progressStr}/{sizeStr}{deltaBadge}]
        </div>

        {deltaBar}
        {endMarker}
      </div>
  );
}