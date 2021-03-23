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
import PredictionHeader from './PredictionHeader.js'
import WordLabelPredictionHeader from './WordLabelPredictionHeader.js'

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

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';

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
  const [wordLabelMode, setwordLabelMode] = useState(false);
  const toggleWordLabelMode = () => {
      setwordLabelMode((curr) => {      
        props.setWordLabelMode(!curr)
        return !curr
      }
    );
  };

  var hash = require('object-hash');
  var globalConfigHash = hash(props.globalConfigData)

  // don't hate on the table layout.
    return (
      <Grid container>
        <Grid item xs={3}>
        {
          <blockquote>
          <TextField required label="Document Name" defaultValue={selectedDocument} key={selectedDocument}          
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
          {props.canLoadDocument && config.hasWordLabels() &&
          <React.Fragment>
            <br/>
            <Tooltip title="Switch to 'word label mode'. This mode allows labeling of words withing a sentence. Word labels are grouped by the label of the containing sentence. Word labels use the containing sentence as the document text in training CSV download. Click `configure labels` to configure entity labels.">
            <FormControlLabel
              control={<Switch color="primary" checked={wordLabelMode} onChange={toggleWordLabelMode} />}
              label="Word Labeling"/>
            </Tooltip>
          </React.Fragment>
          }
          </blockquote>
        }
        </Grid>
        <Grid item xs={8}>
          {
            //!wordLabelMode && // don't show the standard prediction/label header in word label mode
              <PredictionHeader key={globalConfigHash} {...props}/>
          }
          {
        //   wordLabelMode && // show the word label header here
              <WordLabelPredictionHeader key={globalConfigHash} {...props}/>
              
          }
          </Grid>
          <Grid item xs={1}>

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
          </Grid>
        </Grid>
    );
}

export default DocumentHeader;

