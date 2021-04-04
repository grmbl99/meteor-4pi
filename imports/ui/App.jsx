import React, { useState, createRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Meteor } from 'meteor/meteor';
import { FeaturesCollection, DeltaFeaturesCollection, SprintsCollection, TeamsCollection, 
         ProjectsCollection, AllocationsCollection, VelocitiesCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { FilterForm } from './Forms.jsx';
import { UpdateFeaturePopup } from './Popups.jsx';

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

  function getTeamVelocityAndAllocation(pi,projectname,teamname) {
    let teamvelocity=0;
    let teamallocation=0;
  
    if (teamname !== '') {
      for (const velocity of velocities) {
        if(velocity.pi === pi && velocity.teamname === teamname) { 
          teamvelocity = velocity.velocity;
        }
      }
  
      if (projectname !== '') {
        for (const allocation of allocations) {
          if(allocation.pi === pi && allocation.projectname === projectname && allocation.teamname === teamname) { 
            teamallocation = allocation.allocation;
          }
        }
  
        // return velocity based on allocation percentage
        teamvelocity = teamallocation === 0 ? 0 : teamvelocity/teamallocation;  
      } else {
        teamallocation=-1;
      }
    } else {
      teamvelocity=-1;
      teamallocation=-1;
    }
        
    return{teamvelocity,teamallocation}
  }

  function getFeatures() { return (FeaturesCollection.find({}).fetch()); }
  function getDeltaFeatures() { return (DeltaFeaturesCollection.find({}).fetch()); }
  function getSprints() { return (SprintsCollection.find({}).fetch()); }
  function getTeams() { return (TeamsCollection.find({}).fetch()); }
  function getProjects() { return (ProjectsCollection.find({}).fetch()); }
  function getAllocations() { return (AllocationsCollection.find({}).fetch()); }
  function getVelocities() { return (VelocitiesCollection.find({}).fetch()); }

  const features = useTracker(getFeatures);
  const deltafeatures = useTracker(getDeltaFeatures);
  const sprints = useTracker(getSprints);
  const teams = useTracker(getTeams);
  const projects = useTracker(getProjects);
  const allocations = useTracker(getAllocations);
  const velocities = useTracker(getVelocities);

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

  let key=0;
  let pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let teamsList=[];
  let teamsMenu=[];
  for (const team of teams) {
    const newRef = createRef();
    teamsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView()}}>{team.teamname}</div>);
    teamsList.push(<div ref={newRef} key={key++} className='new-row'></div>);

    for (const pi of pis) {
      let {teamvelocity,teamallocation} = getTeamVelocityAndAllocation(pi,projectFilter,team.teamname);

      teamsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltafeatures={deltafeatures} comparemodeon={compareModeOn} sprints={sprints} 
        pi={pi} project={projectFilter} team={team.teamname}
        allocation={teamallocation} velocity={teamvelocity}/>
      );
    }
  }

  let projectsList=[];
  let projectsMenu=[];

  for (const project of projects) {
    const newRef = createRef();
    projectsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView()}}>{project.projectname}</div>);
    projectsList.push(<div ref={newRef} key={key++} className='new-row'></div>);

    for (const pi of pis) {
      let {teamvelocity,teamallocation} = getTeamVelocityAndAllocation(pi,project.projectname,teamFilter);
      
      projectsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltafeatures={deltafeatures} comparemodeon={compareModeOn} sprints={sprints} 
        pi={pi} project={project.projectname} team={teamFilter}
        allocation={teamallocation} velocity={teamvelocity}/>
      );
    }
  }

  return (
    <div className='container'>
      <div className='left'>
        <div className='menu-container'>
          <div className='menu-heading'>Teams</div>
          <FilterForm text='Project filter' onSubmit={(input) => {setProjectFilter(input.filtername)}}/>
          {teamsMenu}
          <div className='menu-heading'>Projects</div>
          <FilterForm text='Team filter' onSubmit={(input) => {setTeamFilter(input.filtername)}}/>
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