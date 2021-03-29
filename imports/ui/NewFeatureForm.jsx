import React, { useState } from 'react';

export function NewFeatureForm(props) {
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [pi, setPi] = useState("");

  function handleSubmit(event) {
    props.onSubmit({name: name, size: size, pi: pi});
    setName("");
    setSize("");
    setPi("");
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name: <input type="text" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Size: <input type="text" value={size} onChange={(event) => setSize(event.target.value)} /></label>
      <label>PI: <input type="text" value={pi} onChange={(event) => setPi(event.target.value)} /></label>
      <input type="submit" value="Submit" />
    </form>
  );
}