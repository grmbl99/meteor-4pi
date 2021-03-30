import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { TeamSelectForm, ProjectSelectForm } from './Forms.jsx';
import { UpdateFeaturePopup } from './Popup.jsx';

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
  let i=0;
  teams.forEach(team => {
    teamsList.push(<div key={i++} className='new-row'></div>)
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.1' project={projectFilter} team={team.teamname}/>);
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.2' project={projectFilter} team={team.teamname}/>);
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.3' project={projectFilter} team={team.teamname}/>);
    teamsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.4' project={projectFilter} team={team.teamname}/>);  
  });

  let projectsList=[];
  projects.forEach(project => {
    projectsList.push(<div key={i++} className='new-row'></div>)
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.1' project={project.projectname} team={teamFilter}/>);
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.2' project={project.projectname} team={teamFilter}/>);
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.3' project={project.projectname} team={teamFilter}/>);
    projectsList.push(<PiView key={i++} onFeatureDropped={moveFeature} onFeatureClicked={editFeature} features={features} sprints={sprints} pi='PI 21.4' project={project.projectname} team={teamFilter}/>);
  });

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <div className='grid-container'>

          <div className='heading'>Project Manager View</div>
          <div className='filters'>
            <ProjectSelectForm onSubmit={(input) => {setProjectFilter(input.projectname)}}/>
          </div>
          {teamsList}

          <div className='heading'>Product Owner View</div>
          <div className='filters'>
            <TeamSelectForm onSubmit={(input) => {setTeamFilter(input.teamname)}}/>
          </div>
          {projectsList}

        </div>
      </DndProvider>
      <UpdateFeaturePopup show={showPopup} feature={selectedFeature} onSubmit={updateFeature}/>
    </div>
  );  
}

