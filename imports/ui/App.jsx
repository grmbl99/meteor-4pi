import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { NewFeatureForm, TeamSelectForm, ProjectSelectForm } from './Forms.jsx';

export function App(props) {
  const features = useTracker(getFeatures);
  const sprints = useTracker(getSprints);
  const teams = useTracker(getTeams);
  const projects = useTracker(getProjects);

  const [teamFilter, setTeamFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  function getFeatures() { return (FeaturesCollection.find({}).fetch()); }
  function getSprints() {return (SprintsCollection.find({}).fetch()); }
  function getTeams() {return (TeamsCollection.find({}).fetch()); }
  function getProjects() {return (ProjectsCollection.find({}).fetch()); }

  function handleNewFeature(input) {
    FeaturesCollection.insert({name: input.name, pi: input.pi, size: parseInt(input.size)});
    console.log('added: ' + input.name);
  };

  function handleMove(featureId,pi,team,project) {
    let updates = { 'pi': pi };
    if (project !== '') { updates['project']=project; }
    if (team !== '') { updates['team']=team; }

    FeaturesCollection.update({ _id: featureId },{ $set: updates});
  };

  let teamsList=[];
  let i=0;
  teams.forEach(team => {
    teamsList.push(<div key={i++} className='new-row'></div>)
    teamsList.push(<PiView key={i++} onFeatureDropped={handleMove} features={features} sprints={sprints} pi='PI 21.1' project={projectFilter} team={team.teamname}/>);
    teamsList.push(<PiView key={i++} onFeatureDropped={handleMove} features={features} sprints={sprints} pi='PI 21.2' project={projectFilter} team={team.teamname}/>);
  });

  let projectsList=[];
  projects.forEach(project => {
    projectsList.push(<div key={i++} className='new-row'></div>)
    projectsList.push(<PiView key={i++} onFeatureDropped={handleMove} features={features} sprints={sprints} pi='PI 21.1' project={project.projectname} team={teamFilter}/>);
    projectsList.push(<PiView key={i++} onFeatureDropped={handleMove} features={features} sprints={sprints} pi='PI 21.2' project={project.projectname} team={teamFilter}/>);
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className='grid-container'>
          <div className='heading'>
            <NewFeatureForm onSubmit={handleNewFeature}/>
          </div>
          <div className='heading'>
            <h2>Teams:</h2>
            <ProjectSelectForm onSubmit={(input) => {setProjectFilter(input.projectname)}}/>
          </div>
          {teamsList}
          <div className='heading'>
            <h2>Projects:</h2>
            <TeamSelectForm onSubmit={(input) => {setTeamFilter(input.teamname)}}/>
          </div>
          {projectsList}
        </div>
      </div>
    </DndProvider>
  );  
}

