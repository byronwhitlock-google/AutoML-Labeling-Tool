import React from 'react';

const CloudStorageIcon = () => {
    var gif = process.env.PUBLIC_URL +'/AutoML-512-color.png'
    //<img height="32" src={gif}/>
    
  return (    
    <svg fill="currentColor" fill-rule="evenodd" height="24" viewBox="0 0 24 24" width="24" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
      <path d="M4 4h1v7H4zm0 9h1v7H4zm15-9h1v7h-1zm0 9h1v7h-1z" opacity=".6"></path>
      <path d="M5 11h14V4H5v7zm8-3H7V7h6v1zm3 .5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 20h14v-7H5v7zm8-3H7v-1h6v1zm3 .5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path></svg>
    )
  }

export default CloudStorageIcon;