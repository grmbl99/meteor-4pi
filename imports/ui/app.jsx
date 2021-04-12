import React, { useState, createRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Meteor } from 'meteor/meteor';
import * as Constants from '/imports/api/constants';
import * as Collections from '/imports/api/collections';
import { PiView } from './pi-view';
import { FilterForm } from './forms';
import { UpdateFeaturePopup } from './popups';

export function App(props) {  
  function moveFeature(featureId,pi,team,project) {
    if(!compareModeOn) {
      let updates = { 'pi': pi };
      if (project !== '') { updates['project']=project; }
      if (team !== '') { updates['team']=team; }
    
      Collections.FeaturesCollection.update({ _id: featureId },{ $set: updates});  
    }
  }
  
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
  
  function editFeature(feature) {
    if (!compareModeOn) {
      setSelectedFeature(feature);
      setShowPopup(true);
    }
  }

  function toggleCompareMode(event) {
    if (!compareModeOn) {
      setCompareModeOn(true);
      Meteor.call('UpdateDeltaFeatureCollection');
    } else {
      setCompareModeOn(false);
    }
  }

  function refreshADS(event) {
    if (adsSyncStatus!==Constants.SyncStatus.BUSY) {
      Meteor.call('RefreshADS');
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

  function getFeatures() { return (Collections.FeaturesCollection.find({}).fetch()); }
  function getDeltaFeatures() { return (Collections.DeltaFeaturesCollection.find({}).fetch()); }
  function getIterations() { return (Collections.IterationsCollection.find({}).fetch()); }
  function getTeams() { return (Collections.TeamsCollection.find({}).fetch()); }
  function getProjects() { return (Collections.ProjectsCollection.find({}).fetch()); }
  function getAllocations() { return (Collections.AllocationsCollection.find({}).fetch()); }
  function getVelocities() { return (Collections.VelocitiesCollection.find({}).fetch()); }
  function getServerStatus() { return (Collections.ServerStatusCollection.find({}).fetch()); }

  const features = useTracker(getFeatures);
  const deltaFeatures = useTracker(getDeltaFeatures);
  const iterations = useTracker(getIterations);
  const teams = useTracker(getTeams);
  const projects = useTracker(getProjects);
  const allocations = useTracker(getAllocations);
  const velocities = useTracker(getVelocities);
  const serverStatus = useTracker(getServerStatus);

  const [teamFilter, setTeamFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [compareModeOn, setCompareModeOn] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({
    name: '',
    pi: '',
    size: '',
    done: '',
    startSprint: '',
    endSprint: ''
  });

  let adsSyncStatus=Constants.SyncStatus.NONE;
  let adsSyncDate='';
  for (const status of serverStatus) {
    if (status.key === Constants.ServerStatus.ADS_SYNC_STATUS) { 
      adsSyncStatus=status.value; 
      adsSyncDate=status.date.toString();
    }
  }

  let key=0;
  let pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let teamsList=[];
  let teamsMenu=[];
  for (const team of teams) {
    const newRef = createRef();
    teamsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView();}}>{team.name}</div>);
    teamsList.push(<div ref={newRef} key={key++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi,projectFilter,team.name);

      teamsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltaFeatures={deltaFeatures} compareModeOn={compareModeOn} iterations={iterations} 
        pi={pi} project={projectFilter} team={team.name}
        allocation={allocation}/>
      );
    }
  }

  let projectsList=[];
  let projectsMenu=[];

  for (const project of projects) {
    const newRef = createRef();
    projectsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView();}}>{project.name}</div>);
    projectsList.push(<div ref={newRef} key={key++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi,project.name,teamFilter);
      
      projectsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltaFeatures={deltaFeatures} compareModeOn={compareModeOn} iterations={iterations} 
        pi={pi} project={project.name} team={teamFilter}
        allocation={allocation}/>
      );
    }
  }

  const loadingClassName = adsSyncStatus===Constants.SyncStatus.BUSY ? 'ads-loading' : 'ads-sync-date';
  const adsSyncClassName = adsSyncStatus===Constants.SyncStatus.FAILED ? 'menu-item menu-item-red' : 'menu-item';

  return (
    <div>
      <div className='left'>
        <div className='menu-container'>
          <div className={adsSyncClassName} onClick={() => {refreshADS();}}>ADS Sync: {adsSyncStatus}</div>
          <div className={loadingClassName}>{adsSyncDate}</div>

          <div className='menu-heading'>Teams</div>
          <FilterForm text='Project filter' onSubmit={(input) => {setProjectFilter(input.filterName);}}/>
          {teamsMenu}
          <div className='menu-heading'>Projects</div>
          <FilterForm text='Team filter' onSubmit={(input) => {setTeamFilter(input.filterName);}}/>
          {projectsMenu}
          <div>compare: <input type="checkbox" checked={compareModeOn} onChange={toggleCompareMode}/></div>
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