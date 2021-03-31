import React, { useState, createRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { FilterForm } from './Forms.jsx';
import { UpdateFeaturePopup } from './Popups.jsx';

export function App(props) {
  const features = useTracker(getFeatures);
  const sprints = useTracker(getSprints);
  const teams = useTracker(getTeams);
  const projects = useTracker(getProjects);

  const [teamFilter, setTeamFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState({name: '', pi: '', size: '', done: '', startsprint: '', endsprint: ''});

  function getFeatures() { return (FeaturesCollection.find({}).fetch()); }
  function getSprints() {return (SprintsCollection.find({}).fetch()); }
  function getTeams() {return (TeamsCollection.find({}).fetch()); }
  function getProjects() {return (ProjectsCollection.find({}).fetch()); }

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

  let teamsList=[];
  let teamsNav=[];
  let i=0;
  teams.forEach(team => {
    const newRef = createRef();
    teamsNav.push(<div className='menu-item' key={i} onClick={() => {newRef.current.scrollIntoView()}}>{team.teamname}</div>);

    teamsList.push(<div ref={newRef} key={i++} className='new-row'></div>)
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.1' project={projectFilter} team={team.teamname}/>);
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.2' project={projectFilter} team={team.teamname}/>);
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.3' project={projectFilter} team={team.teamname}/>);
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.4' project={projectFilter} team={team.teamname}/>);  
  });

  let projectsList=[];
  let projectsNav=[];
  projects.forEach(project => {
    const newRef = createRef();
    projectsNav.push(<div className='menu-item' key={i} onClick={() => {newRef.current.scrollIntoView()}}>{project.projectname}</div>);

    projectsList.push(<div ref={newRef} key={i++} className='new-row'></div>)
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.1' project={project.projectname} team={teamFilter}/>);
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.2' project={project.projectname} team={teamFilter}/>);
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.3' project={project.projectname} team={teamFilter}/>);
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.4' project={project.projectname} team={teamFilter}/>);
  });

  return (
    <div className='container'>
      <div className='left'>
        <div className='menu-container'>
          <div className='menu-heading'>Teams</div>
          <FilterForm text='Project filter' onSubmit={(input) => {setProjectFilter(input.filtername)}}/>
          {teamsNav}
          <div className='menu-heading'>Projects</div>
          <FilterForm text='Team filter' onSubmit={(input) => {setTeamFilter(input.filtername)}}/>
          {projectsNav}          
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