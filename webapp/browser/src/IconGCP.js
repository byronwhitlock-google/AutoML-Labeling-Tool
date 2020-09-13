import React from 'react';
import { SvgIcon, makeStyles } from '@material-ui/core';
import { ReactComponent as CloudConsoleSvg } from './svg/Cloud Console.svg';

const useStyles = makeStyles((theme) => ({
  IconGcpStyle: {
    fillColor: theme.palette.primary.main
  }
}))

export default function IconGCP() {

  var classes = useStyles();

  return(
    <SvgIcon className={classes.IconGcpStyle}>
      <CloudConsoleSvg/>
    </SvgIcon>
  )
}