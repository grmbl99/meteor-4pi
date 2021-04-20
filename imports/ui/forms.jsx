import React, { useState } from 'react';
import PropTypes from 'prop-types';

export { FilterForm, NewFeatureForm };

FilterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired
};

function FilterForm(props) {
  const [filterName, setFilterName] = useState('');

  function handleSubmit(event) {
    props.onSubmit({ filterName: filterName });
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

NewFeatureForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

function NewFeatureForm(props) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [pi, setPi] = useState('');

  function handleSubmit(event) {
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
