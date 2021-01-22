import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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


function WordLabelPredictionHeader(props) {
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
    var menuItems = config.getMenuItems()
    return (
      <React.Fragment>
        Word Labels
      { props.canLoadDocument && props.selectedDocument && menuItems.map((menuItem) =>   
        <React.Fragment>       
            {menuItem.wordLabels && 
              <fieldset>
                <legend style={{backgroundColor: menuItem.color}}>&nbsp;{menuItem.text}</legend>
                {menuItem.wordLabels.map((wordLabelMenuItem) =>
                  <span>&nbsp;<span style={{backgroundColor: wordLabelMenuItem.color}}>&nbsp;{wordLabelMenuItem.text}&nbsp;</span>&nbsp;</span>
                )}
              </fieldset>
            }
          </React.Fragment>
          )
        }
      
        {/*props.autoMLPrediction &&
            <fieldset>
              <legend>Predictions</legend>
              {config.getMenuItems().map((menuItem) =>               
                      <span>&nbsp;<span style={{outline: `${menuItem.color} double`}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
                  )}&nbsp;
            </fieldset>
          */}   
       </React.Fragment>
    )
}

export default WordLabelPredictionHeader;
