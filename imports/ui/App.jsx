import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
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

  function handleRemove(value) {
    FeaturesCollection.remove({ _id: value});
    console.log(value);
  };

  return (
    <div>
      <div>
        <InputForm onSubmit={handleSubmit}/>
        <PiView onFeatureClicked={handleRemove} features={features} name="1" />
        <PiView onFeatureClicked={handleRemove} features={features} name="2" />
        <PiView onFeatureClicked={handleRemove} features={features} name="3" />
        <PiView onFeatureClicked={handleRemove} features={features} name="4" />
      </div>
    </div>
  );  
}

