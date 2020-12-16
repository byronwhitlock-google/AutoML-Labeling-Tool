import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import IconGCP from './IconGCP.js'
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


function AutoMLPrediction(props) {
    const handleClick = (evt)=>{};
    console.log("Got Props in AutoMLPrediction")
    console.log(props)

    function onSelectChange(event) {
      props.handleModelUpdate(event.target.value)
    }

    function getSelectedModel()
    {
      if (props.selectedModel) { return props.selectedModel }
      var config = new GlobalConfig(props.globalConfigData)
      var defaultModel = config.getDefaultModelName()
      if (defaultModel) {
        for (var i=0;i<props.autoMLModelList.length;i++)
        {
          var model = props.autoMLModelList[i]
          if (defaultModel == model.displayName ) // model.displayname is what we show in the dropdown. 
            return model.name // this is actually the ID 
        }
      }
      return ""
    }
    

    // select for data set list
    // props.autoMLModelList
    // props.selectedAutoMLDataset
    const classes = useStyles();
    return (
     <FormControl className={classes.formControl}>
        <InputLabel id="automl-model-label">Natural Language Model</InputLabel>
        <Select
          labelId="automl-model-label"
          id="automl-model"
          selected={props.selectedModel}
        //  defaultValue={getSelectedModel()}
          onChange={onSelectChange}
          autowidth
        >
        <MenuItem selected={true} value="">None</MenuItem>
        {//<MenuItem selected={getSelectedModel() ?  false: true} value="">None</MenuItem>
        }
        {props.autoMLModelList.map((model) => 
          <MenuItem id={ model.name} key={model.name} value={model.name}  onClick={(e)=>handleClick(e,model.name)}>             
            {model.displayName}
          </MenuItem>                
        )}
        </Select>
        <FormHelperText>AutoML model used for predictions</FormHelperText>
      </FormControl> 
    )
}

export default AutoMLPrediction;
