import React, { Component } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListIcon from '@material-ui/icons/List';
import ListItemText from '@material-ui/core/ListItemText';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import DescriptionTwoToneIcon from '@material-ui/icons/DescriptionTwoTone';

class NavigationDrawer extends Component {
  constructor(props) {
      super(props);
  }

  classes = makeStyles({
              list: {
                width: 250,
              },
              fullList: {
                width: 'auto',
              },
            });
  state = {
      bucket: "gs://byrons-bucket", // TODO: user configuration 
      data: null,
      documentList: Array()      
  };


  componentDidMount() {
      // Call our fetch function below once the component mounts
    this.loadDocumentList()
      .then(res=>this.parseDocumentList(res))
      .catch(err => console.log(err));
  }

  parseDocumentList(res)
  {
    if (res.hasOwnProperty('data'))
    {
      this.setState({...this.state, documentList: res.data })
    }
    else if (res.hasOwnProperty('error'))
      console.error(res.error)
    else
      console.error("Unknown Error : "+JSON.stringify(res));
  }
  
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  loadDocumentList = async () => {
    const response = await fetch('/list_documents');

    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  handleDocumentClick =  (newDocumentSrc) => {
    this.props.handleDocumentUpdate(newDocumentSrc)
  }

  toggleDrawer = (anchor, open) => (event) => {
    
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({ ...this.state, [anchor]: open });
  };

  list() { 
    let anchor = 'left'
    return (    
    <div
      className={clsx(this.classes.list, {
        [this.classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={this.toggleDrawer(anchor, false)}
      onKeyDown={this.toggleDrawer(anchor, false)}
    >
    <List>    
        <ListItem selected key="">
        <ListIcon/>
          <ListItemText primary={this.state.bucket} />
        </ListItem>
        <Divider/>    
        {this.state.documentList.map((text, index) => (
          <ListItem button key={text} selected={text.localeCompare(this.props.selectedDocument)==0? true:false} primary={text} >
          <DescriptionTwoToneIcon/>
            <ListItemText onClick={()=>this.handleDocumentClick(text)} primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
    );
  }
  render() {
    return (
        <React.Fragment >
            <IconButton edge="start" className={this.classes.menuButton} color="inherit" aria-label="menu">
              <MenuIcon  onClick={this.toggleDrawer('left', true)} />
            </IconButton>          
            <SwipeableDrawer
              anchor='left'
              open={this.state['left']}
              onClose={this.toggleDrawer('left', false)}
              onOpen={this.toggleDrawer('left', true)}
            >
              {this.list('left')}
            </SwipeableDrawer>
          </React.Fragment>
    );
  }
}

export default NavigationDrawer;