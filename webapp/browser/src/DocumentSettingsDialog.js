/*
# Copyright 2020 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#            http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/
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
import SettingsIcon from '@material-ui/icons/Settings';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import GlobalConfig from './lib/GlobalConfig';

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

export default function  DocumentSettingsDialog(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;


  const handleClose = () => {
    onClose(selectedValue);
  };
  const handleOnChange = (evt)=> {
    if(evt.jsObject) {
      setContent(evt.jsObject)
    }
  }
  const handleSave = (evt)=> {
      if (props.handleSaveConfig(content)) {
        handleClose()
      }
  }
  const [content, setContent] = useState( props.globalConfigData);
  var config = new GlobalConfig(props.globalConfigData)
  // always turns into table layout for what you want. ;) <font size=+2><blink>old tricks are best</bink></font>
  return (
    <React.Fragment>
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>    
      <DialogTitle id="simple-dialog-title">
        <table><tr>
          <td width="100%">  <Typography variant="h6">Document Settings</Typography>   </td>
        <td> <IconButton aria-label="close" onClick={props.onClose}>
            <CloseIcon />
          </IconButton>     </td>
        </tr></table>
        
          
      </DialogTitle>
      
      <table>
        
        <tr><td>  
          <JSONInput
              id          = 'document_settings_configzs'
              placeholder = { props.globalConfigData }
              //colors      = { darktheme }
              locale      = { locale }
              height      = '550px'
              onChange    = {handleOnChange}
          />
          
        </td></tr>
        <tr><td><br></br></td></tr>
        <tr><td>
          <Button color="inherit" onClick={handleSave}>
            <SaveIcon color="primary"/>Apply CONFIG to ALL DOCUMENTS in gs://{config.bucketName}
          </Button>
        </td></tr>
      </table>
    </Dialog>
  </React.Fragment>
  );
}