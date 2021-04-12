import React from 'react';
import PropTypes from 'prop-types';
import * as Constants from '/imports/api/constants';

export { ProgressBar };

ProgressBar.propTypes = {
  size: PropTypes.number.isRequired,
  done: PropTypes.number.isRequired,
  orgSize: PropTypes.number,
  orgDone: PropTypes.number,
  orgStart: PropTypes.number,
  orgWidth: PropTypes.number,
  width: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  className: PropTypes.string.isRequired,
  fillStyle: PropTypes.string.isRequired
};

function ProgressBar(props) {
  const perctDone = props.size>0 ? props.done/props.size : 0;
  const perctDoneStr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(perctDone);

  let orgPerctDoneStr='';
  let diffPerctDoneClassName='display-none';

  if (props.orgSize!==Constants.NOT_SET && props.orgDone!==Constants.NOT_SET) {
    const orgPerctDone = props.orgSize>0 ? props.orgDone/props.orgSize : 0;
    if (orgPerctDone!==perctDone) {
      orgPerctDoneStr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(orgPerctDone);
      diffPerctDoneClassName='progress-bar-diff-perctdone';
    }  
  }

  let diffStartEndClassName='display-none';

  if (props.orgStart!==Constants.NOT_SET && props.orgWidth!==Constants.NOT_SET &&
    (props.orgWidth!==props.width || props.orgStart!==props.start)) {
    diffStartEndClassName='progress-bar-diff-startend';
  }

  return (
    <div className={props.className}>
      <div className='progress-bar-total' style={{left: props.start+'%', width: props.width+'%'}}>
        <div className={'progress-bar-done ' + props.fillStyle} style={{width: perctDoneStr}}></div>
        <div className={diffPerctDoneClassName} style={{width: orgPerctDoneStr}}></div>
        <div className='progress-bar-text'>
          {perctDoneStr} [{props.done}/{props.size}]
        </div>
      </div>
      <div className={diffStartEndClassName} style={{left: props.orgStart+'%', width: props.orgWidth+'%'}}></div>
    </div>
  );
}