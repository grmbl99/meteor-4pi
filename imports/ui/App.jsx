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

  // function handleRemove(value) {
  //   FeaturesCollection.remove({ _id: value});
  //   console.log(value);
  // };

  function handleMove(featureId,pi,team,project) {
    let updates = { "pi": pi };
    if (project !== "") { updates["project"]=project; }
    if (team !== "") { updates["team"]=team; }

    FeaturesCollection.update({ _id: featureId },{ $set: updates});
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div>
          <InputForm onSubmit={handleSubmit}/>
          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.1" project="puma" team="pegasus"/>
          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.2" project="puma" team="pegasus"/>

          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.1" project="" team="mushu"/>
          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.2" project="" team="mushu"/>

          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.1" project="puma" team=""/>
          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.2" project="puma" team=""/>

          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.1" project="voip" team=""/>
          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.2" project="voip" team=""/>
        </div>
      </div>
    </DndProvider>
  );  
}

