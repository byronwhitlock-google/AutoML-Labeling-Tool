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
import './App.css';
import AppHeader from './AppHeader.js';
import Document from './Document.js';
import UserInput from './UserInput.js';
import Login from './Login.js';
import Logout from './Logout.js';
import GlobalConfig from './lib/GlobalConfig.js'

// refresh token
import { refreshTokenSetup } from './lib/refreshToken';

class App extends Component {
  state = {
    data: null,
    sentenceData: [],
    selectedDocument: 'test.txt',
    isLoggedIn: false,
    userProfile: null,
    accessToken: null
  };
  
  constructor(props) {
    super(props);
    // This binding is necessary to make `this` work in the callback
    this.handleDocumentUpdate = this.handleDocumentUpdate.bind(this);
    this.handleInputChanged = this.handleInputChanged.bind(this);    
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this)
    // load this from a cookie instead.
    this.config = new GlobalConfig();
  }

  // this is evil but i don't fully understand react cest la vie
  forceUpdateHandler(){    
    this.forceUpdate();
  };

  // returns current document src when null
  handleDocumentUpdate(newSrc) {
    this.setState({selectedDocument: newSrc}); 
    this.forceUpdateHandler();
  }
  handleInputChanged(evt) {
  //  return; // i think this is bubbling extra events
    this.handleDocumentUpdate(evt.target.value);
  }
  
  componentDidMount() {
      // Call our fetch function below once the component mounts   
  }

  handleLogoutSuccess (res) {
    
    //var result = window.confirm('Logout Success')
    //if (result)        
    setTimeout(()=>this.setState({...this.state,isLoggedIn:false,accessToken:null,userProfile:null}),0)
    setTimeout(()=>window.location.reload(true),1);
  }

  handleLoginSuccess (res) {
    
    this.setState({...this.state,isLoggedIn:true,accessToken:res.accessToken, userProfile:res.profileObj})

    console.log('Login Success: currentUser:', res.profileObj);
    console.log(res)
    /*alert(
      `Logged in successfully welcome ${res.profileObj.name} 😍. \n See console for full profile object.`
    );*/
    refreshTokenSetup(res,(newToken)=>{console.log("TOken REFERESHSED"+newToken);this.setState({accessToken:newToken});})
  };

  handleLoginFailure (res) {
    console.log('Login failed: res:', res);
    alert(
      `Failed to login.`
    );
  };

  renderDocument () {
      if (this.state.isLoggedIn)
        return (<Document src={this.state.selectedDocument} key={this.state.selectedDocument} accessToken={this.state.accessToken}/> )
  }
  render() {

    return (
    <div className="App">
      <AppHeader 
        isLoggedIn = {this.state.isLoggedIn}
        onLoginSuccess = {this.handleLoginSuccess}
        onLoginFailure = {this.handleLoginFailure}
        onLogoutSuccess =  {this.handleLogoutSuccess}
        selectedDocument={this.state.selectedDocument}  
        handleDocumentUpdate={this.handleDocumentUpdate} 
        config = {this.config}
        userProfile = {this.state.userProfile}
      />
        <blockquote>
          <h2>{this.state.isLoggedIn?this.state.selectedDocument:'...'}</h2>
        </blockquote>
        <hr/>
        <blockquote>
          {this.renderDocument()}
        </blockquote>    
    </div>
    );
  }
}

export default App;
