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
}

interface WorkoutsState {
  workouts: WorkoutItem[];
}

const FIND_WORKOUTS = gql`
  query FindWorkouts {
    workouts {
      id
      date
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

export const Workouts: React.FunctionComponent = () => {
  const [state, setState] = useState<WorkoutsState>({ workouts: [] });
  const client = useApolloClient();

  useEffect(() => {
    client
      .query({ query: FIND_WORKOUTS })
      .then(({ data }) => setState(data))
      .catch((error) => console.log(error));
  }, []);

  function appendExercise() {
    client
      .mutate({ mutation: CREATE_WORKOUT })
      .then(({ data }) => {
        const workouts = [...state.workouts];
        workouts.push({ id: data.createWorkout.id, date: data.createWorkout.date });
        const newState = { ...state };
        newState.workouts = workouts;
        setState(newState);
      })
      .catch((error) => console.log(error));
  }

  const workouts = state.workouts.map((w) => {
    return (
      <ListItem key={w.id} button component={NavLinkMui} to={'/workout/' + w.id}>
        {new Date(w.date * 1000).toLocaleString()}
      </ListItem>
    );
  });

  return (
    <>
      <button onClick={appendExercise}>Append exercise</button>
      <List>{workouts}</List>
    </>
  );
};
