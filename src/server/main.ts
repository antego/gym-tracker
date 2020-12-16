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

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    workouts: [Workout]!
    workout(id: ID!): Workout
    books: [Book]
  }
`;

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

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
    books: () => books,
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
