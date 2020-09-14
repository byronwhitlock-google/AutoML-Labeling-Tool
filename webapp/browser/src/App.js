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
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import ModalPopup from './ModalPopup.js'
import SettingsOutlineIcon from '@material-ui/icons/Settings';
import DocumentHeader from './DocumentHeader.js'


// refresh token
import { refreshTokenSetup } from './lib/refreshToken';

class App extends Component {
  state = {
    data: null,
    sentenceData: [],
    selectedDocument: 'test.txt',
    isLoggedIn: false,
    userProfile: null,
    accessToken: null,
    documentList: [],
    autoMLDatasetList: [],
    error : {
        title:null,
        content:null,
        isOpen:false
      }
  };
  
  constructor(props) {
    super(props);
    // This binding is necessary to make `this` work in the callback
    this.handleDocumentUpdate = this.handleDocumentUpdate.bind(this);
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this)
    this.handleErrorClose = this.handleErrorClose.bind(this)
    this.setError = this.setError.bind(this)
    this.refreshAutoMLDatasetList = this.refreshAutoMLDatasetList.bind(this)
    // set selected document from the url string
    this.state.selectedDocument = window.location.pathname.replace(/^\/+/g, '');
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

  componentDidMount() {
      // Call our fetch function below once the component mounts   
  }

  setError(text,title="Error")
  {
      let error = this.state.error
      error.title = title
      error.content = text;
      error.isOpen = true      
      this.setState({...this.state,error})
  }
  
  handleErrorClose() {
    let error = this.state.error
    error.isOpen = false
    this.setState({...this.state,error})
  };


  handleLogoutSuccess (res) {
    
    //var result = window.confirm('Logout Success')
    //if (result)        
    setTimeout(()=>this.setState({...this.state,isLoggedIn:false,accessToken:null,userProfile:null}),0)
    setTimeout(()=>window.location.reload(true),1);
  }

  handleLoginSuccess (res) {
    
    this.setState({...this.state,isLoggedIn:true,accessToken:res.accessToken, userProfile:res.profileObj})
    // async update the document list 
    this.refreshDocumentList()

    console.log('Login Success: currentUser:', res.profileObj);
    console.log(res)
    /*alert(
      `Logged in successfully welcome ${res.profileObj.name} 😍. \n See console for full profile object.`
    );*/
    refreshTokenSetup(res,(newToken)=>{console.log("TOken REFERESHSED"+newToken);this.setState({accessToken:newToken});})
  };

  handleLoginFailure (res) {
    console.error('Login failed.');
    console.log(res)
    this.setState({...this.state,isLoggedIn:false,accessToken:null,userProfile:null})
    this.setError(`Failed to login. `);
  };


  //====== AUTOML =======
  canLoadAutoMLDatasetList()
  {
    return this.canLoadDocument();
  }

  async refreshAutoMLDatasetList() {
    console.log("refreshAutoMLDatasetList??!?!?")
    if(!this.canLoadAutoMLDatasetList())
    {
      console.log("canLoadAutoMLDatasetList failed.")
      return;
    }
      // Call our fetch function below once the component mounts
    this.loadAutoMLDatasetList()
      .then(res=>this.parseAutoMLDatasetList(res))
      .catch(err => {this.setError(err.message,"Could not List Documents")});
  }

