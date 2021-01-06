import { Client } from 'pg';
import { WorkoutInput, Workout, ExerciseInput } from '../shared/apiModel'

interface WorkoutData {
  id: string;
  date: number;
  exercises: ExerciseInput[];
}

interface WorkoutRow {
  id: number;
  user: string;
  data: WorkoutData;
}

function mapWorkout(result: WorkoutRow): Workout {
  const workout = result.data;
  return { ...workout, id: result.id };
}

async function getWorkoutInternal(db: Client, id: string): Promise<WorkoutRow> {
  const results = await db.query('SELECT * FROM workout where id = $1', [id]);
  if (results.rows.length != 0) {
    const result = results.rows[0];
    const workout = result.data;
    workout.id = result.id;
    return result;
  }
  return null;
}

export async function getWorkout(db: Client, userId: string, id: string): Promise<Workout> {
  const workout = await getWorkoutInternal(db, id);
  if (workout.user === userId) {
    return mapWorkout(workout);
  }
  return null;
}

export async function findWorkouts(db: Client, userId: string): Promise<Workout[]> {
  const results = await db.query('SELECT * FROM workout where "user" = $1 limit 10', [userId]);
  return results.rows.map((result) => {
    return mapWorkout(result);
  });
}

export async function updateWorkout(db: Client, userId: string, workout: WorkoutInput): Promise<void> {
  const existingWorkout = await getWorkoutInternal(db, workout.id);
  if (existingWorkout.user !== userId) {
    return;
  }
  const date = Math.floor(Date.now() / 1000);
  const dbWorkout = {
    ...workout,
    date,
  };
  await db.query('UPDATE workout set data = $1 where id = $2', [dbWorkout, workout.id]);
}

export async function createWorkout(db: Client, userId: string): Promise<Workout> {
  const date = Math.floor(Date.now() / 1000);
  const workout = {
    date,
    exercises: [],
  };
  const results = await db.query('insert into workout("user", data) values ($1, $2) RETURNING id;', [userId, workout]);
  return { ...workout, id: results.rows[0].id };
}

export async function deleteWorkout(db: Client, userId: string, id: string): Promise<void> {
  const existingWorkout = await getWorkoutInternal(db, id);
  if (existingWorkout.user !== userId) {
    return;
  }
  await db.query('delete from workout where id = $1', [id]);
}
