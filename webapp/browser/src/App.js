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
import GenerateCsvApi from './api/GenerateCsvApi.js'
import DocumentListApi from './api/DocumentListApi.js'
import PredictionApi from './api/PredictionApi.js'

// refresh token
import { refreshTokenSetup } from './lib/refreshToken';

class App extends Component {
  state = {
    data: null,
    sentenceData: [],
    selectedDocument: 'test.txt',
    selectedModel: null,
    isLoggedIn: false,
    userProfile: null,
    accessToken: null,
    documentList: [],
    autoMLModelList: [],
    autoMLPrediction: false,
    error : {
      title:null,
      content:null,
      isOpen:false
    },
    alert : {
      title:null,
      content:null,
      isOpen:false
    }      
  };
  
  // TODO: Refactor all API calls to another library 
  // TODO: Switch to using context for access token instead of state 
  constructor(props) {
    super(props);
    // This binding is necessary to make `this` work in the callback
    this.handleDocumentUpdate = this.handleDocumentUpdate.bind(this);
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
    this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this)
    this.handleErrorClose = this.handleErrorClose.bind(this)
    this.handleModelUpdate = this.handleModelUpdate.bind(this)    
    
    //this.loadCsv = this.loadCsv.bind(this)
    this.generateCsv = this.generateCsv.bind(this)
    this.setError = this.setError.bind(this)
    this.setAlert = this.setAlert.bind(this)
    this.refreshAutoMLModelList = this.refreshAutoMLModelList.bind(this)
    // set selected document from the url string
    this.state.selectedDocument = window.location.pathname.replace(/^\/+/g, '');
    this.config = new GlobalConfig();
  }

  // this is evil but i don't fully understand react cest la vie
  forceUpdateHandler(){    
    this.forceUpdate();
  };

  // returns current document src when null
  async handleDocumentUpdate(newSrc) {
    this.setState({selectedDocument: newSrc}); 
    this.forceUpdateHandler();
  }

  // we got a new prediction model 
  async handleModelUpdate(newModel) {
    if (newModel){
     var predictions = await this.requestAutoMLPrediction(newModel)    
     
     this.setState({autoMLPrediction: predictions })
    } else {
      this.setState({autoMLPrediction: false })
    }
  }

  componentDidMount() {
      // Call our fetch function below once the component mounts   
  }

  setError(text,title="Error")
  {
      var error = this.state.error;
      error.title = title;
      error.content = text;
      error.isOpen = true      ;
      this.setState({...this.state,error});
  }

  setAlert(text,title="Alert")
  {
      var alert = this.state.alert;
      alert.title = title;
      alert.content = text;
      alert.isOpen = true      ;
      this.setState({...this.state,alert});
  }
  
  // also closes alert box
  handleErrorClose() {
    let error = this.state.error
    error.isOpen = false

    let alert = this.state.alert
    alert.isOpen = false

    this.setState({...this.state,alert,error})
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
    this.refreshAutoMLModelList()

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
  canLoadAutoMLModelList()
  {
    // TODO: fix dataset loading buggy now.
    //return false;//  
    return this.canLoadDocument();
  }

  async refreshAutoMLModelList() {
    console.log("refreshAutoMLModelList??!?!?")
    if(!this.canLoadAutoMLModelList())
    {
      console.error("canLoadAutoMLModelList failed.")
      return;
    }
    try {
      var pApi = new PredictionApi(this.state.accessToken);
      var models = await pApi.loadAutoMLModelList()

      //console.log(`we got ${documents} from loadDocumentList`)
      this.setState({...this.state, autoMLModelList: models })
    } catch (err){
      if (err.message == "Not Found")
        this.setError("Bucket '"+this.config.bucketName+"' "+err.message,"Bucket Not Found")
      else
        this.setError(err.message,"Could not Refresh Models List")
    }    
  }

  async requestAutoMLPrediction(modelId) {
    console.log("requestAutoMLPrediction??!?!?")
    try {
      var pApi = new PredictionApi(this.state.accessToken);
      return await pApi.requestAutoMLPrediction(modelId, this.state.selectedDocument)      
    } catch (err){
      this.setError(err.message,"Could Request AutoML Prediction")
    }    
  }


  // ====== Generate CSV =====
  async generateCsv() {

    var csvApi = new GenerateCsvApi(this.state.accessToken)
    if(!this.canLoadDocumentList())
    {
      console.log("Not logged in, missing bucket, or no selected document. Not calling generateCsv .")
      return;
    }
    try {
      return csvApi.generateCsv()
    } catch(err) {
        this.setError(err.message,"Could not Generate CSV")
    }
  }
 
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
    

    try {
      var dlApi = new DocumentListApi(this.state.accessToken);
      var documents = await dlApi.loadDocumentList()

      //console.log(`we got ${documents} from loadDocumentList`)
      this.setState({...this.state, documentList: documents })
       
    } catch (err){
      if (err.message == "Not Found")
        this.setError("Bucket '"+this.config.bucketName+"' "+err.message,"Bucket Not Found")
      else
        this.setError(err.message,"Could not List Documents")
    }    
  }
  
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
      return (
        <Document 
          src={this.state.selectedDocument} 
          key={this.state.selectedDocument} 
          accessToken={this.state.accessToken}
          setError = {this.setError}
          setAlert = {this.setAlert}
          autoMLPrediction = {this.state.autoMLPrediction}
          /> )
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
      <ModalPopup           
          title={this.state.alert.title} 
          content={this.state.alert.content} 
          open={this.state.alert.isOpen} 
          severity="info"
          onClose={this.handleErrorClose} />        
      <AppHeader 
      // TODO: use context this is getting messy
        isLoggedIn = {this.state.isLoggedIn}
        onLoginSuccess = {this.handleLoginSuccess}
        onLoginFailure = {this.handleLoginFailure}
        onLogoutSuccess =  {this.handleLogoutSuccess}
        selectedDocument={this.state.selectedDocument}  
        handleDocumentUpdate={this.handleDocumentUpdate}         
        setError = {this.setError}
        setAlert = {this.setAlert}
        //loadCsv = {this.loadCsv}
        generateCsv = {this.generateCsv}
        userProfile = {this.state.userProfile}
        documentList = {this.state.documentList}
      />
      <DocumentHeader  
        selectedDocument={this.state.selectedDocument}  
        canLoadDocument={this.canLoadDocument()}
        autoMLModelList={this.state.autoMLModelList}
        handleModelUpdate={this.handleModelUpdate} 
        autoMLPrediction = {this.state.autoMLPrediction}
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
