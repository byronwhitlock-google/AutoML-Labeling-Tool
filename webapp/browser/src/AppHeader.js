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
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import NavigationDrawer from './NavigationDrawer.js'
import Logout from './Logout.js';
import Login from './Login.js';
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
  const renderLogin = (props)=> {
    if (props.isLoggedIn)
      return (<Logout onLogoutSuccess={props.onLogoutSuccess}/>)
    else
      return (<Login onSuccess={props.onLoginSuccess} onFailure={props.onLoginFailure}/>)
  }
  const classes = useStyles();
    console.log("WTF??!?!?")
console.log(props.accessToken)
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <NavigationDrawer {...props} handleDocumentUpdate={props.handleDocumentUpdate} />
          <Typography variant="h6" className={classes.title}>
          AutoML Labeling Tool
          </Typography>
          {renderLogin(props)}
          <Button color="inherit" onClick={()=>{window.open("https://github.com/byronwhitlock-google/AutoML-Labeling-Tool")}}>
            <HelpOutlineIcon />
          </Button>
                    
        </Toolbar>
      </AppBar>
    </div>
  );
}




