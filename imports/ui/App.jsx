import React, { useState, createRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FeaturesCollection, DeltaFeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection, AllocationCollection, VelocityCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { FilterForm } from './Forms.jsx';
import { UpdateFeaturePopup } from './Popups.jsx';

export function App(props) {
  const features = useTracker(getFeatures);
  const deltafeatures = useTracker(getDeltaFeatures);
  const sprints = useTracker(getSprints);
  const teams = useTracker(getTeams);
  const projects = useTracker(getProjects);
  const allocation = useTracker(getAllocation);
  const velocity = useTracker(getVelocity);

  function getFeatures() { return (FeaturesCollection.find({}).fetch()); }
  function getDeltaFeatures() { return (DeltaFeaturesCollection.find({}).fetch()); }
  function getSprints() { return (SprintsCollection.find({}).fetch()); }
  function getTeams() { return (TeamsCollection.find({}).fetch()); }
  function getProjects() {return (ProjectsCollection.find({}).fetch()); }
  function getAllocation() {return (AllocationCollection.find({}).fetch()); }
  function getVelocity() {return (VelocityCollection.find({}).fetch()); }

  const [teamFilter, setTeamFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({
    name: '',
    pi: '',
    size: '',
    done: '',
    startsprint: '',
    endsprint: ''
  });

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
    console.log('update: ' + input._id);
  }

  function editFeature(feature) {
    setSelectedFeature(feature);
    setShowPopup(true);
  }

  function moveFeature(featureId,pi,team,project) {
    let updates = { 'pi': pi };
    if (project !== '') { updates['project']=project; }
    if (team !== '') { updates['team']=team; }

    FeaturesCollection.update({ _id: featureId },{ $set: updates});
  };

  function getTeamVelocityAndAllocation(pi,projectname,teamname) {
    let vel=0;
    let alloc=0;

    if (teamname !== '') {
      velocity.forEach(entry => {
        if(entry.pi === pi && entry.teamname === teamname) { 
          vel = entry.velocity;
        }
      });

      if (projectname !== '') {
        allocation.forEach(entry => {
          if(entry.pi === pi && entry.projectname === projectname && entry.teamname === teamname) { 
            alloc = entry.allocation;
          }
        });

        // return velocity based on allocation percentage
        vel = alloc === 0 ? 0 : vel/alloc;  
      } else {
        alloc=-1;
      }
    } else {
      vel=-1;
      alloc=-1;
    }
        
    return{vel,alloc}
  };

  let key=0;
  let pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let teamsList=[];
  let teamsMenu=[];
  teams.forEach(team => {
    const newRef = createRef();
    teamsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView()}}>{team.teamname}</div>);
    teamsList.push(<div ref={newRef} key={key++} className='new-row'></div>)

    pis.forEach(pi => {
      let {vel,alloc} = getTeamVelocityAndAllocation(pi,projectFilter,team.teamname);

      teamsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltafeatures={deltafeatures} sprints={sprints} 
        pi={pi} project={projectFilter} team={team.teamname}
        allocation={alloc} velocity={vel}/>
      );
    });
  });

  let projectsList=[];
  let projectsMenu=[];
  projects.forEach(project => {
    const newRef = createRef();
    projectsMenu.push(<div className='menu-item' key={key} onClick={() => {newRef.current.scrollIntoView()}}>{project.projectname}</div>);
    projectsList.push(<div ref={newRef} key={key++} className='new-row'></div>)

    pis.forEach(pi => {
      let {vel,alloc} = getTeamVelocityAndAllocation(pi,project.projectname,teamFilter);
      
      projectsList.push(<PiView 
        key={key++} 
        onFeatureDropped={moveFeature} onFeatureClicked={editFeature} 
        features={features} deltafeatures={deltafeatures} sprints={sprints} 
        pi={pi} project={project.projectname} team={teamFilter}
        allocation={alloc} velocity={vel}/>
      );
    });
  });

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
        </div>
      </div>
      <div className='right'>
        <DndProvider backend={HTML5Backend}>
          <div className='grid-container'>
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