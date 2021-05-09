import React, { ReactElement, useEffect } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { CollectionContext } from './context';
import { LookUpType, RevLookUpType, BoolLookUpType, InputType } from '/imports/api/types';
import { FeatureType } from '/imports/api/collections';

export { UpdateFeaturePopup };

interface onSubmitType {
  (input: InputType): void;
}

interface UpdateFeaturePopupPropTypes {
  show: boolean;
  feature: FeatureType;
  onSubmit: onSubmitType;
}

function UpdateFeaturePopup(props: UpdateFeaturePopupPropTypes): ReactElement | null {
  const sprintLookup: LookUpType = {};
  const sprintRevLookup: RevLookUpType = {};
  const piLookup: BoolLookUpType = {};
  const teamLookup: BoolLookUpType = {};
  const projectLookup: BoolLookUpType = {};

  interface FormInputs {
    name: string;
    size: number;
    progress: number;
    pi: string;
    startSprint: string;
    endSprint: string;
    featureEndSprint: string;
    tags: string;
    featureSize: number;
    team: string;
    project: string;
    priority: number;
  }

  function onSubmit(data: FormInputs) {
    props.onSubmit({
      success: true,
      _id: props.feature._id,
      name: data.name,
      size: data.size,
      progress: data.progress,
      pi: data.pi,
      startSprint: sprintLookup[data.startSprint],
      startSprintName: data.startSprint,
      endSprint: sprintLookup[data.endSprint],
      endSprintName: data.endSprint,
      featureEndSprint: sprintLookup[data.featureEndSprint],
      featureEndSprintName: data.featureEndSprint,
      tags: data.tags,
      featureSize: data.featureSize,
      team: data.team,
      project: data.project,
      priority: data.priority
    });
  }

  function onError(errors: FieldErrors) {
    console.log(errors);
  }

  function onCancel() {
    props.onSubmit({
      success: false
    });
  }

  const context = React.useContext(CollectionContext);
  if (context) {
    const { iterations, teams, projects } = context;

    const showHideClassName = props.show ? 'popup display-block' : 'popup display-none';

    const {
      register,
      handleSubmit,
      reset,
      getValues,
      formState: { errors }
    } = useForm<FormInputs>({ mode: 'onChange' });

    useEffect(() => {
      reset({
        name: props.feature.name,
        size: props.feature.size,
        progress: props.feature.progress,
        pi: props.feature.pi,
        startSprint: sprintRevLookup[props.feature.startSprint] || props.feature.startSprint.toString(),
        endSprint: sprintRevLookup[props.feature.endSprint] || props.feature.endSprint.toString(),
        featureEndSprint: sprintRevLookup[props.feature.featureEndSprint] || props.feature.featureEndSprint.toString(),
        tags: props.feature.tags,
        featureSize: props.feature.featureSize,
        team: props.feature.team,
        project: props.feature.project,
        priority: props.feature.priority
      });
    }, [props]);

    const iterationList = [];
    const piList = [];
    for (const iteration of iterations) {
      iterationList.push(<option key={iteration.sprint} value={iteration.sprintName} />);
      sprintLookup[iteration.sprintName] = iteration.sprint;
      sprintRevLookup[iteration.sprint] = iteration.sprintName;

      if (!(iteration.pi in piLookup)) {
        piLookup[iteration.pi] = true;
        piList.push(<option key={iteration.pi} value={iteration.pi} />);
      }
    }

    const teamList = [];
    for (const team of teams) {
      teamList.push(<option key={team._id} value={team.name} />);
      teamLookup[team.name] = true;
    }

    const projectList = [];
    for (const project of projects) {
      projectList.push(<option key={project._id} value={project.name} />);
      projectLookup[project.name] = true;
    }

    return (
      <div className={showHideClassName}>
        <section className='popup-main'>
          <form className='popup-grid-container' onSubmit={handleSubmit(onSubmit, onError)}>
            <label>Name:</label>{' '}
            <input className={errors.name && 'input-invalid'} type='text' {...register('name', { required: true })} />
            <label>Tags:</label>{' '}
            <input className={errors.tags && 'input-invalid'} type='text' {...register('tags', { required: false })} />
            <label>Priority:</label>{' '}
            <input
              className={errors.priority && 'input-invalid'}
              type='text'
              {...register('priority', { required: false })}
            />
            <label>Size:</label>{' '}
            <input
              className={errors.size && 'input-invalid'}
              type='text'
              {...register('size', {
                required: true,
                min: 0,
                validate: () => Number(getValues('size')) >= Number(getValues('progress'))
              })}
            />
            <label>Feature Size:</label>{' '}
            <input
              className={errors.featureSize && 'input-invalid'}
              type='text'
              {...register('featureSize', {
                required: true,
                min: 0,
                validate: () => Number(getValues('featureSize')) >= Number(getValues('featureSize'))
              })}
            />
            <label>Progress:</label>
            <input
              className={errors.progress && 'input-invalid'}
              type='text'
              {...register('progress', {
                required: true,
                min: 0,
                validate: () => Number(getValues('size')) >= Number(getValues('progress'))
              })}
            />
            <label>PI:</label>{' '}
            <input
              className={errors.pi && 'input-invalid'}
              list='pis'
              {...register('pi', { validate: (v) => v in piLookup })}
            />
            <label>Start:</label>
            <input
              className={errors.startSprint && 'input-invalid'}
              list='iterations'
              {...register('startSprint', { validate: (v) => v in sprintLookup })}
            />
            <label>End:</label>
            <input
              className={errors.endSprint && 'input-invalid'}
              list='iterations'
              {...register('endSprint', { validate: (v) => v in sprintLookup })}
            />
            <label>Feature End:</label>
            <input
              className={errors.featureEndSprint && 'input-invalid'}
              list='iterations'
              {...register('featureEndSprint', { validate: (v) => v in sprintLookup })}
            />
            <label>Team:</label>
            <input
              className={errors.team && 'input-invalid'}
              list='teams'
              {...register('team', { validate: (v) => v in teamLookup })}
            />
            <label>Project:</label>
            <input
              className={errors.project && 'input-invalid'}
              list='projects'
              {...register('project', { validate: (v) => v in projectLookup })}
            />
            <datalist id='iterations'>{iterationList}</datalist>
            <datalist id='pis'>{piList}</datalist>
            <datalist id='teams'>{teamList}</datalist>
            <datalist id='projects'>{projectList}</datalist>
            <input type='submit' value='Submit' />
            <input type='button' onClick={onCancel} value='Cancel' />
          </form>
        </section>
      </div>
    );
  } else {
    return null;
  }
}
