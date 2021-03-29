import React, { useState } from 'react';

export function ProjectSelect(props) {
  const [projectname, setProjectname] = useState("");

  function handleSubmit(event) {
    props.onSubmit({projectname: projectname});
    // setProjectname("");
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Project: <input type="text" value={projectname} onChange={(event) => setProjectname(event.target.value)} /></label>
      <input type="submit" value="Submit" />
    </form>
  );
}