import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

class UserInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { documentSrc: props.value};
  }
  render () {
    const classes =  makeStyles((theme) => ({
      root: {
        '& > *': {
          margin: theme.spacing(1),
          width: '25ch',
        },
      },
    }));
    return (
      <form className={classes.root} noValidate autoComplete="off">
        <TextField id="standard-basic" label="Document Source" value={this.state.documentSrc}/>
      </form>
    );
  }
}

export default UserInput;