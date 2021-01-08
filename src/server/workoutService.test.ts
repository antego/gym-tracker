import { Client } from 'pg';
import * as workoutService from './workoutService';
import * as config from './config';

const client = new Client({
  connectionString: config.POSTGRES_URL,
  ssl: config.IS_DEV
    ? false
    : {
        rejectUnauthorized: false,
      },
});

beforeAll(async () => {
  await client.connect();
});

beforeEach(async () => {
  await client.query('delete from workout;');
});

afterAll(async () => {
  await client.end();
});

test('find workouts doesnt return results', async () => {
  const res = await workoutService.findWorkouts(client, 'user1');
  expect(res.length).toBe(0);
});

test('find workouts of another user', async () => {
  await workoutService.createWorkout(client, 'user1');
  const res = await workoutService.findWorkouts(client, 'user2');
  expect(res.length).toBe(0);
});

test('find workouts of the same user', async () => {
  await workoutService.createWorkout(client, 'user1');
  const res = await workoutService.findWorkouts(client, 'user1');
  expect(res.length).toBe(1);
});

test('update workout', async () => {
  const workout = await workoutService.createWorkout(client, 'user1');
  workout.exercises = [{ name: 'olo', sets: [] }];
  await workoutService.updateWorkout(client, 'user1', { ...workout, id: String(workout.id) });
  const res = await workoutService.findWorkouts(client, 'user1');
  expect(res[0].exercises[0].name).toBe('olo');
});

test('delete workout', async () => {
  const workout = await workoutService.createWorkout(client, 'user1');
  await workoutService.deleteWorkout(client, 'user1', String(workout.id));
  const res = await workoutService.findWorkouts(client, 'user1');
  expect(res.length).toBe(0);
});

test('cant update workout of other user', async () => {
  const workout = await workoutService.createWorkout(client, 'user1');
  workout.exercises = [{ name: 'olo', sets: [] }];
  await workoutService.updateWorkout(client, 'user2', { ...workout, id: String(workout.id) });
  const res = await workoutService.findWorkouts(client, 'user1');
  expect(res[0].exercises.length).toBe(0);
});

test('cant delete workout of other user', async () => {
  const workout = await workoutService.createWorkout(client, 'user1');
  await workoutService.deleteWorkout(client, 'user2', String(workout.id));
  const res = await workoutService.findWorkouts(client, 'user1');
  expect(res.length).toBe(1);
});
