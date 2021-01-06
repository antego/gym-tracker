import express from 'express';
import path from 'path';
import { pagesRouter } from './routes/pages-router';
import { staticsRouter } from './routes/statics-router';
import * as config from './config';
import { ApolloServer, AuthenticationError, gql } from 'apollo-server-express';
import { Client } from 'pg';
import { ClaimVerifyResult, validateToken } from './validateToken';
import * as workoutService from './workoutService';

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
    deleteWorkout(id: String!): Boolean
  }
`;

async function migrate(client: Client, migrations: { key: string; migration: string }[]) {
  await client.query('create table if not exists changelog (id text primary key, data json)');
  let foundUnaplied = false;
  let appliedNumber = 0;
  for (const m of migrations) {
    const result = await client.query('select id, data from changelog where id = $1', [m.key + '_migration']);
    if (result.rows.length === 1) {
      if (foundUnaplied) {
        console.warn(`Migration ${m.key} goes after unaplied migrations but was already applied.`);
      }
      continue;
    } else if (result.rows.length === 0) {
      foundUnaplied = true;
      const date = Date.now();
      await client.query(m.migration);
      await client.query('insert into changelog (id, data) values ($1, $2)', [m.key + '_migration', { date }]);
      appliedNumber++;
    } else {
      console.error(`Got more than applied migrations for key ${m.key}`);
    }
  }
  console.info(`MIGRATOR: applied ${appliedNumber} migrations`);
}

interface Context {
  db: Client;
  userData: ClaimVerifyResult;
}

const resolvers = {
  Query: {
    workouts: async (parent, args, context: Context) => {
      return workoutService.findWorkouts(context.db, context.userData.userId);
    },
    workout: async (parent, args, context: Context) => {
      return workoutService.getWorkout(context.db, context.userData.userId, args.id);
    },
  },
  Mutation: {
    updateWorkout: async (parent, args, context: Context) => {
      return workoutService.updateWorkout(context.db, context.userData.userId, args.workout);
    },
    createWorkout: async (parent, args, context: Context) => {
      return workoutService.createWorkout(context.db, context.userData.userId);
    },
    deleteWorkout: async (parent, args, context: Context) => {
      return workoutService.deleteWorkout(context.db, context.userData.userId, args.id);
    },
  },
};

// open the database
(async () => {
  // open the database
  const client = new Client({
    connectionString: config.POSTGRES_URL,
    ssl: config.IS_DEV
      ? false
      : {
          rejectUnauthorized: false,
        },
  });

  client.connect();

  migrate(client, [
    {
      key: 'create-workout-table',
      migration:
        'CREATE TABLE if not exists workout (id SERIAL, "user" text not null, data json); create index user_idx on workout ("user");',
    },
  ]);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const header = req.headers.authorization;
      if (!header) {
        throw new AuthenticationError('you must be logged in');
      } else {
        const userData = await validateToken({ token: header.replace(/^Bearer\ /, '') });
        console.log(userData);
        if (userData.isValid !== true) {
          throw new AuthenticationError('invalid token');
        }
        return { db: client, userData };
      }
    },
  });

  server.applyMiddleware({ app, path: '/data' });

  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
  app.use(staticsRouter());
  app.use(pagesRouter());

  app.listen(config.SERVER_PORT, () => {
    console.log(`App listening on port ${config.SERVER_PORT}!`);
  });
})();
