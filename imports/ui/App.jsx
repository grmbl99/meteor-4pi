import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { FeaturesCollection } from '/imports/api/FeaturesCollection';
import { PiView } from './PiView.jsx';
import { InputForm } from './InputForm.jsx';

export function App(props) {
  const features = useTracker(() => FeaturesCollection.find({}).fetch());

  const handleSubmit = (input) => {
    FeaturesCollection.insert({name: input.name, pi: input.pi, size: parseInt(input.size)});
  };

  return (
    <div>
      <div>
        <InputForm onSubmit={handleSubmit}/>
        <PiView features={features} name="1" />
        <PiView features={features} name="2" />
        <PiView features={features} name="3" />
        <PiView features={features} name="4" />
      </div>
    </div>
  );  
}

