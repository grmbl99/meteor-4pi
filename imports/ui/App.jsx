import React, { useState, createRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Meteor } from 'meteor/meteor';
import { FeaturesCollection, DeltaFeaturesCollection, SprintsCollection, TeamsCollection, 
         ProjectsCollection, AllocationsCollection, VelocitiesCollection, ServerStatusCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { FilterForm } from './Forms.jsx';
import { UpdateFeaturePopup } from './Popups.jsx';
import { NOT_SET } from '/imports/api/Consts.jsx';
import { ServerStatus, SyncStatus } from '../api/Consts.jsx';

export function App(props) {  
  function moveFeature(featureId,pi,team,project) {
    if(!compareModeOn) {
      let updates = { 'pi': pi };
      if (project !== '') { updates['project']=project; }
      if (team !== '') { updates['team']=team; }
    
      FeaturesCollection.update({ _id: featureId },{ $set: updates});  
    }
  }
  
  function updateFeature(input) {
    setShowPopup(false);
    FeaturesCollection.update(
      {_id: input._id},
      {$set: {
        'name': input.name, 
        'size': parseInt(input.size), 
        'done': parseInt(input.done), 
        'pi': input.pi, 
        'startsprint': input.startsprint,
        'endsprint': input.endsprint 
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
    if (adsSyncState!==SyncStatus.BUSY) {
      Meteor.call('RefreshADS');
    }
  }

  function getAllocation(pi,projectname,teamname) {
    let alloc=0;
  
    if (teamname !== '') {
      let teamvelocity=0;
      for (const velocity of velocities) {
        if(velocity.pi === pi && velocity.teamname === teamname) { 
          teamvelocity = velocity.velocity;
        }
      }
  
      if (projectname !== '') {
        let teamallocation=0;
        for (const allocation of allocations) {
          if(allocation.pi === pi && allocation.projectname === projectname && allocation.teamname === teamname) { 
            teamallocation = allocation.allocation;
          }
        }
  
        // percentage of the team-velocity allocated to a project
        alloc = teamallocation === 0 ? 0 : teamvelocity/100*teamallocation;
      } else {
        alloc = teamvelocity;
      }
    } else {
      alloc=NOT_SET;
    }
        
    return(alloc);
  }

  function getFeatures() { return (FeaturesCollection.find({}).fetch()); }
  function getDeltaFeatures() { return (DeltaFeaturesCollection.find({}).fetch()); }
  function getSprints() { return (SprintsCollection.find({}).fetch()); }
  function getTeams() { return (TeamsCollection.find({}).fetch()); }
  function getProjects() { return (ProjectsCollection.find({}).fetch()); }
  function getAllocations() { return (AllocationsCollection.find({}).fetch()); }
  function getVelocities() { return (VelocitiesCollection.find({}).fetch()); }
  function getServerStatus() { return (ServerStatusCollection.find({}).fetch()); }


  const features = useTracker(getFeatures);
  const deltafeatures = useTracker(getDeltaFeatures);
  const sprints = useTracker(getSprints);
  const teams = useTracker(getTeams);
  const projects = useTracker(getProjects);
  const allocations = useTracker(getAllocations);
  const velocities = useTracker(getVelocities);
  const serverstatus = useTracker(getServerStatus);

  const [teamFilter, setTeamFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [compareModeOn, setCompareModeOn] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({
    name: '',
    pi: '',
    size: '',
    done: '',
    startsprint: '',
    endsprint: ''
  });

  let adsSyncState=SyncStatus.NONE;
  let adsSyncDate='';
  for (const status of serverstatus) {
    if (status.name === ServerStatus.ADS_SYNC_STATUS) { 
      adsSyncState=status.status; 
      adsSyncDate=status.date.toString(); 
    }
  }

  let key=0;
  let pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let teamsList=[];
  let teamsMenu=[];
  for (const team of teams) {
    const newRef = createRef();
    teamsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView();}}>{team.teamname}</div>);
    teamsList.push(<div ref={newRef} key={key++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi,projectFilter,team.teamname);

      teamsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltafeatures={deltafeatures} comparemodeon={compareModeOn} sprints={sprints} 
        pi={pi} project={projectFilter} team={team.teamname}
        allocation={allocation}/>
      );
    }
  }

  let projectsList=[];
  let projectsMenu=[];

  for (const project of projects) {
    const newRef = createRef();
    projectsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView();}}>{project.projectname}</div>);
    projectsList.push(<div ref={newRef} key={key++} className='new-row'></div>);

    for (const pi of pis) {
      const allocation = getAllocation(pi,project.projectname,teamFilter);
      
      projectsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltafeatures={deltafeatures} comparemodeon={compareModeOn} sprints={sprints} 
        pi={pi} project={project.projectname} team={teamFilter}
        allocation={allocation}/>
      );
    }
  }

  return (
    <div>
      <div className='left'>
        <div className='menu-container'>
          <div onClick={() => {refreshADS();}}>ADS Sync</div>
          <div>state: {adsSyncState}</div>
          <div>date: {adsSyncDate}</div>

          <div className='menu-heading'>Teams</div>
          <FilterForm text='Project filter' onSubmit={(input) => {setProjectFilter(input.filtername);}}/>
          {teamsMenu}
          <div className='menu-heading'>Projects</div>
          <FilterForm text='Team filter' onSubmit={(input) => {setTeamFilter(input.filtername);}}/>
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