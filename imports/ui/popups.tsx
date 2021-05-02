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

  interface FormInputs {
    name: string;
    size: number;
    progress: number;
    pi: string;
    startSprint: string;
    endSprint: string;
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
      endSprintName: data.endSprint
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
    const { iterations } = context;

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
        endSprint: sprintRevLookup[props.feature.endSprint] || props.feature.endSprint.toString()
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

    return (
      <div className={showHideClassName}>
        <section className='popup-main'>
          <form className='popup-grid-container' onSubmit={handleSubmit(onSubmit, onError)}>
            <label>Name:</label>{' '}
            <input className={errors.name && 'input-invalid'} type='text' {...register('name', { required: true })} />
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
            <datalist id='iterations'>{iterationList}</datalist>
            <datalist id='pis'>{piList}</datalist>
            <input type='submit' value='Submit' />
            <div className='menu-item' onClick={onCancel}>
              Cancel
            </div>
          </form>
        </section>
      </div>
    );
  } else {
    return null;
  }
}
