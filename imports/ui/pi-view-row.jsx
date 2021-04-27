import React from 'react';
import PropTypes from 'prop-types';
import { PiView } from './pi-view';
import { NOT_SET } from '/imports/api/constants';
import { CollectionContext } from './context';
import { ADSConfig } from '../api/constants';

export { PiViewRow };

const PiViewRow = React.forwardRef((props, ref) => {
  const { velocityPlan } = React.useContext(CollectionContext);
  const [piFeaturesDisplayed, setPiFeaturesDisplayed] = React.useState({});
  const [featuresDisplayed, setFeaturedDisplayed] = React.useState(0);

  // callback from 'PiView' to get the number of displayed features per PI
  // this is used to hide the complete row when there are no features to display
  // (i.e. maxFeatures === 0)
  function onFeaturesDisplayed(pi, nr) {
    const pfd = piFeaturesDisplayed;
    pfd[pi] = nr;
    setPiFeaturesDisplayed(pfd);
    setFeaturedDisplayed(Object.values(pfd).reduce((a, b) => (a > b ? a : b)));
  }

  function getAllocation(pi, project, team) {
    let alloc = 0;

    if (team !== '') {
      let teamVelocity = 0;
      for (const planItem of velocityPlan) {
        if (planItem.pi === pi && planItem.team === team && planItem.project === ADSConfig.VELOCITY_PLAN_PROJECT) {
          teamVelocity = planItem.value;
        }
      }

      if (project !== '') {
        let teamAllocation = 0;
        for (const planItem of velocityPlan) {
          if (planItem.pi === pi && planItem.project === project && planItem.team === team) {
            teamAllocation = planItem.value;
          }
        }

        // percentage of the team-velocity allocated to a project
        alloc = teamVelocity * teamAllocation;
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
        onFeaturesDisplayed={onFeaturesDisplayed}
      />
    );
  }

  return (
    <div ref={ref} className={featuresDisplayed === 0 ? 'display-none' : 'pi-grid-container'}>
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
