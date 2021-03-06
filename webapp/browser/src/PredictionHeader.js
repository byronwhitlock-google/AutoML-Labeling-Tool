import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import GlobalConfig from './lib/GlobalConfig.js'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));


function PredictionHeader(props) {
    const handleClick = (evt)=>{};
    console.log("Got Props in AutoMLPrediction")
    console.log(props)

    function onSelectChange(event) {
      props.handleModelUpdate(event.target.value)
    }

    var selectedModel = props.selectedModel 

    if (!selectedModel) {
      var config = new GlobalConfig(props.globalConfigData)
      var defaultModel = config.getDefaultModelName()
      if (defaultModel) {
        for (var i=0;i<props.autoMLModelList.length;i++)
        {
          var model = props.autoMLModelList[i]
          if (defaultModel == model.displayName ) { // model.displayname is what we show in the dropdown. 
            selectedModel = model.name // this is actually the ID 
           props.handleModelUpdate(selectedModel)
            break;//out! https://www.youtube.com/watch?v=IIOJdMdS56k
          }
        }
      }
    }
    

    // select for data set list
    // props.autoMLModelList
    // props.selectedAutoMLDataset
    const classes = useStyles();
    return (
      <table width='100%'>
        <tbody>
        <tr>
          <td>
            { props.canLoadDocument && props.selectedDocument && props.autoMLModelList.length>0 &&                          
                <FormControl className={classes.formControl} key={props.autoMLModelList}>
                    <InputLabel id="automl-model-label">Natural Language Model</InputLabel>
                    <Select
                      labelId="automl-model-label"
                      id="automl-model"
                      defaultValue={selectedModel}
                      onChange={onSelectChange}
                      autowidth="true"
                    >
                    <MenuItem selected={true} value="">None</MenuItem>
                    {//<MenuItem selected={getSelectedModel() ?  false: true} value="">None</MenuItem>
                    }
                    {props.autoMLModelList.map((model) => 
                      <MenuItem 
                        id={ model.name} 
                        key={model.name} 
                        value={model.name}  
                        selected={selectedModel == model.name ?  true: false}
                        onClick={(e)=>handleClick(e,model.name)}>             

                          {model.displayName}
                      </MenuItem>                
                    )}
                    </Select>
                    <FormHelperText>AutoML model used for predictions</FormHelperText>
                  </FormControl> 
            }
      </td>
      <td>
      { props.canLoadDocument && props.selectedDocument && config.getMenuItems().length>0 &&   
        <fieldset>
          <legend>Labels</legend>
          {config.getMenuItems().map((menuItem,key) =>               
                  <span key={key}>&nbsp;<span style={{backgroundColor: menuItem.color}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
              )}&nbsp;
        </fieldset>          
        }
      
        {props.autoMLPrediction &&
            <fieldset>
              <legend>Predictions</legend>
              {config.getMenuItems().map((menuItem,key) =>               
                      <span key={key}>&nbsp;<span style={{outline: `${menuItem.color} double`}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
                  )}&nbsp;
            </fieldset>
          }   
          </td>
        </tr>
        </tbody>
      </table>
    )
}

export default PredictionHeader;
