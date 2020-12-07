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
import Divider from '@material-ui/core/Divider';
import GitHubIcon from '@material-ui/icons/GitHub';
import TextField from '@material-ui/core/TextField';
import GlobalConfig from './lib/GlobalConfig.js'
import SettingsIcon from '@material-ui/icons/Settings';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';


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

export default function  BucketSettingsDialog(props) {
  const classes = useStyles();
  const { onClose, selectedValue, open } = props;
  var config = new GlobalConfig();

  const handleClose = () => {
    onClose(selectedValue);
  };


  // always turns into table layout for what you want. ;) <font size=+2><blink>old tricks are best</bink></font>
  return (
    <React.Fragment>
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
    
     <DialogTitle id="simple-dialog-title">Bucket Configuration</DialogTitle>
        
      <JSONInput
          id          = 'a_unique_id'
          placeholder = { sampleObject }
          colors      = { darktheme }
          locale      = { locale }
          height      = '550px'
      />
    </Dialog>
    </React.Fragment>
  );
}