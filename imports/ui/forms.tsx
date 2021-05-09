import React, { ReactElement, useEffect } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
export { FilterForm };

interface onSubmitType {
  (input: string): void;
}

interface FilterFormPropTypes {
  onSubmit: onSubmitType;
  text: string;
  list: string[];
}

function FilterForm(props: FilterFormPropTypes): ReactElement {
  interface FormInputs {
    filterName: string;
  }

  function onSubmit(data: FormInputs) {
    props.onSubmit(data.filterName);
  }

  function onError(errors: FieldErrors) {
    console.log(errors);
  }

  const { register, handleSubmit, reset, getValues } = useForm<FormInputs>({ mode: 'onChange' });

  useEffect(() => {
    reset({
      filterName: getValues('filterName')
    });
  }, [props]);

  let key = 0;
  const valueList = [];

  // also allow '' in dropdown validation
  valueList.push(<option key={key++} value='' />);

  for (const value of props.list) {
    valueList.push(
      <option key={key++} value={value}>
        {value}
      </option>
    );
  }

  // prepare for custom onChange handler
  const { onChange, ...rest } = register('filterName');

  return (
    <div className='filter'>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className='filter-grid-container'>
          <label>{props.text}</label>{' '}
          <select
            className={'filter-form-cell'}
            {...rest}
            onChange={(e) => {
              onChange(e);
              handleSubmit(onSubmit)(); // submit automatically on each select
            }}
          >
            {valueList}
          </select>
        </div>
      </form>
    </div>
  );
}
