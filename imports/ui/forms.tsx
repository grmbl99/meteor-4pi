import React from 'react';

export { FilterForm, NewFeatureForm };

interface FilterFormPropTypes {
  onSubmit: Function;
  text: string;
}

function FilterForm(props: FilterFormPropTypes) {
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

interface NewFeatureFormPropTypes {
  onSubmit: Function;
}

function NewFeatureForm(props: NewFeatureFormPropTypes) {
  const [name, setName] = React.useState('');
  const [size, setSize] = React.useState('');
  const [pi, setPi] = React.useState('');

  function handleSubmit(event: React.FormEvent) {
    props.onSubmit({ name: name, size: size, pi: pi });
    setName('');
    setSize('');
    setPi('');
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Name: </label>
      <input type='text' value={name} onChange={(event) => setName(event.target.value)} />
      <label>Size: </label>
      <input type='text' value={size} onChange={(event) => setSize(event.target.value)} />
      <label>PI: </label>
      <input type='text' value={pi} onChange={(event) => setPi(event.target.value)} />
      <input type='submit' value='Submit' />
    </form>
  );
}
