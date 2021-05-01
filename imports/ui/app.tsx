import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { Meteor } from 'meteor/meteor';
import { PiViewRow } from './pi-view-row';
import { FilterForm } from './forms';
import { UpdateFeaturePopup } from './popups';
import { SyncStatus, ServerStatus, START_SPRINT_NOT_SET, NOT_SET } from '/imports/api/constants';
import { getServerStatus } from '/imports/api/server-status';
import { CollectionContext } from './context';
import {
  FeaturesCollection,
  DeltaFeaturesCollection,
  IterationsCollection,
  ProjectsCollection,
  TeamsCollection,
  VelocityPlanCollection,
  ServerStatusCollection
} from '/imports/api/collections';
import { featureType } from '/imports/api/types';

import 'react-datepicker/dist/react-datepicker.css';
import 'font-awesome/css/font-awesome.min.css';

export function App(_props: any) {
  interface updateType {
    pi: string;
    project?: string;
    team?: string;
  }

  // move a feature between teams/projects/pi's
  // (exectued using drag-and-drop)
  function moveFeature(featureId: number, pi: string, team: string, project: string) {
    if (!compareModeOn) {
      let updates: updateType = { pi: pi };
      if (project !== '') {
        updates['project'] = project;
      }
      if (team !== '') {
        updates['team'] = team;
      }

      Meteor.call('MoveFeature', featureId, updates);
    }
  }

  interface inputType {
    success: boolean;
    _id: string;
    name: string;
    size: number;
    progress: number;
    pi: string;
    startSprint: number;
    startSprintName: string;
    endSprint: number;
    endSprintName: string;
  }

  // store updated feature
  // executed when closing the feature-update modal dialog
  function updateFeature(input: inputType) {
    setShowPopup(false);
    if (input.success) {
      Meteor.call('UpdateFeature', input);
    }
  }

  // show feature-update modal dialog
  // executed when clicking on a feature
  function editFeature(feature: featureType) {
    if (!compareModeOn) {
      setSelectedFeature(feature);
      setShowPopup(true);
    }
  }

  // call method on server to update delta's
  function toggleCompareMode(_event: any) {
    if (!compareModeOn) {
      setCompareModeOn(true);
      Meteor.call('UpdateDeltaFeatureCollection');
    } else {
      setCompareModeOn(false);
    }
  }

  // call method on server to refresh data from ADS
  function refreshADS(_event: any) {
    if (adsSyncStatus !== SyncStatus.BUSY) {
      Meteor.call('RefreshADS');
      setCompareModeOn(false);
    }
  }

  // call method on server to refresh compare data from ADS
  function refreshCompareADS(date: Date | [Date, Date] | null) {
    if (adsSyncStatus !== SyncStatus.BUSY) {
      Meteor.call('RefreshCompareADS', date);
      setCompareModeOn(true);
    }
  }

  // subscribe to server collections, with useTracker for 'reactiveness'
  const features = useTracker(() => {
    Meteor.subscribe('features');
    return FeaturesCollection.find({}, { sort: { priority: 1 } }).fetch();
  });
  const deltaFeatures = useTracker(() => {
    Meteor.subscribe('deltafeatures');
    return DeltaFeaturesCollection.find({}).fetch();
  });
  const iterations = useTracker(() => {
    Meteor.subscribe('iterations');
    return IterationsCollection.find({}).fetch();
  });
  const teams = useTracker(() => {
    Meteor.subscribe('teams');
    return TeamsCollection.find({}, { sort: { name: 1 } }).fetch();
  });
  const projects = useTracker(() => {
    Meteor.subscribe('projects');
    return ProjectsCollection.find({}, { sort: { name: 1 } }).fetch();
  });
  const velocityPlan = useTracker(() => {
    Meteor.subscribe('velocityplan');
    return VelocityPlanCollection.find({}).fetch();
  });
  useTracker(() => {
    Meteor.subscribe('serverstatus');
    return ServerStatusCollection.find({}).fetch();
  });

  // react state
  const [teamFilter, setTeamFilter] = React.useState('');
  const [projectFilter, setProjectFilter] = React.useState('');
  const [showPopup, setShowPopup] = React.useState(false);
  const [compareModeOn, setCompareModeOn] = React.useState(false);
  const [selectedFeature, setSelectedFeature] = React.useState({
    name: '',
    pi: '',
    size: 0,
    progress: 0,
    startSprint: START_SPRINT_NOT_SET,
    endSprint: NOT_SET,
    startSprintName: '',
    endSprintName: '',
    _id: '',
    id: 0,
    featureEndSprintName: '',
    featureEndSprint: NOT_SET,
    tags: '',
    featureSize: 0,
    team: '',
    project: ''
  });

  // get the server state (azure sync status & dates) from server
  const adsSyncStatus = getServerStatus(ServerStatus.ADS_SYNC_STATUS);
  const compareDate = getServerStatus(ServerStatus.ADS_COMPARE_DATE);
  let adsSyncDate = getServerStatus(ServerStatus.ADS_SYNC_DATE);
  adsSyncDate = adsSyncDate ? format(adsSyncDate, 'EEE MMM d yyyy HH:mm.ss') : '';
  let adsCompareSyncDate = getServerStatus(ServerStatus.ADS_COMPARE_SYNC_DATE);
  adsCompareSyncDate = adsCompareSyncDate ? format(adsCompareSyncDate, 'EEE MMM d yyyy HH:mm.ss') : '';

  let pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let menuEntryKey = 0;
  let teamsList = []; // set of PIView's per team
  let teamsMenu = []; // used as navigation buttons on left-side of screen

  for (const team of teams) {
    const newRef = React.createRef<HTMLDivElement>();
    teamsMenu.push(
      <div
        className='menu-item'
        key={menuEntryKey}
        onClick={() => {
          newRef.current?.scrollIntoView();
        }}
      >
        {team.name}
      </div>
    );

    teamsList.push(
      <PiViewRow
        key={menuEntryKey++}
        ref={newRef}
        onFeatureDropped={moveFeature}
        onFeatureClicked={editFeature}
        compareModeOn={compareModeOn}
        pis={pis}
        projectName={projectFilter}
        teamName={team.name}
      />
    );
  }

  let projectsList = []; // set of PIView's per project
  let projectsMenu = []; // used as navigation buttons on left-side of screen

  for (const project of projects) {
    const newRef = React.createRef<HTMLDivElement>();
    projectsMenu.push(
      <div
        className='menu-item'
        key={menuEntryKey}
        onClick={() => {
          newRef.current?.scrollIntoView();
        }}
      >
        {project.name}
      </div>
    );

    projectsList.push(
      <PiViewRow
        key={menuEntryKey++}
        ref={newRef}
        onFeatureDropped={moveFeature}
        onFeatureClicked={editFeature}
        compareModeOn={compareModeOn}
        pis={pis}
        projectName={project.name}
        teamName={teamFilter}
      />
    );
  }

  // to show/hide 'loading' indicators
  const loadingClassName = adsSyncStatus === SyncStatus.BUSY ? 'ads-loading' : 'ads-loading-empty';
  const adsSyncClassName = adsSyncStatus === SyncStatus.FAILED ? 'menu-item menu-item-red' : 'menu-item';

  return (
    <div>
      <div className='left'>
        <div className='menu-container'>
          <div className={adsSyncClassName} onClick={refreshADS}>
            ADS Sync: {adsSyncStatus}
          </div>
          <div className='ads-sync-date'>{adsSyncDate}</div>

          <DatePicker
            selected={compareDate}
            showWeekNumbers
            onChange={(date) => refreshCompareADS(date)}
            customInput={<PickDateButton />}
          />
          <div className='ads-sync-date'>{adsCompareSyncDate}</div>
          <div>
            Compare: <input type='checkbox' checked={compareModeOn} onChange={toggleCompareMode} />
          </div>
          <div className={loadingClassName} />

          <div className='menu-heading'>Teams</div>
          <FilterForm text='Project filter' onSubmit={(input: string) => setProjectFilter(input)} />
          {teamsMenu}

          <div className='menu-heading'>Projects</div>
          <FilterForm text='Team filter' onSubmit={(input: string) => setTeamFilter(input)} />
          {projectsMenu}
        </div>
      </div>
      <div className='right'>
        <DndProvider backend={HTML5Backend}>
          <CollectionContext.Provider value={{ velocityPlan, iterations, features, deltaFeatures }}>
            <div className='heading'>Project Manager View</div>
            {teamsList}
            <div className='heading'>Product Owner View</div>
            {projectsList}
            <UpdateFeaturePopup show={showPopup} feature={selectedFeature} onSubmit={updateFeature} />
          </CollectionContext.Provider>
        </DndProvider>
      </div>
    </div>
  );
}

// to use a custom button with the react-datepicker, we need to create it as a 'forwardRef'
const PickDateButton = React.forwardRef((props: PickDateButtonPropTypes, ref: React.ForwardedRef<HTMLDivElement>) => {
  return (
    <div className='menu-item' ref={ref} onClick={props.onClick}>
      Compare: {props.value}
    </div>
  );
});

interface PickDateButtonPropTypes {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  value?: string;
}

PickDateButton.displayName = 'PickDateButton';
