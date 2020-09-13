import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import Logout from './Logout.js'
import Divider from '@material-ui/core/Divider';
import GitHubIcon from '@material-ui/icons/GitHub';
import TextField from '@material-ui/core/TextField';


const useStyles = makeStyles((theme) =>({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    }
  },
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  }
}));

export default function  SettingsDialog(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  // always turns into table layout for what you want. ;) <font size=+2><blink>old tricks are best</bink></font>
  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
    
     <table><tr><td>
      <DialogTitle id="simple-dialog-title">User Settings</DialogTitle>
      </td><td><Logout color="inherit" onLogoutSuccess={()=>{handleClose();props.onLogoutSuccess()}}/>
      </td></tr></table>
    <List>
     <Divider />
        <ListItem> 
          <Avatar alt={props.userProfile.name} src={props.userProfile.imageUrl}/>
          &nbsp;{props.userProfile.email}
        </ListItem> 

         <Divider />

        <ListItem>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField id="projectId" label="Project ID" />
          </form>
        </ListItem> 
         <ListItem>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField id="bucketName" label="Bucket Name" />
          </form>
        </ListItem> 

      </List>
    </Dialog>
  );
}