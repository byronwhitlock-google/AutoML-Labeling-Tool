import React from 'react';

import { GoogleLogin } from 'react-google-login';


import GlobalConfig from './lib/GlobalConfig.js'

function Login(props) {
  var gc = new GlobalConfig();
  const clientId = gc.clientId;
  
 
  return (
    <div>
      <GoogleLogin
        clientId={clientId}
        buttonText="Login"
        onSuccess={props.onSuccess}
        onFailure={props.onFailure}
        scope="https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/devstorage.read_write https://www.googleapis.com/auth/cloud-language"
        cookiePolicy={'single_host_origin'}
        style={{ marginTop: '100px' }}
        isSignedIn={true}
      />
    </div>
  );
}

export default Login;
