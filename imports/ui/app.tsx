import React, { ReactElement } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { Meteor } from 'meteor/meteor';
import { PiViewRow } from './pi-view-row';
import { FilterForm } from './forms';
import { UpdateFeaturePopup } from './popups';
import { SyncStatus, ServerStatus, EMPTY_FEATURE } from '/imports/api/constants';
import { InputType, UpdateType } from '/imports/api/types';
import { getServerStatus } from '/imports/api/server-status';
import { CollectionContext } from './context';
import {
  FeaturesCollection,
  DeltaFeaturesCollection,
  IterationsCollection,
  ProjectsCollection,
  TeamsCollection,
  VelocityPlanCollection,
  ServerStatusCollection,
  FeatureType
} from '/imports/api/collections';

import 'react-datepicker/dist/react-datepicker.css';

export function App(): ReactElement {
  // move a feature between teams/projects/pi's
  // (exectued using drag-and-drop)
  function moveFeature(featureId: string, pi: string, team: string, project: string) {
    if (!compareModeOn) {
      const updates: UpdateType = { pi: pi };
      if (project !== '') {
        updates['project'] = project;
      }
      if (team !== '') {
        updates['team'] = team;
      }

      Meteor.call('MoveFeature', featureId, updates);
    }
  }

  // store updated feature
  // executed when closing the feature-update modal dialog
  function updateFeature(input: InputType) {
    setShowPopup(false);
    if (input.success) {
      Meteor.call('UpdateFeature', input);
    }
  }

  // show feature-update modal dialog
  // executed when clicking on a feature
  function editFeature(feature: FeatureType) {
    if (!compareModeOn) {
      setSelectedFeature(feature);
      setShowPopup(true);
    }
  }

  // call method on server to update delta's
  function toggleCompareMode() {
    if (!compareModeOn) {
      setCompareModeOn(true);
      Meteor.call('UpdateDeltaFeatureCollection');
    } else {
      setCompareModeOn(false);
    }
  }

  // call method on server to refresh data from ADS
  function refreshADS() {
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
  const [selectedFeature, setSelectedFeature] = React.useState(EMPTY_FEATURE);

  // get the server state (azure sync status & dates) from server
  const adsSyncStatus = getServerStatus(ServerStatus.ADS_SYNC_STATUS);
  const d1 = getServerStatus(ServerStatus.ADS_COMPARE_DATE);
  const compareDate = d1 ? new Date(d1) : null;
  const d2 = getServerStatus(ServerStatus.ADS_SYNC_DATE);
  const adsSyncDateStr = d2 ? format(new Date(d2), 'EEE MMM d yyyy HH:mm.ss') : '';
  const d3 = getServerStatus(ServerStatus.ADS_COMPARE_SYNC_DATE);
  const adsCompareSyncDateStr = d3 ? format(new Date(d3), 'EEE MMM d yyyy HH:mm.ss') : '';

  const pis = ['PI 21.1', 'PI 21.2', 'PI 21.3', 'PI 21.4'];

  let menuEntryKey = 0;
  const teamsList = []; // set of PIView's per team
  const teamsMenu = []; // used as navigation buttons on left-side of screen

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

  const projectsList = []; // set of PIView's per project
  const projectsMenu = []; // used as navigation buttons on left-side of screen

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
          <div className='ads-sync-date'>{adsSyncDateStr}</div>

          <DatePicker
            selected={compareDate}
            showWeekNumbers
            onChange={(date) => refreshCompareADS(date)}
            customInput={<PickDateButton />}
          />
          <div className='ads-sync-date'>{adsCompareSyncDateStr}</div>
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
          <CollectionContext.Provider value={{ velocityPlan, iterations, features, deltaFeatures, projects, teams }}>
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

interface PickDateButtonPropTypes {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  value?: string;
}

// to use a custom button with the react-datepicker, we need to create it as a 'forwardRef'
const PickDateButton = React.forwardRef((props: PickDateButtonPropTypes, ref: React.ForwardedRef<HTMLDivElement>) => {
  return (
    <div className='menu-item' ref={ref} onClick={props.onClick}>
      Compare: {props.value}
    </div>
  );
});

PickDateButton.displayName = 'PickDateButton';
