import React, { useState } from 'react';

export function TeamSelect(props) {
  const [teamname, setTeamname] = useState("");

  function handleSubmit(event) {
    props.onSubmit({teamname: teamname});
    // setTeamname("");
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Team: <input type="text" value={teamname} onChange={(event) => setTeamname(event.target.value)} /></label>
      <input type="submit" value="Submit" />
    </form>
  );
}