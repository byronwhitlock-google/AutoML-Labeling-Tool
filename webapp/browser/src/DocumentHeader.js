import React from 'react';
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

function DocumentHeader(props) {
  const config = new GlobalConfig();

  var selectedDocument = props.selectedDocument.replace(/\.txt$/gi, '');
  
  // don't hate on the table layout.
    return (
      <table width='100%'>
        <tr><td>
        {props.selectedDocument &&
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
          <AutoMLPrediction {...props}/>
        }
        </td><td>
          { props.canLoadDocument && props.selectedDocument &&
          <fieldset>
            <legend>Labels</legend>
            {config.menuItems.map((menuItem) =>               
                    <span>&nbsp;<span style={{backgroundColor: menuItem.color}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
                )}&nbsp;
          </fieldset>
          }
          {props.autoMLPrediction &&
            <fieldset>
              <legend>Predictions</legend>
              {config.menuItems.map((menuItem) =>               
                      <span>&nbsp;<span style={{outline: `${menuItem.color} double`}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
                  )}&nbsp;
            </fieldset>
          }         
          
        </td></tr>
      </table>    
    );
}

export default DocumentHeader;
