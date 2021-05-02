import React, { ReactElement } from 'react';
import { NOT_SET } from '/imports/api/constants';

export { ProgressBar };

// calculate start & duration as percentace of nr-of-sprints in a PI
function calcDuration(startSprint: number, endSprint: number, nrSprints: number) {
  let pDuration = 0;
  let pStart = 0;

  if (startSprint !== NOT_SET && endSprint !== NOT_SET && nrSprints !== 0) {
    pDuration = ((endSprint - startSprint + 1) / nrSprints) * 100;
    pStart = (startSprint / nrSprints) * 100;
  }

  return [pStart, pDuration];
}

interface ProgressBarPropTypes {
  startSprint: number;
  endSprint: number;
  featureEndSprint: number;
  size: number;
  progress: number;
  orgStartSprint: number;
  orgEndSprint: number;
  orgSize: number;
  nrSprints: number;
}

function ProgressBar(props: ProgressBarPropTypes): ReactElement {
  const perctDone = props.size > 0 ? props.progress / props.size : 0;
  const perctDoneStr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(perctDone > 1 ? 1 : perctDone);
  const sizeStr = Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(props.size);
  const progressStr = Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(
    props.progress
  );

  // determine wether to display the progress bar
  let progressBar = null;
  let [start, width] = calcDuration(props.startSprint, props.endSprint, props.nrSprints);
  if (width === 0) {
    width = 100; //no bar is displayed, use 100% of the width so text is nicely right-aligned
  } else {
    progressBar = (
      <div className='progress-bar-total' style={{ left: start + '%', width: width + '%' }}>
        <div className='progress-bar-done' style={{ width: perctDoneStr }} />
      </div>
    );
  }

  // determine whether to display the 'delta-size' badge
  let deltaBadge = null;
  if (props.orgSize !== NOT_SET) {
    const delta = props.size - props.orgSize;
    const deltaStr = Intl.NumberFormat('en-IN', { maximumFractionDigits: 1, useGrouping: false }).format(delta);
    if (delta < 0) {
      deltaBadge = <span className='delta-badge-green'> {deltaStr}</span>;
    } else if (delta > 0) {
      deltaBadge = <span className='delta-badge-red'> +{deltaStr}</span>;
    }
  }

  // determine whether to display the delta-bar
  let deltaBar = null;
  if (
    props.orgStartSprint !== NOT_SET &&
    props.orgEndSprint !== NOT_SET &&
    (props.orgStartSprint !== props.startSprint || props.orgEndSprint !== props.endSprint)
  ) {
    const [start, width] = calcDuration(props.orgStartSprint, props.orgEndSprint, props.nrSprints);
    deltaBar = <div className='delta-bar' style={{ left: start + '%', width: width + '%' }} />;
  }

  // determine whether to display the feature end marker
  let endMarker = null;
  if (props.featureEndSprint !== NOT_SET && props.featureEndSprint !== props.endSprint) {
    const [start, width] = calcDuration(0, props.featureEndSprint, props.nrSprints);
    endMarker = <div className='end-marker' style={{ left: start + '%', width: width + '%' }} />;
  }

  return (
    <div className='progress-bar'>
      {progressBar}

      <div className='progress-text' style={{ left: start + '%', width: width + '%' }}>
        {perctDoneStr} [{progressStr}/{sizeStr}
        {deltaBadge}]
      </div>

      {deltaBar}
      {endMarker}
    </div>
  );
}
