import React from 'react';
import { gql, useQuery } from '@apollo/client';

const FIND_WORKOUTS = gql`
  query FindWorkouts {
    workouts {
      id
      exercises {
        sets {
          reps
          weight
        }
        name
      }
      date
    }
  }
`;

export const Workouts: React.FunctionComponent = () => {
  const { loading, error, data } = useQuery(FIND_WORKOUTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.workouts.map((w) => (
    <div key={w.id}>
      <div>
        {w.exercises.map((ex) => (
          <p key={ex.name}>{ex.name}</p>
        ))}
      </div>
    </div>
  ));
};
