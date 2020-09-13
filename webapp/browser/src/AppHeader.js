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
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import SettingsOutlineIcon from '@material-ui/icons/Settings';
import NavigationDrawer from './NavigationDrawer.js'
import Logout from './Logout.js';
import Login from './Login.js';
import SettingsDialog from './SettingsDialog.js'
import Avatar from '@material-ui/core/Avatar';
import GitHubIcon from '@material-ui/icons/GitHub';
import Tooltip from '@material-ui/core/Tooltip';

// refresh token
import { refreshTokenSetup } from './lib/refreshToken';

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
  // closures are why we love js. 
  const [settingsOpen, setSettingsOpen] = useState(0);

  const renderSettings = (props)=> { 
    // scope? we dont need your stinking scope.
    // settingsOpen and setSettingsOpen() defined in outer closure

    if (props.isLoggedIn)
      return (
        <React.Fragment>

          <Tooltip title={`Configure User Settings for ${props.userProfile.email}`}>
            <Button color="inherit" onClick={()=>{setSettingsOpen(1)}}>
              <Avatar alt={props.userProfile.name} src={props.userProfile.imageUrl}/>
            </Button>
          </Tooltip>
          <SettingsDialog onClose={()=>{setSettingsOpen(0)}} open={settingsOpen}  onLogoutSuccess={props.onLogoutSuccess}  {...props}/>
          
        </React.Fragment>
          )
          
    else
      return (
      <Tooltip title="Login With Google Account">
        <Login onSuccess={props.onLoginSuccess} onFailure={props.onLoginFailure}/>
      </Tooltip>
      )
  }
  
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
            <NavigationDrawer {...props} handleDocumentUpdate={props.handleDocumentUpdate} />
          
          <Typography variant="h6" className={classes.title}>
          AutoML Labeling Tool
          </Typography>
          <Tooltip title="View documentation and source code on Github">
            <Button onClick={()=>{window.open("https://github.com/byronwhitlock-google/AutoML-Labeling-Tool")}}>            
              <GitHubIcon  color="inherit"/>            
            </Button>
          </Tooltip>
          {renderSettings(props)}          

          

                    
        </Toolbar>
      </AppBar>
    </div>
  );
}




