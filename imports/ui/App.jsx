import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FeaturesCollection, SprintsCollection, TeamsCollection, ProjectsCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { InputForm } from './InputForm.jsx';

export function App(props) {
  const features = useTracker(getFeatures);
  const sprints = useTracker(getSprints);
  const teams = useTracker(getTeams);
  const projects = useTracker(getProjects);

  function getFeatures() { return (FeaturesCollection.find({}).fetch()); }
  function getSprints() {return (SprintsCollection.find({}).fetch()); }
  function getTeams() {return (TeamsCollection.find({}).fetch()); }
  function getProjects() {return (ProjectsCollection.find({}).fetch()); }

  function handleSubmit(input) {
    FeaturesCollection.insert({name: input.name, pi: input.pi, size: parseInt(input.size)});
    console.log("added: " + input.name);
  };

  function handleMove(featureId,pi,team,project) {
    let updates = { "pi": pi };
    if (project !== "") { updates["project"]=project; }
    if (team !== "") { updates["team"]=team; }

    FeaturesCollection.update({ _id: featureId },{ $set: updates});
  };

  let teamsList=[];
  teams.forEach(team => {
    teamsList.push(<div className="new-row"><PiView key={team._id+"1"} onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.1" project="" team={team.teamname}/></div>);
    teamsList.push(<PiView key={team._id+"2"} onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.2" project="" team={team.teamname}/>);
  });

  let projectsList=[];
  projects.forEach(project => {
    projectsList.push(<div className="new-row"><PiView key={project._id+"1"} onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.1" project={project.projectname} team=""/></div>);
    projectsList.push(<PiView key={project._id+"2"} onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.2" project={project.projectname} team=""/>);
  });


  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <InputForm onSubmit={handleSubmit}/>
        <div className="grid-container">
          <h1 className="new-row">Teams:</h1>
          {teamsList}
          <h1 className="new-row">Projects:</h1>
          {projectsList}
        </div>
      </div>
    </DndProvider>
  );  
}

