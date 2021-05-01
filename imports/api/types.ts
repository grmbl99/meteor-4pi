export interface featureType {
  _id: string;
  id: number;
  name: string;
  pi: string;
  size: number;
  progress: number;
  startSprint: number;
  endSprint: number;
  startSprintName: string;
  endSprintName: string;
  featureEndSprintName: string;
  featureEndSprint: number;
  tags: string;
  featureSize: number;
  team: string;
  project: string;
}

export interface iterationType {
  _id: string;
  startDate: Date;
  sprintName: string;
  sprint: number;
  pi: string;
}

export interface velocityType {
  pi: string;
  team: string;
  project: string;
  value: number;
}

export interface deltaFeatureType {
  feature: featureType;
  type: string;
}

export interface LookUpType {
  [details: string]: number;
}

export interface RevLookUpType {
  [details: number]: string;
}

export interface BoolLookUpType {
  [details: string]: boolean;
}
