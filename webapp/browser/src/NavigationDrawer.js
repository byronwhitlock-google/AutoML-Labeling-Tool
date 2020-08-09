import React, { Component } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

class NavigationDrawer extends Component {
  classes = makeStyles({
              list: {
                width: 250,
              },
              fullList: {
                width: 'auto',
              },
            });
  state = {
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
    console.log(res.data)
    this.setState({documentList: res.data })
    //this.setState({ data: res.data })
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


  toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({ ...this.state, [anchor]: open });
  };

  list = (anchor) => (
    <div
      className={clsx(this.classes.list, {
        [this.classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={this.toggleDrawer(anchor, false)}
      onKeyDown={this.toggleDrawer(anchor, false)}
    >
      <List>
        {this.state.documentList.map((text, index) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
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