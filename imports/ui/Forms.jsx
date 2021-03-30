import React, { useState } from 'react';

export function NewFeatureForm(props) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [pi, setPi] = useState('');

  function handleSubmit(event) {
    props.onSubmit({name: name, size: size, pi: pi});
    setName('');
    setSize('');
    setPi('');
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name: <input type='text' value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Size: <input type='text' value={size} onChange={(event) => setSize(event.target.value)} /></label>
      <label>PI: <input type='text' value={pi} onChange={(event) => setPi(event.target.value)} /></label>
      <input type='submit' value='Submit' />
    </form>
  );
}

export function ProjectSelectForm(props) {
  const [projectname, setProjectname] = useState('');

  function handleSubmit(event) {
    props.onSubmit({projectname: projectname});
    // setProjectname('');
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='form-grid-container'>
        <label>Project Filter:</label>
        <input type='text' value={projectname} onChange={(event) => setProjectname(event.target.value)} />
        <input type='submit' value='Submit' />
      </div>
    </form>
  );
}

export function TeamSelectForm(props) {
  const [teamname, setTeamname] = useState('');

  function handleSubmit(event) {
    props.onSubmit({teamname: teamname});
    // setTeamname('');
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
     <div className='form-grid-container'>
       <label>Team Filter:</label> 
       <input type='text' value={teamname} onChange={(event) => setTeamname(event.target.value)} />
      <input type='submit' value='Submit' />
    </div>
    </form>
  );
}