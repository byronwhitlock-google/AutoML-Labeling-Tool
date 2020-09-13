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
import GlobalConfig from './lib/GlobalConfig.js'

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
  var config = new GlobalConfig();

  const handleClose = () => {
    onClose(selectedValue);
    setTimeout(()=>window.location.reload(true),1);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  const handleUpdateProjectId = (evt)=> {
    config.projectId = evt.target.value;
    config.persist();
  };

  const handleUpdateBucketName = (evt)=> {
    config.bucketName = evt.target.value;
    config.persist();
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
            <TextField id="projectId" label="Project ID"  onChange={handleUpdateProjectId} defaultValue={config.projectId}/>
          </form>
        </ListItem> 
         <ListItem>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField id="bucketName" label="Bucket Name" onChange={handleUpdateBucketName} defaultValue={config.bucketName}/>
          </form>
        </ListItem> 

      </List>
    </Dialog>
  );
}