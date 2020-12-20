import express from 'express';
import path from 'path';
import { apiRouter } from './routes/api-router';
import { pagesRouter } from './routes/pages-router';
import { staticsRouter } from './routes/statics-router';
import * as config from './config';
import { ApolloServer, gql } from 'apollo-server-express';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

console.log(`*******************************************`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`config: ${JSON.stringify(config, null, 2)}`);
console.log(`*******************************************`);

const app = express();
app.set('view engine', 'ejs');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type Set {
    weight: Int!
    reps: Int!
  }

  type Exercise {
    sets: [Set!]!
    name: String!
  }

  type Workout {
    id: String!
    date: Int!
    exercises: [Exercise!]!
  }

  input SetInput {
    weight: Int!
    reps: Int!
  }

  input ExerciseInput {
    sets: [SetInput!]!
    name: String!
  }

  input WorkoutInput {
    id: String!
    exercises: [ExerciseInput!]!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    workouts: [Workout]!
    workout(id: String!): Workout
  }

  type Mutation {
    updateWorkout(workout: WorkoutInput!): Boolean
    createWorkout: Workout!
  }
`;

const workouts = [
  {
    date: 5678,
    exercises: [
      {
        name: 'bench press',
        sets: [
          {
            weight: 12,
            reps: 13,
          },
        ],
      },
      {
        name: 'push-up',
        sets: [
          {
            reps: 10,
            weight: 0,
          },
        ],
      },
    ],
  },
  {
    date: 1234,
    exercises: [
      {
        name: 'bench press',
        sets: [
          {
            weight: 12,
            reps: 13,
          },
        ],
      },
      {
        name: 'push-up',
        sets: [
          {
            reps: 10,
            weight: 0,
          },
        ],
      },
    ],
  },
];

const resolvers = {
  Query: {
    workouts: async (parent, args, context) => {
      const db: Database<sqlite3.Database, sqlite3.Statement> = context.db;
      const results = await db.all<{ rowid: number; data: string }[]>('SELECT rowid, data FROM workout limit 10');
      return results.map((result) => {
        const workout = JSON.parse(result.data);
        workout.id = result.rowid;
        return workout;
      });
    },
    workout: async (parent, args, context) => {
      const db: Database<sqlite3.Database, sqlite3.Statement> = context.db;
      const results = await db.all<{ rowid: number; data: string }[]>(
        'SELECT rowid, data FROM workout where rowid = ?',
        args.id,
      );
      if (results.length != 0) {
        const result = results[0];
        const workout = JSON.parse(result.data);
        workout.id = result.rowid;
        return workout;
      }
      return null;
    },
  },
  Mutation: {
    updateWorkout: async (parent, args, context) => {
      const db: Database<sqlite3.Database, sqlite3.Statement> = context.db;
      const date = Math.floor(Date.now() / 1000);
      const workout = args.workout;
      workout.date = date;
      await db.run('UPDATE workout set data = json(?) where rowid = ?', JSON.stringify(workout), workout.id);
    },
    createWorkout: async (parent, args, context) => {
      const db: Database<sqlite3.Database, sqlite3.Statement> = context.db;
      const date = Math.floor(Date.now() / 1000);
      const workout = {
        date,
        exercises: [],
      };
      await db.run('insert into workout values (json(?));', JSON.stringify(workout));
      const results = await db.all<{ rowid: number; data: string }[]>('SELECT last_insert_rowid() as rowid;');
      return { ...workout, id: results[0].rowid };
    },
  },
};

// open the database
(async () => {
  // open the database
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database,
  });

  await db.exec('CREATE TABLE if not exists workout (data TEXT)');
  workouts.forEach(async (val) => {
    await db.run('INSERT INTO workout VALUES (json(?))', JSON.stringify(val));
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { db },
  });

  server.applyMiddleware({ app, path: '/data' });

  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
  app.use(apiRouter());
  app.use(staticsRouter());
  app.use(pagesRouter());

  app.listen(config.SERVER_PORT, () => {
    console.log(`App listening on port ${config.SERVER_PORT}!`);
  });
})();
