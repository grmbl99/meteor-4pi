import React, { useContext, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { PiView } from './pi-view';
import { NOT_SET } from '/imports/api/constants';
import { CollectionContext } from './context';

export { PiViewRow };

const PiViewRow = forwardRef((props, ref) => {
  const { allocations, velocities } = useContext(CollectionContext);

  function getAllocation(pi, project, team) {
    let alloc = 0;

    if (team !== '') {
      let teamVelocity = 0;
      for (const velocity of velocities) {
        if (velocity.pi === pi && velocity.team === team) {
          teamVelocity = velocity.velocity;
        }
      }

      if (project !== '') {
        let teamAllocation = 0;
        for (const allocation of allocations) {
          if (allocation.pi === pi && allocation.project === project && allocation.team === team) {
            teamAllocation = allocation.allocation;
          }
        }

        // percentage of the team-velocity allocated to a project
        alloc = teamAllocation === 0 ? 0 : (teamVelocity / 100) * teamAllocation;
      } else {
        alloc = teamVelocity;
      }
    } else {
      alloc = NOT_SET;
    }

    return alloc;
  }

  let piRow = [];
  let key = 0;
  for (const pi of props.pis) {
    const allocation = getAllocation(pi, props.projectName, props.teamName);

    piRow.push(
      <PiView
        key={key++}
        onFeatureDropped={props.onFeatureDropped}
        onFeatureClicked={props.onFeatureClicked}
        compareModeOn={props.compareModeOn}
        pi={pi}
        project={props.projectName}
        team={props.teamName}
        allocation={allocation}
      />
    );
  }

  return (
    <div ref={ref} className='pi-grid-container'>
      {piRow}
    </div>
  );
});

PiViewRow.propTypes = {
  pis: PropTypes.array.isRequired,
  projectName: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  onFeatureDropped: PropTypes.func.isRequired,
  onFeatureClicked: PropTypes.func.isRequired,
  compareModeOn: PropTypes.bool.isRequired
};

PiViewRow.displayName = 'PiViewRow';
