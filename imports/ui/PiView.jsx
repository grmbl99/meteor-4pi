import React, { useState } from 'react';

export function PiView(props) {
  const features = props.features;

  let size=0;
  features.forEach(feature => {
    if (feature.pi === props.name) {
      size += feature.size;
    }
  });

  const listItems = features.flatMap((feature) => {
    if (feature.pi === props.name) {
      return(<Feature onClick={props.onFeatureClicked} key={feature._id} feature={feature} />);
    } else {
      return([]);
    }
  });

  return (
    <div className={size>140 ? "piview pialert" : "piview"}>
      {props.name}: total size: {size}
      {listItems}
    </div>
  );
}

function Feature(props) {
  const feature=props.feature;

  function onClick() {
    props.onClick(feature._id);
  };

  return (
    <div className="feature" onClick={onClick}>
      <div className="featurename">Featurename: {feature.name}</div>
      <div className="featuresize">
        <svg width="100px" height="20px">
          <rect height="20" width={feature.size} fill="green"/>
        </svg>
      </div>
    </div>
  );
}
