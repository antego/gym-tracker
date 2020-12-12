import React, { useState } from 'react';
import Set from './Set';

interface ExerciseState {
  sets: Map<number, SetState>;
  nextSetId: number;
  name: string;
}

interface SetState {
  reps: number;
  weight: number;
}

interface WorkoutState {
  exercises: Map<number, ExerciseState>;
  nextExerciseId: number;
}

export const Workout: React.FunctionComponent = () => {
  const [state, setState] = useState<WorkoutState>({
    exercises: new Map(),
    nextExerciseId: 0,
  });

  const appendSet = (k: number) => {
    return () => {
      const exercise = state.exercises.get(k);
      if (exercise === undefined) {
        throw new Error('empty');
      }
      exercise.sets.set(exercise.nextSetId++, { reps: 0, weight: 0 });
      setState({ ...state });
    };
  };

  const appendExercise = () => {
    state.exercises.set(state.nextExerciseId++, { sets: new Map(), nextSetId: 0, name: 'name' });
    setState({ ...state });
  };

  const changeReps = (exerciseKey: number, key: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const set = state.exercises.get(exerciseKey)?.sets.get(key);
      if (set === undefined) {
        throw new Error();
      }
      set.reps = e.target.valueAsNumber;
      setState({ ...state });
    };
  };

  const changeWeight = (exerciseKey: number, key: number) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const set = state.exercises.get(exerciseKey)?.sets.get(key);
      if (set === undefined) {
        throw new Error();
      }
      set.weight = e.target.valueAsNumber;
      setState({ ...state });
    };
  };

  const deleteSet = (exerciseKey: number, key: number) => {
    return () => {
      state.exercises.get(exerciseKey)?.sets.delete(key);
      setState({ ...state });
    };
  };

  const createSets = (exerciseKey: number, sets: Map<number, SetState>) =>
    Array.from(sets).map(([k, v]) => (
      <Set
        changeReps={changeReps(exerciseKey, k)}
        changeWeight={changeWeight(exerciseKey, k)}
        deleteSet={deleteSet(exerciseKey, k)}
        weight={v.weight}
        reps={v.reps}
        key={k}
      />
    ));

  const createExercises = () =>
    Array.from(state.exercises).map(([k, v]) => (
      <div key={k}>
        {v.name}
        <button onClick={appendSet(k)}>Add set</button>
        {createSets(k, v.sets)}
      </div>
    ));

  return (
    <div>
      {createExercises()}
      <button onClick={appendExercise}>Append exercise</button>
    </div>
  );
}
