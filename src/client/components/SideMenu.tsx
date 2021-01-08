import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, makeStyles, IconButton } from '@material-ui/core';
import { createStyles, Theme } from '@material-ui/core/styles';
import UsageIcon from '@material-ui/icons/Code';
import HomeIcon from '@material-ui/icons/Home';
import RouterIcon from '@material-ui/icons/Storage';
import FetchIcon from '@material-ui/icons/CloudDownload';
import StyledIcon from '@material-ui/icons/Style';
import LazyIcon from '@material-ui/icons/SystemUpdateAlt';
import React from 'react';
import { NavLink } from 'react-router-dom';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

class NavLinkMui extends React.Component<any> {
  render() {
    const { forwardedRef, to, ...props } = this.props;
    return <NavLink {...props} ref={forwardedRef} to={to} />;
  }
}

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    toolbar: theme.mixins.toolbar,
  }),
);

type Props = {
  isOpen: boolean;
  closeDrawer: () => void;
};

export const SideMenu: React.FunctionComponent<Props> = ({ isOpen, closeDrawer }) => {
  const classes = useStyles({});
  return (
    <Drawer
      className={classes.drawer}
      variant='temporary'
      open={isOpen}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <IconButton onClick={closeDrawer}>
        <ChevronLeftIcon />
      </IconButton>
      <div className={classes.toolbar} />
      <List>
        <ListItem button component={NavLinkMui} to='/'>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary='Home' />
        </ListItem>
        <ListItem button component={NavLinkMui} to='/usage'>
          <ListItemIcon>
            <UsageIcon />
          </ListItemIcon>
          <ListItemText primary='Usage' />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={NavLinkMui} to='/fetch-example'>
          <ListItemIcon>
            <FetchIcon />
          </ListItemIcon>
          <ListItemText primary='Fetch' />
        </ListItem>
        <ListItem button component={NavLinkMui} to='/lazy-example'>
          <ListItemIcon>
            <LazyIcon />
          </ListItemIcon>
          <ListItemText primary='Lazy Loading' />
        </ListItem>
        <ListItem button component={NavLinkMui} to='/styled-example'>
          <ListItemIcon>
            <StyledIcon />
          </ListItemIcon>
          <ListItemText primary='Styled Components' />
        </ListItem>
        <ListItem button component={NavLinkMui} to='/router-example/1234'>
          <ListItemIcon>
            <RouterIcon />
          </ListItemIcon>
          <ListItemText primary='React-Router' />
        </ListItem>
        <ListItem button component={NavLinkMui} to='/workouts'>
          <ListItemIcon>
            <RouterIcon />
          </ListItemIcon>
          <ListItemText primary='Workouts' />
        </ListItem>
      </List>
    </Drawer>
  );
};
