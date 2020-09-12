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
import SentenceAnnotator from './SentenceAnnotator.js'
/*import PropTypes from 'prop-types'

RenderSentence.propTypes = {
  onLabelUpdate= PropTypes.function,
  annotations= PropTypes.string,
  sentenceId = PropTypes.string,
  type =  PropTypes.string,
  menuItems= PropTypes.object,     
  text = PropTypes.string
}*/

class RenderSentence extends Component {
  constructor(props) {
      super(props);

      this.sentenceRef = React.createRef();

      this.handleMouseOver = this.handleMouseOver.bind(this)
      this.handleRightClick = this.handleRightClick.bind(this)
      this.handleClose = this.handleClose.bind(this)
      this.handleMenuClick = this.handleMenuClick.bind(this)
      
  }
  state = {
    mouseX: null,
    mouseY: null,
    label: null
  };
  static defaultProps = { 
    menuItems: [],
    type:"WhiteSpace", 
    text:""
  }

  selectText(node){
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
  }

  highlightSelection(color) {
      var userSelection = window.getSelection().getRangeAt(0);
      this.highlightRange(userSelection,color);

  }

  highlightRange(range,color) {
      var newNode = document.createElement("span");
      newNode.setAttribute(
        "style",
        `background-color: ${color}; display: inline;`
      );
      range.surroundContents(newNode);
  }

  // we pass the parent node because e is the inner spans
  handleMouseOver(event, parentNode) {
    event.preventDefault();
    this.selectText(parentNode.current)
  }

  handleMenuClick(e, menuItem, sentenceId){
    e.preventDefault();
    this.handleClose()
    // make the call async because yeah.
    setTimeout(()=>{this.props.onLabelUpdate(sentenceId,menuItem)},0)
    
  }
    // we pass the parent node because e is the inner spans
  handleRightClick(event, parentNode){
    event.preventDefault();    
    this.selectText(parentNode.current)
    this.setState({...this.state,
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  }

  handleClose(){
    this.setState( {
      mouseX: null,
      mouseY: null,
    })
  }


  render()
  {    



    if(this.props.type === "WhiteSpace" && this.props.text !== " ") 
      return <p/> 
    if(this.props.type === "WhiteSpace" && this.props.text === " ") 
      return " "

    return (      
      
      <span ref={this.sentenceRef} style={{ cursor: 'context-menu' }} 
        ref={this.sentenceRef} 
        onMouseOver={(e)=>{this.handleMouseOver(e, this.sentenceRef)}}
        onContextMenu={(e)=>{this.handleRightClick(e, this.sentenceRef)}}
      >
        <SentenceAnnotator 
          sentenceOffset={this.props.sentenceOffset} 
          annotations={this.props.annotations} 
          menuItems={this.props.MenuItems}>
          {this.props.text}
        </SentenceAnnotator>
        <Menu
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
            {this.props.menuItems.map((menuItem) => 
              <MenuItem key={menuItem.key} onClick={(e)=>this.handleMenuClick(e,menuItem,this.props.sentenceId)}>             
                <span style={{backgroundColor: menuItem.color}}>              
                &nbsp;{menuItem.text}&nbsp;
                </span>({menuItem.confidence}%)
              </MenuItem>
                
            )}
            <MenuItem key="none" onClick={(e)=>this.handleMenuClick(e,{text:'None'},this.props.sentenceId)}>             
              None
            </MenuItem>
        </Menu>
      </span>
  );
}
}


export default RenderSentence;