import React, { useState, useEffect } from 'react';
import Set from './Set';
import { useParams } from 'react-router-dom';
import { gql, useApolloClient } from '@apollo/client';

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
  date: number;
}

const GET_WORKOUT = gql`
  query GetWorkout($id: String!) {
    workout(id: $id) {
      id
      date
      exercises {
        name
        sets {
          reps
          weight
        }
      }
    }
  }
`;

const UPDATE_WORKOUT = gql`
  mutation UpdateWorkout($workout: WorkoutInput!) {
    updateWorkout(workout: $workout)
  }
`;

function mapWorkout(workout: any): WorkoutState {
  let nextExerciseId = 0;
  const exercises: Map<number, ExerciseState> = workout.exercises.reduce((map, e) => {
    let nextSetId = 0;
    const sets: Map<number, SetState> = e.sets.reduce((map1, s) => {
      map1.set(nextSetId++, {
        reps: s.reps,
        weight: s.weight,
      });
      return map1;
    }, new Map());
    map.set(nextExerciseId++, {
      sets,
      nextSetId,
      name: e.name,
    });
    return map;
  }, new Map());
  return {
    date: workout.date,
    exercises,
    nextExerciseId,
  };
}

function mapWorkoutState(state: WorkoutState, id: string): any {
  const exercises = Array.from(state.exercises.values()).map((e) => {
    return {
      name: e.name,
      sets: Array.from(e.sets.values()).map((s) => {
        return {
          reps: !Number.isInteger(s.reps) ? 0 : s.reps,
          weight: !Number.isInteger(s.weight) ? 0 : s.weight,
        };
      }),
    };
  });
  return {
    exercises,
    id,
  };
}

export const Workout: React.FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const client = useApolloClient();

  const [state, setState] = useState<WorkoutState>({ exercises: new Map(), nextExerciseId: 0, date: 0 });
  useEffect(() => {
    client.query({ query: GET_WORKOUT, variables: { id } }).then(({ data }) => {
      setState(mapWorkout(data.workout));
    });
  }, []);

  const saveWorkout = () => {
    const workout = mapWorkoutState(state, id);
    client.mutate({ mutation: UPDATE_WORKOUT, variables: { workout } }).catch((error) => {
      console.log(error);
    });
  };

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
      <button onClick={saveWorkout}>Save workout</button>
    </div>
  );
};