  async parseAutoMLDatasetList(res)
  {
    if (res.hasOwnProperty('data'))
    {
      this.setState({...this.state, autoMLDatasetList: res.data.datasets })
    }
    else if (res.hasOwnProperty('error'))
      throw new Error(res.error)
    else
      throw new Error("Unknown Error : "+JSON.stringify(res));
  }
  
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  async  loadAutoMLDatasetList () {
    
    this.config = new GlobalConfig();
    console.log("in loadAutoMLDatasetList()")

    const options = {
      method: "GET",
      headers: { 
        'X-Bearer-Token': this.state.accessToken,
        'X-Project-Id': this.config.projectId,
        'X-Location-Id': this.config.locationId
      }
    }
    console.log(options)
    const response = await fetch('/list_datasets', options);

    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  //====== CLOUD STORAGE =======
  // does the current state of the app mean we can try to load the document?
  canLoadDocument()
  {
    return (this.state.isLoggedIn && this.config.bucketName  && this.state.selectedDocument);
  }

  canLoadDocumentList()
  {
    return (this.state.isLoggedIn && this.config.bucketName);
  }

  async refreshDocumentList() {
    console.log("refreshDocumentList??!?!?")
    if(!this.canLoadDocumentList())
    {
      console.log("Not logged in, missing bucket, or no selected document. Not loading document list.")
      return;
    }
    this.refreshAutoMLDatasetList();

      // Call our fetch function below once the component mounts
    this.loadDocumentList()
      .then(res=>this.parseDocumentList(res))
      .catch(err => { 
        if (err.message == "Not Found")
          this.setError("Bucket '"+this.config.bucketName+"' "+err.message,"Bucket Not Found")
        else
          this.setError(err.message,"Could not List Documents")
        });
  }

  async parseDocumentList(res)
  {
    if (res.hasOwnProperty('data'))
    {
      this.setState({...this.state, documentList: res.data })
    }
    else if (res.hasOwnProperty('error'))
      throw new Error(res.error)
    else
      throw new Error("Unknown Error : "+JSON.stringify(res));
  }
  
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  async  loadDocumentList () {
    
    this.config = new GlobalConfig();
    console.log("in loadDocumentList()")

    const options = {
      method: "GET",
      headers: { 
        'X-Bearer-Token': this.state.accessToken,
        'X-Project-Id': this.config.projectId,
        'X-Bucket-Name': this.config.bucketName
      }
    }
    console.log(options)
    const response = await fetch('/list_documents', options);

    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };
  
  renderDocument () {    

    if (!this.config.bucketName)
      return (          
        <React.Fragment>
          <Typography variant="h6">Bucket name not specified. </Typography>
          <Typography>
             Click your avatar icon in the upper right, then choose a Google Cloud Storage bucket.
          </Typography>
        </React.Fragment>
        )
    if (!this.state.selectedDocument)
      return (          
        <React.Fragment>
          <Typography variant="h6">No document selected. </Typography>
          <Typography>
            Select a document using the <MenuIcon/> icon to begin.
          </Typography>
        </React.Fragment>
        )

    if (this.state.isLoggedIn && this.config.bucketName && this.state.selectedDocument)
      return (<Document src={this.state.selectedDocument} key={this.state.selectedDocument} accessToken={this.state.accessToken}/> )
  }
  render() {
    this.config = new GlobalConfig();
    return (
    <div className="App">
      <ModalPopup           
        title={this.state.error.title} 
        content={this.state.error.content} 
        open={this.state.error.isOpen} 
        onClose={this.handleErrorClose} />
      <AppHeader 
        isLoggedIn = {this.state.isLoggedIn}
        onLoginSuccess = {this.handleLoginSuccess}
        onLoginFailure = {this.handleLoginFailure}
        onLogoutSuccess =  {this.handleLogoutSuccess}
        selectedDocument={this.state.selectedDocument}  
        handleDocumentUpdate={this.handleDocumentUpdate} 
        userProfile = {this.state.userProfile}
        documentList = {this.state.documentList}
      />
      <DocumentHeader  
        selectedDocument={this.state.selectedDocument}  
        canLoadDocument={this.canLoadDocument()}
        autoMLDatasetList={this.state.autoMLDatasetList}
        selectedAutoMLDataset={this.state.selectedAutoMLDataset}
        refreshAutoMLDatasetList ={this.refreshAutoMLDatasetList}
      />
      <hr/>
      <blockquote>
        {this.renderDocument()}
      </blockquote>    
    </div>
    );
  }
}

export default App;
