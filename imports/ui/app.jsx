import React, { useState, createRef, forwardRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Meteor } from 'meteor/meteor';
import { PiView } from './pi-view';
import { FilterForm } from './forms';
import { UpdateFeaturePopup } from './popups';
import { SyncStatus, ServerStatus, NOT_SET } from '/imports/api/constants';
import { getServerStatus } from '/imports/api/server-status';
import {
  FeaturesCollection,
  DeltaFeaturesCollection,
  IterationsCollection,
  ProjectsCollection,
  TeamsCollection,
  AllocationsCollection,
  VelocitiesCollection,
  ServerStatusCollection
} from '/imports/api/collections';

import 'react-datepicker/dist/react-datepicker.css';

export function App(props) {
  // move a feature between teams/projects/pi's
  // (exectued using drag-and-drop)
  function moveFeature(featureId, pi, team, project) {
    if (!compareModeOn) {
      let updates = { pi: pi };
      if (project !== '') {
        updates['project'] = project;
      }
      if (team !== '') {
        updates['team'] = team;
      }

      Meteor.call('MoveFeature', featureId, updates);
    }
  }

  // store updated feature
  // executed when closing the feature-update modal dialog
  function updateFeature(input) {
    setShowPopup(false);
    Meteor.call('UpdateFeature', input);
  }

  // show feature-update modal dialog
  // executed when clicking on a feature
  function editFeature(feature) {
    if (!compareModeOn) {
      setSelectedFeature(feature);
      setShowPopup(true);
    }
  }

  // call method on server to update delta's
  function toggleCompareMode(event) {
    if (!compareModeOn) {
      setCompareModeOn(true);
      Meteor.call('UpdateDeltaFeatureCollection');
    } else {
      setCompareModeOn(false);
    }
  }

  // call method on server to refresh data from ADS
  function refreshADS(event) {
    if (adsSyncStatus !== SyncStatus.BUSY) {
      Meteor.call('RefreshADS');
      setCompareModeOn(false);
    }
  }

  // call method on server to refresh compare data from ADS
  function refreshCompareADS(date) {
    if (adsSyncStatus !== SyncStatus.BUSY) {
      Meteor.call('RefreshCompareADS', date);
      setCompareModeOn(true);
    }
  }

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

  // subscribe to server collections, with useTracker for 'reactiveness'
  const features = useTracker(() => {
    Meteor.subscribe('features');
    return FeaturesCollection.find({}, { sort: { priority: 1 } }).fetch();
  });
  const deltaFeatures = useTracker(() => {
    Meteor.subscribe('deltafeatures');
    return DeltaFeaturesCollection.find({}).fetch();
  });
  const iterations = useTracker(() => {
    Meteor.subscribe('iterations');
    return IterationsCollection.find({}).fetch();
  });
  const teams = useTracker(() => {
    Meteor.subscribe('teams');
    return TeamsCollection.find({}, { sort: { name: 1 } }).fetch();
  });
  const projects = useTracker(() => {
    Meteor.subscribe('projects');
    return ProjectsCollection.find({}, { sort: { name: 1 } }).fetch();
  });
  const allocations = useTracker(() => {
    Meteor.subscribe('allocations');
    return AllocationsCollection.find({}).fetch();
  });
  const velocities = useTracker(() => {
    Meteor.subscribe('velocities');
    return VelocitiesCollection.find({}).fetch();
  });
  useTracker(() => {
    Meteor.subscribe('serverstatus');
    return ServerStatusCollection.find({}).fetch();
  });

  // react state
  const [teamFilter, setTeamFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [compareModeOn, setCompareModeOn] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({
    name: '',
    pi: '',
    size: '',
    progress: '',
    startSprint: '',
    endSprint: ''
  });

  // get the server state (azure sync status & dates) from server
  const adsSyncStatus = getServerStatus(ServerStatus.ADS_SYNC_STATUS);
  const compareDate = getServerStatus(ServerStatus.ADS_COMPARE_DATE);
  let adsSyncDate = getServerStatus(ServerStatus.ADS_SYNC_DATE);
  adsSyncDate = adsSyncDate ? format(adsSyncDate, 'EEE MMM d yyyy HH:mm.ss') : '';
  let adsCompareSyncDate = getServerStatus(ServerStatus.ADS_COMPARE_SYNC_DATE);
  adsCompareSyncDate = adsCompareSyncDate ? format(adsCompareSyncDate, 'EEE MMM d yyyy HH:mm.ss') : '';

  let pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let menuEntryKey = 0;
  let teamsList = []; // set of PIView's per team
  let teamsMenu = []; // used as navigation buttons on left-side of screen

  for (const team of teams) {
    const newRef = createRef();
    teamsMenu.push(
      <div
        className='menu-item'
        key={menuEntryKey}
        onClick={() => {
          newRef.current.scrollIntoView();
        }}
      >
        {team.name}
      </div>
    );
    teamsList.push(<div ref={newRef} key={menuEntryKey++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi, projectFilter, team.name);

      teamsList.push(
        <PiView
          key={menuEntryKey++}
          onFeatureDropped={moveFeature}
          onFeatureClicked={editFeature}
          features={features}
          deltaFeatures={deltaFeatures}
          compareModeOn={compareModeOn}
          iterations={iterations}
          pi={pi}
          project={projectFilter}
          team={team.name}
          allocation={allocation}
        />
      );
    }
  }

  let projectsList = []; // set of PIView's per project
  let projectsMenu = []; // used as navigation buttons on left-side of screen

  for (const project of projects) {
    const newRef = createRef();
    projectsMenu.push(
      <div
        className='menu-item'
        key={menuEntryKey}
        onClick={() => {
          newRef.current.scrollIntoView();
        }}
      >
        {project.name}
      </div>
    );
    projectsList.push(<div ref={newRef} key={menuEntryKey++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi, project.name, teamFilter);

      projectsList.push(
        <PiView
          key={menuEntryKey++}
          onFeatureDropped={moveFeature}
          onFeatureClicked={editFeature}
          features={features}
          deltaFeatures={deltaFeatures}
          compareModeOn={compareModeOn}
          iterations={iterations}
          pi={pi}
          project={project.name}
          team={teamFilter}
          allocation={allocation}
        />
      );
    }
  }

  // to show/hide 'loading' indicators
  const loadingClassName = adsSyncStatus === SyncStatus.BUSY ? 'ads-loading' : 'ads-loading-empty';
  const adsSyncClassName = adsSyncStatus === SyncStatus.FAILED ? 'menu-item menu-item-red' : 'menu-item';

  // to use a custom button with the react-datepicker, we need to create it as a 'forwardRef'
  const PickDateButton = forwardRef(({ value, onClick }, ref) => {
    return (
      <div className='menu-item' ref={ref} onClick={onClick}>
        Compare: {value}
      </div>
    );
  });
  PickDateButton.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string,
    syncStatus: PropTypes.string
  };
  PickDateButton.displayName = 'PickDateButton';

  return (
    <div>
      <div className='left'>
        <div className='menu-container'>
          <div className={adsSyncClassName} onClick={refreshADS}>
            ADS Sync: {adsSyncStatus}
          </div>
          <div className='ads-sync-date'>{adsSyncDate}</div>

          <DatePicker
            selected={compareDate}
            showWeekNumbers
            onChange={(date) => refreshCompareADS(date)}
            customInput={<PickDateButton />}
          />
          <div className='ads-sync-date'>{adsCompareSyncDate}</div>
          <div>
            Compare: <input type='checkbox' checked={compareModeOn} onChange={toggleCompareMode} />
          </div>
          <div className={loadingClassName} />

          <div className='menu-heading'>Teams</div>
          <FilterForm text='Project filter' onSubmit={(input) => setProjectFilter(input.filterName)} />
          {teamsMenu}

          <div className='menu-heading'>Projects</div>
          <FilterForm text='Team filter' onSubmit={(input) => setTeamFilter(input.filterName)} />
          {projectsMenu}
        </div>
      </div>
      <div className='right'>
        <DndProvider backend={HTML5Backend}>
          <div className='pi-grid-container'>
            <div className='heading'>Project Manager View</div>
            {teamsList}
            <div className='heading'>Product Owner View</div>
            {projectsList}
          </div>
        </DndProvider>
        <UpdateFeaturePopup show={showPopup} feature={selectedFeature} onSubmit={updateFeature} />
      </div>
    </div>
  );
}
