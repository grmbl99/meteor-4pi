import React from 'react';

export function ProgressBar(props) {
  const perctdone = props.size>0 ? props.done/props.size : 0;
  const perctdonestr = Intl.NumberFormat('en-IN', { style: 'percent' }).format(perctdone);

  return (
    <div className={props.className}>
      <div className='progress-bar-total' style={{left: props.start+'%', width: props.width+'%'}}>
        <div className={'progress-bar-done ' + props.fillStyle} style={{width: perctdonestr}}>
        </div>
        <div className='progress-bar-text'>
          {perctdonestr} [{props.done}/{props.size}]
        </div>
      </div>
    </div>
  );
}