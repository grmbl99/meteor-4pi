import React from 'react';
import { FeatureType, IterationType, VelocityType, DeltaFeatureType } from '/imports/api/collections';

export const CollectionContext = React.createContext<collectionContextType | null>(null);

export interface collectionContextType {
  iterations: IterationType[];
  features: FeatureType[];
  velocityPlan: VelocityType[];
  deltaFeatures: DeltaFeatureType[];
}
