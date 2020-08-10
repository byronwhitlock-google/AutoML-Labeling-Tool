import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import NavigationDrawer from './NavigationDrawer.js'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function AppHeader(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <NavigationDrawer {...props} handleDocumentUpdate={props.handleDocumentUpdate} />
          <Typography variant="h6" className={classes.title}>
          AutoML Labeling Tool
          </Typography>
          <Button color="inherit" onClick={()=>{window.open("https://github.com/byronwhitlock-google/AutoML-Labeling-Tool")}}>
            <HelpOutlineIcon />
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}




