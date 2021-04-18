import React, { useState, createRef, forwardRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Meteor } from 'meteor/meteor';
import * as Constants from '/imports/api/constants';
import * as Collections from '/imports/api/collections';
import { PiView } from './pi-view';
import { FilterForm } from './forms';
import { UpdateFeaturePopup } from './popups';

import 'react-datepicker/dist/react-datepicker.css';

export function App(props) {  
  // move a feature between teams/projects/pi's
  // (exectued using drag-and-drop)
  function moveFeature(featureId,pi,team,project) {
    if(!compareModeOn) {
      let updates = { 'pi': pi };
      if (project !== '') { updates['project']=project; }
      if (team !== '') { updates['team']=team; }
    
      Collections.FeaturesCollection.update({ _id: featureId },{ $set: updates});  
    }
  }
  
  // store updated feature
  // executed when closing the feature-update modal dialog
  function updateFeature(input) {
    setShowPopup(false);
    Collections.FeaturesCollection.update(
      {_id: input._id},
      {$set: {
        'name': input.name, 
        'size': parseInt(input.size), 
        'done': parseInt(input.done), 
        'pi': input.pi, 
        'startSprint': input.startSprint,
        'endSprint': input.endSprint 
      }}
    );
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
    if (adsSyncStatus!==Constants.SyncStatus.BUSY) {
      Meteor.call('RefreshADS');
      setCompareModeOn(false);
    }
  }

  // call method on server to refresh compare data from ADS
  function refreshCompareADS(date) {
    if (adsCompareSyncStatus!==Constants.SyncStatus.BUSY) {
      Meteor.call('RefreshCompareADS', date);
      setCompareModeOn(true);
    }
  }
  
  function getAllocation(pi,project,team) {
    let alloc=0;
  
    if (team !== '') {
      let teamVelocity=0;
      for (const velocity of velocities) {
        if(velocity.pi === pi && velocity.team === team) { 
          teamVelocity = velocity.velocity;
        }
      }
  
      if (project !== '') {
        let teamAllocation=0;
        for (const allocation of allocations) {
          if(allocation.pi === pi && allocation.project === project && allocation.team === team) { 
            teamAllocation = allocation.allocation;
          }
        }
  
        // percentage of the team-velocity allocated to a project
        alloc = teamAllocation === 0 ? 0 : teamVelocity/100*teamAllocation;
      } else {
        alloc = teamVelocity;
      }
    } else {
      alloc=Constants.NOT_SET;
    }
        
    return(alloc);
  }

  // useTracker to get react state tracking on meteor/mongo collections 
  const features = useTracker(() => Collections.FeaturesCollection.find({}).fetch());
  const deltaFeatures = useTracker(() => Collections.DeltaFeaturesCollection.find({}).fetch());
  const iterations = useTracker(() => Collections.IterationsCollection.find({}).fetch());
  const teams = useTracker(() => Collections.TeamsCollection.find({}).fetch());
  const projects = useTracker(() => Collections.ProjectsCollection.find({}).fetch());
  const allocations = useTracker(() => Collections.AllocationsCollection.find({}).fetch());
  const velocities = useTracker(() => Collections.VelocitiesCollection.find({}).fetch());
  const serverStatus = useTracker(() => Collections.ServerStatusCollection.find({}).fetch());

  // react state
  const [teamFilter, setTeamFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [compareModeOn, setCompareModeOn] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({
    name: '', pi: '', size: '', done: '', startSprint: '', endSprint: ''
  });

  // get the server state (azure sync status & dates) from server
  let adsSyncStatus=Constants.SyncStatus.NONE;
  let adsCompareSyncStatus=Constants.SyncStatus.NONE;
  let adsSyncDate='';
  let adsCompareSyncDate='';
  let startDate='';
  for (const status of serverStatus) {
    if (status.key === Constants.ServerStatus.ADS_SYNC_STATUS) { 
      adsSyncStatus=status.value; 
      adsSyncDate=format(status.date, 'EEE MMM d yyyy HH:mm.ss');
    } else if (status.key === Constants.ServerStatus.ADS_COMPARE_SYNC_STATUS) {
      adsCompareSyncStatus=status.value; 
      adsCompareSyncDate=format(status.date, 'EEE MMM d yyyy HH:mm.ss');
    } else if (status.key === Constants.ServerStatus.ADS_COMPARE_DATE) {
      startDate=status.value;
    }
  }

  let pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let menuEntryKey=0;
  let teamsList=[]; // set of PIView's per team
  let teamsMenu=[]; // used as navigation buttons on left-side of screen

  for (const team of teams) {
    const newRef = createRef();
    teamsMenu.push(<div className='menu-item' key={menuEntryKey} onClick={() => {newRef.current.scrollIntoView();}}>{team.name}</div>);
    teamsList.push(<div ref={newRef} key={menuEntryKey++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi,projectFilter,team.name);

      teamsList.push(<PiView 
        key={menuEntryKey++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltaFeatures={deltaFeatures} compareModeOn={compareModeOn} iterations={iterations} 
        pi={pi} project={projectFilter} team={team.name}
        allocation={allocation}/>
      );
    }
  }

  let projectsList=[]; // set of PIView's per project
  let projectsMenu=[]; // used as navigation buttons on left-side of screen

  for (const project of projects) {
    const newRef = createRef();
    projectsMenu.push(<div className='menu-item' key={menuEntryKey} onClick={() => {newRef.current.scrollIntoView();}}>{project.name}</div>);
    projectsList.push(<div ref={newRef} key={menuEntryKey++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi,project.name,teamFilter);
      
      projectsList.push(<PiView 
        key={menuEntryKey++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltaFeatures={deltaFeatures} compareModeOn={compareModeOn} iterations={iterations} 
        pi={pi} project={project.name} team={teamFilter}
        allocation={allocation}/>
      );
    }
  }

  // to show/hide 'loading' indicators
  const loadingClassName = adsSyncStatus===Constants.SyncStatus.BUSY ? 'ads-loading' : 'ads-sync-date';
  const compareLoadingClassName = adsCompareSyncStatus===Constants.SyncStatus.BUSY ? 'ads-loading' : 'ads-sync-date';
  const adsSyncClassName = adsSyncStatus===Constants.SyncStatus.FAILED ? 'menu-item menu-item-red' : 'menu-item';

  // to use a custom button with the react-datepicker, we need to create it as a 'forwardRef'
  const PickDateButton = forwardRef(
    ({ value, onClick, syncStatus }, ref) => {

      const adsCompareSyncClassName = syncStatus===Constants.SyncStatus.FAILED ? 'menu-item menu-item-red' : 'menu-item';
      const statusStr = syncStatus===Constants.SyncStatus.OK ? value : syncStatus;
    
      return(<div className={adsCompareSyncClassName} ref={ref} onClick={onClick}>Compare: {statusStr}</div>);
    }
  );
  PickDateButton.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string,
    syncStatus: PropTypes.string.isRequired
  };
  PickDateButton.displayName = 'PickDateButton';

  return (
    <div>
      <div className='left'>
        <div className='menu-container'>
          <div className={adsSyncClassName} onClick={refreshADS}>ADS Sync: {adsSyncStatus}</div>
          <div className={loadingClassName}>{adsSyncDate}</div>

          <DatePicker 
            selected={startDate} 
            showWeekNumbers 
            onChange={date => refreshCompareADS(date)}
            customInput={<PickDateButton syncStatus={adsCompareSyncStatus}/>}
          />
          <div>show: <input type="checkbox" checked={compareModeOn} onChange={toggleCompareMode}/></div>
          <div className={compareLoadingClassName}>{adsCompareSyncDate}</div>

          <div className='menu-heading'>Teams</div>
          <FilterForm text='Project filter' onSubmit={input => setProjectFilter(input.filterName)}/>
          {teamsMenu}

          <div className='menu-heading'>Projects</div>
          <FilterForm text='Team filter' onSubmit={input => setTeamFilter(input.filterName)}/>
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
        <UpdateFeaturePopup show={showPopup} feature={selectedFeature} onSubmit={updateFeature}/>
      </div>
    </div>
  );  
}