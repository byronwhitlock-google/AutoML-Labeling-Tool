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
import GlobalConfig from './lib/GlobalConfig.js'
import FileSaver  from 'file-saver';
import SettingsIcon from '@material-ui/icons/Settings';
import Blob from 'blob'
import ErrorTwoToneIcon from '@material-ui/icons/ErrorTwoTone';
import CheckCircleTwoToneIcon from '@material-ui/icons/CheckCircleTwoTone';

class NavigationDrawer extends Component {
  constructor(props) {
      super(props);

    this.handleGenerateCsvClick = this.handleGenerateCsvClick.bind(this)
     // this.config = props.config
    console.log("NavigationDrawer props")
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
      isOpen: false
  };


  async handleGenerateCsvClick() {
    var config = new GlobalConfig();
    try {
      var csv = await this.props.generateCsv()
      var gif = process.env.PUBLIC_URL +'/training-animation.gif'
      this.props.setAlert(
        ` <img style='float:right' width='50%' src='${gif}'><h3>gs://${csv.path}</h3> <B>${csv.numRecords}</b> Documents Labeled.<p> Please go to <a href='https://console.cloud.google.com/natural-language/datasets'>AutoML Cloud Console</a> to import dataset.`,
        "CSV Generation Success")
    } catch (e)
    {
      this.props.setError(e.message,"CSV Generation Failed")
    }
    /*
    try {
      // grab the csv, stub for now.
      var csv = await this.props.loadCsv()
      var blob = new Blob([csv.data], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, `automl-labeled-${config.bucketName}.csv`);
    } 
    catch (e)
    {
      this.props.setError(e.message,"Download Failed")
    }*/
  }

  handleDocumentClick =  (newDocumentSrc) => {
    // do a full refresh for new docuemnt keep things snappy?
    window.location = '/'+newDocumentSrc
    // this.props.handleDocumentUpdate(newDocumentSrc)
  }

  toggleDrawer = (open) => (event) => {
    
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    // don't await this call
    // poor mans async
    //setTimeout(function() {
     
    //},0);
    
    this.setState({ ...this.state, isOpen: !this.state.isOpen });
    this.props.refreshDocumentList()
  };

  renderGenerateCsv()
  {
    if (this.props.documentList.length > 0)
      return (
        <ListItem onClick={this.handleGenerateCsvClick} button key="generate-csv">
          <SettingsIcon color="primary"/>
          <ListItemText primary="Generate Training CSV" secondary="AutoML Natural Language format"/>
        </ListItem>
        )
  }
  list() { 
    var config = new GlobalConfig();
    return (    
    <div
      className={clsx(this.classes.list, {
        [this.classes.fullList]: false,
      })}
      role="presentation"
      onClick={this.toggleDrawer(false)}
      onKeyDown={this.toggleDrawer(false)}
    >
    <List color="primary">    
        <ListItem  key="">
          <ListIcon/>
          <ListItemText primary={config.bucketName} />
        </ListItem>
        <Divider/>    
        {this.renderGenerateCsv()}
        <Divider/>    
        {this.props.documentList.map((document) => (
           <Tooltip title={`${document.name} ${document.labeled?" has been labeled.":" has NOT been labeled."}`}>   
            <ListItem button  
            onClick={()=>this.handleDocumentClick(document.name)} 
            key={document.name} 
            selected={document.name.localeCompare(this.props.selectedDocument)==0? true:false} 
            primary={document.name} >

              {document.labeled?
                <CheckCircleTwoToneIcon style={{ color: 'green'}}/>:
                <ErrorTwoToneIcon  style={{ color: 'red'}}/> }
                <ListItemText primary={document.name} />
            </ListItem>
          </Tooltip>
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