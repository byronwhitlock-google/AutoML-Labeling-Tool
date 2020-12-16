
import React, { useState } from 'react';
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
import Divider from '@material-ui/core/Divider';
import GitHubIcon from '@material-ui/icons/GitHub';
import TextField from '@material-ui/core/TextField';
import GlobalConfig from './lib/GlobalConfig.js'
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

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
  const [reloadOnClose, setReloadOnClose] = useState(false);

  const handleClose = () => {
    onClose(selectedValue);   
    if (reloadOnClose){
      setTimeout(()=>window.location.reload(true),1);
    }
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  const handleUpdateProjectId = (evt)=> {
    if (config.projectId != evt.target.value) {
      config.projectId = evt.target.value;
      config.persist()
      setReloadOnClose(true)
    }
  };

  const handleUpdateLocationId = (evt)=> {
    if (config.locationId != evt.target.value) {
      config.locationId = evt.target.value;
      config.persist()
      setReloadOnClose(true)
    }
  };

  const handleUpdateBucketName = (evt)=> {
   if (config.bucketName != evt.target.value) {
      config.bucketName = evt.target.value;
      config.persist()
      setReloadOnClose(true)
    }
  };

  // always turns into table layout for what you want. ;) <font size=+2><blink>old tricks are best</bink></font>
  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
    
    <table><tr>
        <td width="100%"><center><Typography variant="h6">My Configuration</Typography>  </center>   </td>
      <td> <IconButton aria-label="close" onClick={props.onClose}>
          <CloseIcon />
        </IconButton>   </td>
      </tr></table>

    <List>
     <Divider />
        <ListItem>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField id="bucketName" label="Bucket Name" onChange={handleUpdateBucketName} defaultValue={config.bucketName}/>
          </form>
        </ListItem> 
        <ListItem>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField id="projectId" label="Project ID"  onChange={handleUpdateProjectId} defaultValue={config.projectId}/>
          </form>
        </ListItem> 
        <ListItem>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField id="locationId" label="Location"  onChange={handleUpdateLocationId} defaultValue={config.locationId}/>
          </form>
        </ListItem>         
      </List>
    </Dialog>
  );
}