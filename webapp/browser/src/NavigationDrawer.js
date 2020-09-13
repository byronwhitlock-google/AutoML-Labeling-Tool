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

import React, { Component } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListIcon from '@material-ui/icons/List';
import ListItemText from '@material-ui/core/ListItemText';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import DescriptionTwoToneIcon from '@material-ui/icons/DescriptionTwoTone';
import Tooltip from '@material-ui/core/Tooltip';

class NavigationDrawer extends Component {
  constructor(props) {
      super(props);

      this.config = props.config
    console.log("NavigationDrawer: WTF??!?!?")
console.log(props)
  }

  classes = makeStyles({
              list: {
                width: 250,
              },
              fullList: {
                width: 'auto',
              },
            });
  state = {
      data: null,
      documentList: Array(),
      isOpen: false
  };


  componentDidMount() {
    console.log("componentDidMount??!?!?")
console.log(this.props)
      // Call our fetch function below once the component mounts
    this.loadDocumentList()
      .then(res=>this.parseDocumentList(res))
      .catch(err => console.error(err));
  }

  parseDocumentList(res)
  {
    if (res.hasOwnProperty('data'))
    {
      this.setState({...this.state, documentList: res.data })
    }
    else if (res.hasOwnProperty('error'))
      console.error(res.error)
    else
      console.error("Unknown Error : "+JSON.stringify(res));
  }
  
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  loadDocumentList = async () => {
    console.log("in loadDocumentList()")

    const response = await fetch('/list_documents', {
      method: "GET",
      headers: { 
        'X-Bearer-Token': this.config.accessToken,
        'X-Project-Id': this.config.projectId,
        'X-Bucket-Name': this.config.bucketName
      }
    });

    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  handleDocumentClick =  (newDocumentSrc) => {
    this.props.handleDocumentUpdate(newDocumentSrc)
  }

  toggleDrawer = (open) => (event) => {
    
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    
    this.setState({ ...this.state, isOpen: !this.state.isOpen });
  };

  list() { 
    return (    
    <div
      className={clsx(this.classes.list, {
        [this.classes.fullList]: false,
      })}
      role="presentation"
      onClick={this.toggleDrawer(false)}
      onKeyDown={this.toggleDrawer(false)}
    >
    <List>    
        <ListItem selected key="">
        <ListIcon/>
          <ListItemText primary={this.config.bucketName} />
        </ListItem>
        <Divider/>    
        {this.state.documentList.map((text, index) => (
          <ListItem button key={text} selected={text.localeCompare(this.props.selectedDocument)==0? true:false} primary={text} >
          <DescriptionTwoToneIcon/>
            <ListItemText onClick={()=>this.handleDocumentClick(text)} primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
    );
  }
  render() {


    return (
      <React.Fragment>
        <Tooltip title="Select another file from cloud storage to label">          
          <IconButton edge="start" className={this.classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon  onClick={this.toggleDrawer('left', true)} />
          </IconButton>      
        </Tooltip>    
        <SwipeableDrawer
          anchor='left'
          open={this.state.isOpen}
          onClose={this.toggleDrawer('left', false)}
          onOpen={this.toggleDrawer('left', true)}
        >
          {this.list('left')}
        </SwipeableDrawer>
    
      </React.Fragment>
    );
  }
}

export default NavigationDrawer;