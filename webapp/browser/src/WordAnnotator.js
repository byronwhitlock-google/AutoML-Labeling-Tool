
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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

class WordAnnotator extends Component {
  constructor(props) {
    super(props);
    this.wordRef = React.createRef();
    this.handleMouseOver = this.handleMouseOver.bind(this)
    this.handleRightClick = this.handleRightClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }
    
  state = {
    mouseX: null,
    mouseY: null,
  };
  // we pass the parent node because e is the inner spans
  handleRightClick(event, parentNode){   
    
    if (this.props.attachMouseEvents) {   
      event.preventDefault();      
      this.setState({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
      });
      return this.props.handleRightClick(event,parentNode);
    }
  }

  handleMenuClick(e, menuItem, sentenceId,wordId){
    this.handleClose()
    // make the call async because yeah.
    setTimeout(()=>{this.props.onWordLabelUpdate(sentenceId,wordId,menuItem)},0)    
  }
  // we pass the parent node because e is the inner spans
  handleMouseOver(event, parentNode) {
    
    if (this.props.attachMouseEvents) {
      this.props.handleMouseOver(event, parentNode)
    }
  }

  handleClose(){
    //this.props.handleClose()
    this.setState( {
      mouseX: null,
      mouseY: null,
    })
  }
  
  render()
  {
    var hash = require('object-hash');
    var attachMenu = this.props.attachMouseEvents && this.props.wordLabelMode
    var menuItems = null
    if (attachMenu) {
       menuItems = this.props.calculateWordLabelMenuItems([this.props.coloredWord])
    }

    return (
    <React.Fragment>    
      <span 
      ref={ this.wordRef }
      style={{
        outline: this.props.coloredWord.outline,
        backgroundColor: this.props.coloredWord.color, 
        display: 'inline'
      }}
      onMouseOver={(e)=>{this.handleMouseOver(e, this.wordRef)}}
      onContextMenu={(e)=>{this.handleRightClick(e, this.wordRef)}}
      >
        {this.props.coloredWord.text}                 
      </span>&nbsp;
      {attachMenu &&
        <Menu
          key={"WI"+hash(menuItems)}
          keepMounted
          open={this.state.mouseY !== null}
          onClose={this.handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            this.state.mouseY !== null && this.state.mouseX !== null
              ? { top: this.state.mouseY, left: this.state.mouseX }
              : undefined
          }
        >
            {menuItems.map((menuItem) => 
              <MenuItem 
              key={"WI"+hash(menuItem,menuItem.text)} 
              onClick={(e)=>this.handleMenuClick(e,menuItem,this.props.sentenceId,this.props.wordId)}>             
                <span style={{backgroundColor: menuItem.color}}>              
                &nbsp;{menuItem.text}&nbsp;
                </span>{menuItem.score? <React.Fragment>({menuItem.score}%)</React.Fragment> : <React.Fragment/>}
              </MenuItem>                
            )}            
            <MenuItem key="none" onClick={(e)=>this.handleMenuClick(e,{text:'None'},this.props.sentenceId,this.props.wordId)}>             
              None (dos)
            </MenuItem>
        </Menu>
      }
    </React.Fragment>
    )
  }
}

export default WordAnnotator;