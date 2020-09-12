import React from 'react';
import { GoogleLogout } from 'react-google-login';
import GlobalConfig from './lib/GlobalConfig.js'


function Logout(props) {
  var gc = new GlobalConfig();
  const clientId = gc.clientId;

  return (
    <div>
      <GoogleLogout
        clientId={clientId}
        buttonText="Logout"
        onLogoutSuccess={props.onLogoutSuccess}
      ></GoogleLogout>
    </div>
  );
}

export default Logout;
