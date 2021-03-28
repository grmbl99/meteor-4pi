import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FeaturesCollection, SprintsCollection } from '/imports/api/Collections';
import { PiView } from './PiView.jsx';
import { InputForm } from './InputForm.jsx';

export function App(props) {
  const features = useTracker(getFeatures);
  const sprints = useTracker(getSprints);

  function getFeatures() {
    console.log("getting features");
    return (FeaturesCollection.find({}).fetch());
  }

  function getSprints() {
    console.log("getting sprints");
    return (SprintsCollection.find({}).fetch());
  }

  function handleSubmit(input) {
    FeaturesCollection.insert({name: input.name, pi: input.pi, size: parseInt(input.size)});
    console.log("added: " + input.name);
  };

  // function handleRemove(value) {
  //   FeaturesCollection.remove({ _id: value});
  //   console.log(value);
  // };

  function handleMove(featureId,pi) {
    FeaturesCollection.update({ _id: featureId },{ $set: { pi: pi }});
    console.log("move " + featureId + "to PI" + pi);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div>
          <InputForm onSubmit={handleSubmit}/>
          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.1" />
          <PiView onFeatureDropped={handleMove} features={features} sprints={sprints} pi="PI 21.2" />
        </div>
      </div>
    </DndProvider>
  );  
}

