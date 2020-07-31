import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Text from 'react'

const initialState = {
  mouseX: null,
  mouseY: null,
};



export default function RenderSentence(props) {
  const [state, setState] = React.useState(initialState);
  var sentenceRef = React.createRef();

  const selectText = (node) => {
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
  const handleMouseOver = (event) => {
    event.preventDefault();
    selectText(event.target)
  }

  const handleClick = (event) => {
    event.preventDefault();
    //selectText(sentenceRef.current)
    //if (event.button == 1){  selectText(event.target); return false; }

    selectText(event.target)
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleClose = () => {
    setState(initialState);
  };
  if (props.type == "WhiteSpace"){
    if(props.text !=" "){
      return (<p/>)
    }
    return " "
  }    
  return (
    <span onContextMenu={handleClick} style={{ cursor: 'context-menu' }}>
      <span ref={sentenceRef} onMouseOver={handleMouseOver}>
        {props.text}
      </span>
      <Menu
        keepMounted
        open={state.mouseY !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          state.mouseY !== null && state.mouseX !== null
            ? { top: state.mouseY, left: state.mouseX }
            : undefined
        }
      >
        
        <MenuItem onClick={handleClose}>{props.problem_confidence}% Problem</MenuItem>
        <MenuItem onClick={handleClose}>{props.cause_confidence}% Cause</MenuItem>
        <MenuItem onClick={handleClose}>{props.remediation_confidence}% Remediation</MenuItem>
        <MenuItem onClick={handleClose}>None</MenuItem>
      </Menu>
    </span>
  );
}