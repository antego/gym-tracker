import { CssBaseline, makeStyles } from '@material-ui/core';
import { createStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { Home } from './components/Home';
import { Usage } from './components/Usage';
import { LazyLoadingExample } from './components/LazyLoadingExample';
import { RouterExample } from './components/RouterExample';
import { StyledComponentsExample } from './components/StyledComponentsExample';
import { UsersList } from './components/UsersList';
import { Workouts } from './components/Workouts';
import { Workout } from './components/Workout';
import { ApolloProvider } from '@apollo/client';
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Amplify, { Auth } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

declare let COGNITO_URL: string;
declare let IS_DEV: boolean;

const authConfig = {
  // REQUIRED - Amazon Cognito Region
  region: 'us-east-1',

  // OPTIONAL - Amazon Cognito User Pool ID
  userPoolId: 'us-east-1_G18pbuB1j',

  // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
  userPoolWebClientId: '7smtj4htk4a090tk9hdalmobgq',
  endpoint: COGNITO_URL,
  authenticationFlowType: IS_DEV ? 'USER_PASSWORD_AUTH' : 'USER_SRP_AUTH',
};
Amplify.configure({
  Auth: authConfig,
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    main: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    toolbar: theme.mixins.toolbar,
  }),
);

const httpLink = createHttpLink({
  uri: '/data',
});

const authLink = setContext((_, { headers }) => {
  return Auth.currentSession()
    .then((session) => {
      const accessToken = session.getAccessToken();
      const jwt = accessToken.getJwtToken();
      console.log(`Token: ${JSON.stringify(accessToken)}`);
      console.log(`Jwt: ${jwt}`);
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${jwt}`,
        },
      };
    })
    .catch((e) => {
      console.error(e);
      headers;
    });
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const App = () => {
  const classes = useStyles({});

  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <div className={classes.root}>
          <CssBaseline />
          <Header />
          <SideMenu />
          <main className={classes.main}>
            <div className={classes.toolbar} />
            <Switch>
              <Route exact path='/' component={Home} />
              <Route exact path='/usage' component={Usage} />
              <Route path='/fetch-example' component={UsersList} />
              <Route path='/lazy-example' component={LazyLoadingExample} />
              <Route path='/styled-example' component={StyledComponentsExample} />
              <Route path='/router-example/:slug' component={RouterExample} />
              <Route path='/workouts' component={Workouts} />
              <Route path='/workout/:id' component={Workout} />
            </Switch>
          </main>
        </div>
      </BrowserRouter>
    </ApolloProvider>
  );
};

export default withAuthenticator(App);
