import { AppBar, makeStyles, Toolbar, Typography, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { createStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { AmplifySignOut } from '@aws-amplify/ui-react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    title: {
      flexGrow: 1,
    },
  }),
);
export const Header: React.FunctionComponent<{ toggleSideMenu: () => void }> = (props: {
  toggleSideMenu: () => void;
}) => {
  const classes = useStyles({});
  return (
    <AppBar position='fixed' className={classes.appBar}>
      <Toolbar>
        <IconButton color='inherit' aria-label='open drawer' onClick={props.toggleSideMenu} edge='start'>
          <MenuIcon />
        </IconButton>
        <Typography variant='h6' noWrap className={classes.title}>
          Fullstack TypeScript
        </Typography>
        <AmplifySignOut />
      </Toolbar>
    </AppBar>
  );
};
