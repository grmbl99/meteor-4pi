import { featureType } from '/imports/api/collections';

export interface LookUpType {
  [details: string]: number;
}

export interface RevLookUpType {
  [details: number]: string;
}

export interface BoolLookUpType {
  [details: string]: boolean;
}

export interface OnFeatureClickType {
  (feature: featureType): void;
}

export interface OnFeatureDropType {
  (featureId: number, pi: string, team: string, project: string): void;
}

export interface OnFeaturesDisplayedType {
  (pi: string, nr: number): void;
}

export interface inputType {
  success: boolean;
  _id?: string;
  name?: string;
  size?: number;
  progress?: number;
  pi?: string;
  startSprint?: number;
  startSprintName?: string;
  endSprint?: number;
  endSprintName?: string;
}
