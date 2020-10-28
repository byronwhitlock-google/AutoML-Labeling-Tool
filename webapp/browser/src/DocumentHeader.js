import React from 'react';
import GlobalConfig from './lib/GlobalConfig.js'
import AutoMLPrediction from './AutoMLPrediction.js'

function DocumentHeader(props) {
  const config = new GlobalConfig();
  if (props.canLoadDocument)
    return (
      <table width='100%'>
        <tr><td width='40%'>
          <blockquote>
            <h2>{props.selectedDocument}</h2>
          </blockquote>
        </td><td>
          <AutoMLPrediction {...props}/>
        </td><td>
          <fieldset>
            <legend>Labels</legend>
            {config.menuItems.map((menuItem) =>               
                    <span>&nbsp;<span style={{backgroundColor: menuItem.color}}>&nbsp;{menuItem.text}&nbsp;</span>&nbsp;</span>
                )}&nbsp;
          </fieldset>
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
  else
    return (  <blockquote><h2></h2></blockquote>)
}

export default DocumentHeader;
