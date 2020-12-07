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
import { FixedSizeList ,VariableSizeList} from 'react-window';
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
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import Button from '@material-ui/core/Button';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import GTranslateIcon from '@material-ui/icons/GTranslate';
import AutoMLIcon from './svg/AutoMLIcon.js';
import CloudStorageIcon from './svg/CloudStorageIcon.js';

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
    //window.location = '/'+newDocumentSrc
    this.props.handleDocumentUpdate(newDocumentSrc)
  }
  componentDidMount =()=>{
    this.setState({windowHeight: window.innerHeight -325}) ;
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
    //setTimeout(function() {
    // this.props.refreshDocumentList()
    //},100);
  };

  list() { 
    var config = new GlobalConfig();
    const getItemSize = index => {
      // return a size for items[index]
      return 45
    }
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
    <Tooltip title="Manage configuration for this project.">     
      <ListItem onClick={this.props.handleShowBucketSettings}  button key="show-bucket-settings">
        <CloudStorageIcon/>&nbsp;&nbsp;&nbsp;
        <ListItemText secondary={`gs://${config.bucketName}/`} primary={`Cloud Storage Bucket`}/>
      </ListItem>
      </Tooltip>
      <Divider/>    
        {this.props.documentList.length> 0 && 
        <Tooltip title="Generate a CSV file for training a new new model in the AutoML API.">     
          <ListItem onClick={this.handleGenerateCsvClick} button key="generate-csv">            
          <AutoMLIcon/>&nbsp;&nbsp;&nbsp;
          <ListItemText primary="Generate CSV" secondary="AutoML training"/>
            
          </ListItem>
        </Tooltip>
        }
        <Divider/>    
        { this.props.documentList.length>0 &&
          <Tooltip title="Clicking this button will load a random unlabeled document from the bucket.">     
            <ListItem button onClick={this.props.handleNextRandom} key="nextRandom">        
            <AutorenewIcon />&nbsp;&nbsp;&nbsp;
            <ListItemText primary="Shuffle Next" secondary="I'm feeling lucky"/>
                
            </ListItem>
           </Tooltip>   
        }

        {this.props.documentList.length == 0  && 
          <React.Fragment>
            <Divider/>   
              <ListItem  key="">
              
                <center>
                <Loader
                  type="ThreeDots"
                  color="#3f51b5"
                  height={75}
                  width={200}
                  timeout={20000} //3 secs
                />      
                </center> 
            </ListItem>
          </React.Fragment>
        }   
        {this.props.documentList.length != 0  &&
          <React.Fragment>
            <Divider/>   
            <ListItem  key="">
              <ListItemText primary="Documents"/>
            </ListItem>
          </React.Fragment> 
         }
    </List>

    <VariableSizeList 
      height={this.state.windowHeight} 
      width={225} 
      items={this.props.documentList} 
      color="primary"
      itemSize={getItemSize}
      itemCount={this.props.documentList.length}
      >    
          {({ index, style }) => ((
           <Tooltip title={`${this.props.documentList[index].name.replace(/\.txt$/gi, '')} ${this.props.documentList[index].labeled?" has been labeled.":" has NOT been labeled."}`}>   
            <ListItem button  
            onClick={()=>this.handleDocumentClick(this.props.documentList[index].name)} 
            key={this.props.documentList[index].name} 
            selected={this.props.documentList[index].name.localeCompare(this.props.selectedDocument)==0? true:false} 
            primary={this.props.documentList[index].name} 
            style={style}
            >

              {this.props.documentList[index].labeled?
                <CheckCircleTwoToneIcon style={{ color: 'green'}}/>:
                <ErrorTwoToneIcon  style={{ color: 'red'}}/> }
                <ListItemText primary={this.props.documentList[index].name.replace(/\.txt$/gi, '')} />
            </ListItem>
          </Tooltip>
        ))}
      </VariableSizeList>
    </div>
    );
  }
  render() {


    return (
      <React.Fragment>
        <Tooltip title="Document Selection">          
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