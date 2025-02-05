import React, { useEffect, useState } from 'react';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import { List, ListItem } from '@material-ui/core';
import { NavLink } from 'react-router-dom';

class NavLinkMui extends React.Component<any> {
  render() {
    const { forwardedRef, to, ...props } = this.props;
    return <NavLink {...props} ref={forwardedRef} to={to} />;
  }
}

interface WorkoutItem {
  id: string;
  date: number;
  exerciseNumber: number;
}

interface WorkoutsState {
  workouts: WorkoutItem[];
}

const FIND_WORKOUTS = gql`
  query FindWorkouts {
    workouts {
      id
      date
      exercises {
        name
      }
    }
  }
`;

const CREATE_WORKOUT = gql`
  mutation CreateWorkout {
    createWorkout {
      id
      date
    }
  }
`;

const DELETE_WORKOUT = gql`
  mutation DeleteWorkout($id: String!) {
    deleteWorkout(id: $id)
  }
`;

export const Workouts: React.FunctionComponent = () => {
  const [state, setState] = useState<WorkoutsState>({ workouts: [] });
  const client = useApolloClient();

  function mapWorkouts(data): WorkoutsState {
    const workouts: WorkoutItem[] = data.workouts.map((w) => {
      return {
        id: w.id,
        date: w.date,
        exerciseNumber: w.exercises.length,
      };
    });
    return { workouts };
  }

  useEffect(() => {
    client
      .query({ query: FIND_WORKOUTS })
      .then(({ data }) => setState(mapWorkouts(data)))
      .catch((error) => console.log(error));
  }, []);

  function createWorkout() {
    client
      .mutate({ mutation: CREATE_WORKOUT })
      .then(({ data }) => {
        const workouts = [...state.workouts];
        workouts.push({ id: data.createWorkout.id, date: data.createWorkout.date, exerciseNumber: 0 });
        const newState = { ...state };
        newState.workouts = workouts;
        setState(newState);
      })
      .catch((error) => console.log(error));
  }

  function deleteWorkout(id: string): () => void {
    return () => {
      client.mutate({ mutation: DELETE_WORKOUT, variables: { id } }).catch((error) => console.log(error));
      const idx = state.workouts.findIndex((i) => i.id === id);
      setState((newState) => {
        newState.workouts.splice(idx, 1);
        return { ...newState };
      });
    };
  }

  const workouts = state.workouts.map((w) => {
    const workoutTitle = new Date(w.date * 1000).toLocaleString() + ' ' + w.exerciseNumber;
    return (
      <div key={w.id}>
        <ListItem button component={NavLinkMui} to={'/workout/' + w.id}>
          {workoutTitle}
        </ListItem>
        <button onClick={deleteWorkout(w.id)}>Delete workout</button>
      </div>
    );
  });

  return (
    <>
      <button onClick={createWorkout}>Create workout</button>
      <List>{workouts}</List>
    </>
  );
};
