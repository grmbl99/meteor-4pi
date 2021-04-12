import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export { UpdateFeaturePopup };

UpdateFeaturePopup.propTypes = {
  show: PropTypes.bool.isRequired,
  feature: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
};

function UpdateFeaturePopup(props) {
  const showHideClassName = props.show ? 'popup display-block' : 'popup display-none';

  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [done, setDone] = useState('');
  const [pi, setPi] = useState('');
  const [startSprint, setStartSprint] = useState('');
  const [endSprint, setEndSprint] = useState('');

  if (props.feature) {
    // fill the components 'state' with the prop content upon render
    useEffect(() => { 
      setName(props.feature.name); 
      setSize(props.feature.size);
      setPi(props.feature.pi);
      setDone(props.feature.done);
      setStartSprint(props.feature.startSprint);
      setEndSprint(props.feature.endSprint);
    },[props]);
  }

  function handleSubmit(event) {
    props.onSubmit({_id: props.feature._id, name: name, size: size, done: done, pi: pi, startSprint: startSprint, endSprint: endSprint});
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