export interface SetInput {
  weight: number;
  reps: number;
}

export interface ExerciseInput {
  sets: SetInput[];
  name: string;
}

export interface WorkoutInput {
  id: string;
  exercises: ExerciseInput[];
}

export interface Set {
  weight: number;
  reps: number;
}

export interface Exercise {
  sets: Set[];
  name: string;
}

export interface Workout {
  id: number;
  date: number;
  exercises: Exercise[];
}
