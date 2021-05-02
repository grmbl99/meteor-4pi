import React from 'react';
import { featureType, iterationType, velocityType, deltaFeatureType } from '/imports/api/collections';

export const CollectionContext = React.createContext<collectionContextType | null>(null);

export interface collectionContextType {
  iterations: iterationType[];
  features: featureType[];
  velocityPlan: velocityType[];
  deltaFeatures: deltaFeatureType[];
}
