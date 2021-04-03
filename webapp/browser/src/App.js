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
import ConfigApi from './api/ConfigApi.js'
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
    selectedModelHash: null,
    documentList: [],
    autoMLModelList: [],
    autoMLPrediction: false,
    autoMLWordLabelPredictions: false,
    wordLabelMode:false,
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
    globalConfigData: {},
    labelMap: []

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
    this.handleAddMenuItem = this.handleAddMenuItem.bind(this)
    this.handleSaveConfig = this.handleSaveConfig.bind(this)
    this.setWordLabelMode = this.setWordLabelMode.bind(this)
    this.mapLabel = this.mapLabel.bind(this)

    //this.loadCsv = this.loadCsv.bind(this)
    this.generateCsv = this.generateCsv.bind(this)
    this.setError = this.setError.bind(this)
    this.setAlert = this.setAlert.bind(this)
    this.refreshAutoMLModelList = this.refreshAutoMLModelList.bind(this)
    // set selected document from the url string
    this.state.selectedDocument = window.location.pathname.replace(/^\/+/g, '');
    this.config = new GlobalConfig()


  }


  async handleAddMenuItem(menuItem){
    var globalConfigData = this.state.globalConfigData
    if (!globalConfigData.menuItems) return
    for(var i=0;i<globalConfigData.menuItems.length;i++)// actually faster than using a hash or find 
    {
      var currItem = globalConfigData.menuItems[i]
      //if (currItem.key===menuItem.key) {
        // already exists exit 
        //return;
     // }

      // when we get labels they don't have the key
      // we need ot get rid of the "key" 
     if (currItem.text===menuItem.text) {
        // already exists exit 
        return;
      }
    }
    globalConfigData.menuItems.push(menuItem)
    this.setState({globalConfigData:globalConfigData})
  }
  async handleAddWordLabelMenuItem(menuItem){
    var globalConfigData = this.state.globalConfigData
    if (!globalConfigData.menuItems) return
    for(var i=0;i<globalConfigData.menuItems.length;i++)// actually faster than using a hash or find 
    {
      // we in parent
      if (menuItem.parentLabel == globalConfigData.menuItems[i].text) {
        for (var j=0;j<globalConfigData.menuItems[i].wordLabels;j++)
        {
          var currItem = globalConfigData.menuItems[i].wordLabels[j]
          if (currItem.text===menuItem.text) {
            // already exists exit 
            return;
          }
          
        }
        globalConfigData.menuItems[i].wordLabels.push(menuItem)
        this.setState({globalConfigData:globalConfigData})
        return; // once we find the correct parent menu item bail out
      }
    }
  }

  // this is evil but i don't fully understand react cest la vie
  forceUpdateHandler(){    
    // I think i understand react now! key property is needed  for re renders to happend based on updated (props) properties :)
   // this.forceUpdate();
  };


  async refreshConfig() {
    console.log("refreshConfig??!?!?")
    try {
      var configApi = new ConfigApi(this.state.accessToken)    
      if (!configApi.bucketName) return; // no bucket can't refresh
      var data =  await configApi.loadConfig()
      console.log("got data")
      console.log(data)
      this.setState({globalConfigData: data}); 
    } catch (err){
      this.setError(err.stack,"Could Not Refresh Config ")
    }    
  }

  async handleSaveConfig(config) {
    //window.alert("We in save config"+JSON.stringify(config))
    console.log("saving Config")
    if (JSON.stringify(config) !== JSON.stringify({})) { // just return if we don't have anything to save.
      try {
        var configApi = new ConfigApi(this.state.accessToken)    
        var data = await configApi.saveConfig(config)
        console.log("got data")
        console.log(data)
        this.setState({globalConfigData: data}); 
      } catch (err){
        this.setError(err.stack,"Could Not Save Config ")
        return false
      }    
    } 
    return true
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
    if (this.state.wordLabelMode)
      return;

    if (newModel && this.state.selectedDocument){
      var selectedModelHash = newModel + this.state.selectedDocument

      if (selectedModelHash != this.state.selectedModelHash) { // this prevents infinite loops requesting stuff forever. very important
        var predictions = null
        predictions = await this.requestAutoMLPrediction(newModel)                 
        this.setState({autoMLPrediction: predictions, selectedModelHash: selectedModelHash})
      }
    } else {
      this.setState({autoMLPrediction: false })
    }
  }
  async refreshWordLabelPredictions() {
    if (this.state.wordLabelMode) {
      var wordLabelPredictions = await this.requestWordLabelModePrediction()
      this.setState({autoMLWordLabelPredictions: wordLabelPredictions})
    }
  }
  async componentDidMount() {
      // Call our fetch function below once the component mounts   
      await this.refreshConfig()
      this.refreshDocumentList()
      this.refreshAutoMLModelList()
      this.refreshWordLabelPredictions()
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

  async requestWordLabelModePrediction() {
    console.log("requestWordLabelModePrediction??!?!? we aint doint nuthin.")
    var wordLabelPredictions = []
    // gotta iterate a new data structure that shows what is labeled from first pass.
    for(var sentenceId in this.state.labelMap) {
      var modelName =  this.state.labelMap[sentenceId].modelName
      var label =  this.state.labelMap[sentenceId].label
      var words =  this.state.labelMap[sentenceId].words
      try {

        // need a get model id cached call to automl api, we don't actuallly know if we should do alookup on this sentence becasue that hapenes in the annotated coloers lookup.
        var pApi = new PredictionApi(this.state.accessToken);
        wordLabelPredictions[sentenceId]=  await pApi.requestWordLabelModePredictions(words, modelName)  
        
      } catch (err){
        this.setError(err.message,"Could Request AutoML WordLabelModePrediction")
      }    
    }
    this.setState({autoMLWordLabelPredictions:wordLabelPredictions})
  }
/**
 * 
 * @param {int} sentenceId 
 * @param {string} modelName 
 * @param {string} label 
 * @param {[]} words
 */
async mapLabel(sentenceId, modelName, label,words) {
  var labelMap = this.state.labelMap

  if ( !labelMap[sentenceId] ) {
    labelMap[sentenceId] = {sentenceId:sentenceId, modelName:modelName, label:label,words:words}
    this.setState({...this.state, labelMap:labelMap} )
  }
}


async setWordLabelMode (mode){
  this.setState({wordLabelMode:mode})
  if (mode) {
    this.requestWordLabelModePrediction() /// this is required because we have to go through this 2x. don't remove this line. the function produces needed side effects
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
  
  
  render() {
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
        globalConfigData = {this.state.globalConfigData}
      />
      <DocumentHeader  
        selectedDocument={this.state.selectedDocument}  
        selectedModel={this.state.selectedModel}  
        canLoadDocument={this.canLoadDocument()}
        
        autoMLModelList={this.state.autoMLModelList}
        handleModelUpdate={this.handleModelUpdate} 
        handleDocumentUpdate={this.handleDocumentUpdate}
        autoMLPrediction = {this.state.autoMLPrediction}
        autoMLWordLabelPredictions = {this.state.autoMLWordLabelPredictions}
        documentList = {this.state.documentList}
        globalConfigData = {this.state.globalConfigData}
        handleSaveConfig = {this.handleSaveConfig}
        setWordLabelMode={this.setWordLabelMode}
        wordLabelMode={this.state.wordLabelMode}
      />
      <hr/>
      <blockquote>
        {this.renderDocument()}
      </blockquote>    
    </div>
    );
  }
  renderDocument () {   
    var hash = require('object-hash');

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
      var documentHash = hash(this.state.selectedDocument+this.state.wordLabelMode)
      return (
        <Document 
          src={this.state.selectedDocument} 
          key={documentHash} 
          accessToken={this.state.accessToken}
          setError = {this.setError}
          setAlert = {this.setAlert}
          autoMLPrediction = {this.state.autoMLPrediction}
          autoMLWordLabelPredictions = {this.state.autoMLWordLabelPredictions}
          globalConfigData = {this.state.globalConfigData}
          handleAddMenuItem={this.handleAddMenuItem}
          wordLabelMode={this.state.wordLabelMode}
          mapLabel = {this.mapLabel}
          
          /> )
  }
}

export default withRouter(App);
