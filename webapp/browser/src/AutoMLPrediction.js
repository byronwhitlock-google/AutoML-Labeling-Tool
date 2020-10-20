import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import GlobalConfig from './lib/GlobalConfig.js'
import Button from '@material-ui/core/Button';
import IconGCP from './IconGCP.js'

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
    const config = new GlobalConfig();
    const handleClick = (evt)=>{};
    console.log("Got Props in AutoMLPrediction")
    console.log(props)

    function onSelectChange(event) {
      props.handleModelUpdate(event.target.value)
    }

    // select for data set list
    // props.autoMLModelList
    // props.selectedAutoMLDataset
    const classes = useStyles();
    return (
     <FormControl className={classes.formControl}>
        <InputLabel id="automl-dataset-label">Natural Language Model</InputLabel>
        <Select
          labelId="automl-dataset-label"
          id="automl-dataset"
          selected={props.selectedModel}
          onChange={onSelectChange}
          autowidth
        >
        <MenuItem selected={true} value="">None</MenuItem>
        {props.autoMLModelList.map((dataset) => 
          <MenuItem id={ dataset.name} key={dataset.name} value={dataset.name}  onClick={(e)=>handleClick(e,dataset.name)}>             
            {dataset.displayName}
          </MenuItem>                
        )}
        </Select>
        <FormHelperText>AutoML dataset used for predictions</FormHelperText>
      </FormControl> 
    )
}

export default AutoMLPrediction;
