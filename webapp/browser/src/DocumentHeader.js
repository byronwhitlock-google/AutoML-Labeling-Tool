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
import GlobalConfig from './lib/GlobalConfig.js'
import AutoMLPrediction from './AutoMLPrediction.js'
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import EditTwoToneIcon from '@material-ui/icons/EditTwoTone';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { makeStyles } from '@material-ui/core/styles';
import DocumentSettingsDialog from './DocumentSettingsDialog.js'
import SettingsIcon from '@material-ui/icons/Settings';
import CloseIcon from '@material-ui/icons/Close';

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

function DocumentHeader(props) {
  const config = new GlobalConfig(props.globalConfigData);
  console.log("In DocumentHeader")
  console.log(config)
  console.log(props)
  var selectedDocument = props.selectedDocument.replace(/\.txt$/gi, '');
  const classes = useStyles();
  // closures are why we love js. 
  const [settingsOpen, setSettingsOpen] = useState(0);

  var hash = require('object-hash');
  var globalConfigHash = hash(props.globalConfigData)

  // don't hate on the table layout.
    return (
      <table width='100%'>
        <tr><td>
        { props.canLoadDocument && props.selectedDocument &&
          <blockquote>
          <TextField required label="Current Document" defaultValue={selectedDocument} key={selectedDocument}          
          onBlur = {(evt)=>{
            props.handleDocumentUpdate(evt.target.value+".txt")                       
          }}
          onKeyDown = {(evt)=>{
            if (evt.key === 'Enter') {
              props.handleDocumentUpdate(evt.target.value+".txt")      
            }
          }}

          InputProps={{
            startAdornment: <InputAdornment position="start"><EditTwoToneIcon/></InputAdornment>,
          }}
          />
          </blockquote>
        }
        </td><td>
        { props.canLoadDocument && props.selectedDocument &&
          <AutoMLPrediction key={globalConfigHash} {...props}/>
        }
        </td><td>
          { props.canLoadDocument && props.selectedDocument &&
          <fieldset>
            <legend>Labels</legend>
            {config.getMenuItems().map((menuItem) =>               
                    <span>&nbsp;<span style={{backgroundColor: menuItem.color}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
                )}&nbsp;
          </fieldset>
          }
          {props.autoMLPrediction &&
            <fieldset>
              <legend>Predictions</legend>
              {config.getMenuItems().map((menuItem) =>               
                      <span>&nbsp;<span style={{outline: `${menuItem.color} double`}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
                  )}&nbsp;
            </fieldset>
          }         
        </td><td>    
            <React.Fragment>
              <Tooltip title={`Configure Labels & Default Model`}>
                <Button color="inherit" onClick={()=>{setSettingsOpen(1)}}>
                  <small>
                  Configure<br/> labels
                  </small>
                </Button>
              </Tooltip>
              <DocumentSettingsDialog onClose={()=>{setSettingsOpen(0)}} open={settingsOpen}  {...props}/>          
            </React.Fragment> 
        </td></tr>
      </table>    
    );
}

export default DocumentHeader;

