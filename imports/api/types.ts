import { FeatureType } from '/imports/api/collections';

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
  (feature: FeatureType): void;
}

export interface OnFeatureDropType {
  (featureId: string, pi: string, team: string, project: string): void;
}

export interface OnFeaturesDisplayedType {
  (pi: string, nr: number): void;
}

export interface InputType {
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
  featureEndSprint?: number;
  featureEndSprintName?: string;
  tags?: string;
  featureSize?: number;
  team?: string;
  project?: string;
  priority?: number;
}

export interface UpdateType {
  pi: string;
  project?: string;
  team?: string;
}
