import React, { Component } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Text from 'react'
import AddBoxIcon from '@material-ui/icons/AddBox';

class RenderSentence extends Component {
  constructor(props) {
      super(props);

      this.handleMouseOver = this.handleMouseOver.bind(this)
      this.handleRightClick = this.handleRightClick.bind(this)
      this.handleClose = this.handleClose.bind(this)
      this.handleMenuClick = this.handleMenuClick.bind(this)
      this.highlightSelection = this.highlightSelection.bind(this)
  }
  state = {
    mouseX: null,
    mouseY: null,
  };
  static defaultProps = { 
    menuItems: Array(),
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


  handleMouseOver(event) {
    event.preventDefault();
    this.selectText(event.target)
  }

  handleMenuClick(e, menuItem){
    e.preventDefault();
    this.highlightSelection(menuItem.color)
    
    //selectText(sentenceRef.current)
    //if (event.button == 1){  selectText(event.target); return false; }
    this.handleClose()
  }
  
  handleRightClick(event){
    event.preventDefault();
    //selectText(sentenceRef.current)
    //if (event.button == 1){  selectText(event.target); return false; }

    this.selectText(event.target)
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
    return (      
      
      <span onContextMenu={this.handleRightClick} style={{ cursor: 'context-menu' }}>
      
      {this.props.type == "WhiteSpace" && this.props.text != " " ? <p/> : false }

      <span onMouseOver={this.handleMouseOver}>
        {this.props.text}
      </span>
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
            <MenuItem key={menuItem.key} onClick={(e)=>this.handleMenuClick(e,menuItem)}>             
              <span style={{backgroundColor: menuItem.color}}>              
               &nbsp;{menuItem.text}&nbsp;
              </span>({menuItem.confidence}%)
            </MenuItem>
              
          )}
          <MenuItem onClick={this.handleClose}>None</MenuItem>
      </Menu>
    </span>
  );
}
}


export default RenderSentence;