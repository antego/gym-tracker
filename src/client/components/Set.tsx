import React from 'react';

function Set(props: {
  reps: number;
  weight: number;
  changeReps: (e: React.ChangeEvent<HTMLInputElement>) => void;
  changeWeight: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteSet: () => void;
}) {
  return (
    <div>
      reps:
      <input type='number' value={props.reps} onChange={props.changeReps} />
      weight:
      <input type='number' value={props.weight} onChange={props.changeWeight} />
      <button onClick={props.deleteSet}>Delete</button>
    </div>
  );
}

export default Set;
