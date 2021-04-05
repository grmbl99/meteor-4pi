import React from 'react';

export function ProgressBar(props) {
  const perctdone = props.size>0 ? props.done/props.size : 0;
  const perctdonestr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(perctdone);

  let orgperctdonestr='';
  let diffPerctDoneClassName='display-none';
  if (props.orgsize!==-1 && props.orgdone!==-1) {
    const orgperctdone = props.orgsize>0 ? props.orgdone/props.orgsize : 0;
    if (orgperctdone!==perctdone) {
      orgperctdonestr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(orgperctdone);
      diffPerctDoneClassName='progress-bar-diff-perctdone';
    }  
  }

  let diffStartEndClassName='display-none';
  if (props.orgstart!==-1 && props.orgwidth!==-1 &&
    (props.orgwidth!==props.width || props.orgstart!==props.start)) {
    diffStartEndClassName='progress-bar-diff-startend';
  }

  return (
    <div className={props.className}>
      <div className='progress-bar-total' style={{left: props.start+'%', width: props.width+'%'}}>
        <div className={'progress-bar-done ' + props.fillStyle} style={{width: perctdonestr}}></div>
        <div className={diffPerctDoneClassName} style={{width: orgperctdonestr}}></div>
        <div className='progress-bar-text'>
          {perctdonestr} [{props.done}/{props.size}]
        </div>
      </div>
      <div className={diffStartEndClassName} style={{left: props.orgstart+'%', width: props.orgwidth+'%'}}></div>
    </div>
  );
}