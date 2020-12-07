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
import FadeIn from 'react-fade-in';

import SettingsIcon from '@material-ui/icons/Settings'
import { BrowserRouter, withRouter } from 'react-router-dom';

// refresh token
import { refreshTokenSetup } from './lib/refreshToken';

class App extends Component {
  state = {
    data: null,
    sentenceData: [],
    selectedDocument: 'test.txt',
    selectedModel: null,
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
    },
    bucketSettings: {
      isOpen:false
    }   
  };
  
  // TODO: Refactor all API calls to another library 
  // TODO: Switch to using context for access token instead of state 
  constructor(props, context) {
    super(props,context);
    // This binding is necessary to make `this` work in the callback
    this.refreshDocumentList = this.refreshDocumentList.bind(this);
    this.handleDocumentUpdate = this.handleDocumentUpdate.bind(this);
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this)
    this.handleModelUpdate = this.handleModelUpdate.bind(this)    
    this.handleNextRandom = this.handleNextRandom.bind(this)
    this.handleShowBucketSettings = this.handleShowBucketSettings.bind(this)

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
    // I think i understand react now! key property is needed  for re renders to happend based on updated (props) properties :)
   // this.forceUpdate();
  };

  async handleShowBucketSettings() {
    this.setState({bucketSettings: {isOpen:true}}); 
  }

  // returns current document src when null
  async handleNextRandom() {

    var labeledDocs = []
    // grab a labeled document at random from the document list
    for(let i=0;i<this.state.documentList.length;i++)    {
      let doc = this.state.documentList[i]      
      if (!doc.labeled) {
        labeledDocs.push(doc)
      }
    }

    var newSrc = labeledDocs[Math.floor(Math.random() * labeledDocs.length)].name;
    if (newSrc) {
      this.handleDocumentUpdate(newSrc)
    } else {
      this.setError("Document update failed. Please try again")
    }
  }


  // returns current document src when null
  async handleDocumentUpdate(newSrc) {
    this.setState({selectedDocument: newSrc}); 
    this.props.history.push(newSrc);
    //this.forceUpdateHandler();
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
      this.refreshDocumentList()
      this.refreshAutoMLModelList()
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
      this.setState({autoMLModelList: models })
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
      console.log("Missing bucket, or no selected document. Not calling generateCsv .")
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
    return (this.config.bucketName  && this.state.selectedDocument);
  }

  canLoadDocumentList()
  {
    return (this.config.bucketName);
  }

  async refreshDocumentList() {
    console.log("refreshDocumentList??!?!?")
    if(!this.canLoadDocumentList())
    {
      console.log("Missing bucket, or no selected document. Not loading document list.")
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
        <FadeIn transitionDuration="100"> 
          <React.Fragment>
          <Typography variant="h6">Bucket name not specified. </Typography>
          <Typography>
             Click the <SettingsIcon/> icon in the upper right, then choose a Google Cloud Storage bucket.
          </Typography>
            </React.Fragment>
        </FadeIn>
        )
    if (!this.state.selectedDocument)
      return (          
         <FadeIn  transitionDuration="100"> 
           <React.Fragment>
          <Typography variant="h6">No document selected. </Typography>
          <Typography>
            Select a document using the <MenuIcon/> icon.
          </Typography>
          </React.Fragment>
        </FadeIn>
        )

    if (this.canLoadDocument())
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
        selectedDocument={this.state.selectedDocument}   
        setError = {this.setError}
        setAlert = {this.setAlert}
        //loadCsv = {this.loadCsv}
        generateCsv = {this.generateCsv}
        userProfile = {this.state.userProfile}
        documentList = {this.state.documentList}
        refreshDocumentList={this.refreshDocumentList}
        handleDocumentUpdate={this.handleDocumentUpdate}
        handleNextRandom={this.handleNextRandom}
        handleShowBucketSettings={this.handleShowBucketSettings}
      />
      <DocumentHeader  
        selectedDocument={this.state.selectedDocument}  
        canLoadDocument={this.canLoadDocument()}
        
        autoMLModelList={this.state.autoMLModelList}
        handleModelUpdate={this.handleModelUpdate} 
        handleDocumentUpdate={this.handleDocumentUpdate}
        autoMLPrediction = {this.state.autoMLPrediction}
        documentList = {this.state.documentList}
      />
      <hr/>
      <blockquote>
        {this.renderDocument()}
      </blockquote>    
    </div>
    );
  }
}

export default withRouter(App);
