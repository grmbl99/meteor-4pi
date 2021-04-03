import React, { useEffect, useState } from 'react';

export function UpdateFeaturePopup(props) {
  const showHideClassName = props.show ? 'popup display-block' : 'popup display-none';

  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [done, setDone] = useState('');
  const [pi, setPi] = useState('');
  const [startSprint, setStartSprint] = useState('');
  const [endSprint, setEndSprint] = useState('');

  if (props.feature) {
    useEffect(() => { setName(props.feature.name) },[props]);
    useEffect(() => { setSize(props.feature.size) },[props]);
    useEffect(() => { setPi(props.feature.pi) },[props]);
    useEffect(() => { setDone(props.feature.done) },[props]);
    useEffect(() => { setStartSprint(props.feature.startsprint) },[props]);
    useEffect(() => { setEndSprint(props.feature.endsprint) },[props]);  
  }

  function handleSubmit(event) {
    props.onSubmit({_id: props.feature._id, name: name, size: size, done: done, pi: pi, startsprint: startSprint, endsprint: endSprint});
    event.preventDefault();
  }

  return (
    <div className={showHideClassName}>
      <section className='popup-main'>
        <form className='popup-grid-container' onSubmit={handleSubmit}>
          <label>Name:</label> <input type='text' value={name} onChange={(event) => setName(event.target.value)} />
          <label>Size:</label> <input type='text' value={size} onChange={(event) => setSize(event.target.value)} />
          <label>Done:</label> <input type='text' value={done} onChange={(event) => setDone(event.target.value)} />
          <label>PI:</label> <input type='text' value={pi} onChange={(event) => setPi(event.target.value)} />
          <label>Start:</label> <input type='text' value={startSprint} onChange={(event) => setStartSprint(event.target.value)} />
          <label>End:</label> <input type='text' value={endSprint} onChange={(event) => setEndSprint(event.target.value)} />
          <input type='submit' value='Submit' />
        </form>
      </section>
    </div>
  );
}