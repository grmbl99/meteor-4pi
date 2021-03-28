import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FeaturesCollection } from '/imports/api/FeaturesCollection';
import { PiView } from './PiView.jsx';
import { InputForm } from './InputForm.jsx';

export function App(props) {
  const features = useTracker(getFeatures);

  function getFeatures() {
    console.log("getting features");
    return (FeaturesCollection.find({}).fetch());
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
          <PiView onFeatureDropped={handleMove} features={features} name="1" />
          <PiView onFeatureDropped={handleMove} features={features} name="2" />
          <PiView onFeatureDropped={handleMove} features={features} name="3" />
          <PiView onFeatureDropped={handleMove} features={features} name="4" />
        </div>
      </div>
    </DndProvider>
  );  
}

