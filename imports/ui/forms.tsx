import React, { ReactElement } from 'react';

export { FilterForm };

interface onSubmitType {
  (input: string): void;
}

interface FilterFormPropTypes {
  onSubmit: onSubmitType;
  text: string;
}

function FilterForm(props: FilterFormPropTypes): ReactElement {
  const [filterName, setFilterName] = React.useState('');

  function handleSubmit(event: React.FormEvent) {
    props.onSubmit(filterName);
    event.preventDefault();
  }

  return (
    <div className='filter'>
      <form onSubmit={handleSubmit}>
        <div className='filter-grid-container'>
          <label>{props.text}</label>
          <input
            className='filter-form-cell'
            type='text'
            value={filterName}
            onChange={(event) => setFilterName(event.target.value)}
          />
          <input className='filter-form-cell' type='submit' value='Submit' />
        </div>
      </form>
    </div>
  );
}
