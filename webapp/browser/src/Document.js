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
import RenderSentence from './RenderSentence.js'
import ModalPopup from './ModalPopup.js'
import {split, Syntax} from "sentence-splitter";
import SentenceTokenizer from './lib/SentenceTokenizer.js'
import GlobalConfig from './lib/GlobalConfig.js'

class Document extends Component {
  constructor(props) {
      super(props);

      this.config = new GlobalConfig();
      this.handleClose = this.handleClose.bind(this)
      this.onLabelUpdate = this.onLabelUpdate.bind(this)
  }
  state = {
      data: null,
      sentenceData: Array(), // each sentence 
      documentData: {}, // suitable for storing jsonl or sending to automl for training.
      menuItems: Array(),
      error : {
        title:null,
        content:null,
        isOpen:false
      }
    };

  async componentDidMount() {
      // Call our fetch function below once the component mounts
    this.loadDocumentContent()
      .then(res=>this.parseDocument(res))
      .catch(err => console.log(err));
    
    //let menuItems = this.state.menuItems;
    //menuItems = await this.loadMenuItems();
    //this.setState({...this.state,menuItems})
  }

  onLabelUpdate(sentenceId,menuItem)
  {
    var tk = new SentenceTokenizer();
    console.log(`sentenceId ${sentenceId} menuItem ${menuItem}`)
    
    // grab current sentence
    var sentence = this.state.sentenceData[sentenceId].raw
    
    // grab the sentence offset so our tokens are document based
    var sentenceOffset =this.state.sentenceData[sentenceId].range[0]

    //grab the global label data structure
    var documentData = this.state.documentData

    //tokenize our sentence into automl annotation format 
    var annotations =[]
    if (menuItem.text == "None")
      documentData.annotations = tk.removeAnnotations(documentData.annotations, sentenceOffset, sentence.length + sentenceOffset)
    else
    {
      annotations = tk.annotate(sentenceOffset, menuItem.text, sentence)

      // TODO: advanced check for duplicates!
      // advanced dupe check would verify ranges to make sure there are no overlaps
      // simple dupe check implmeneted looking at first item 
      // index of annotations after merge is the start index of the label within the document.
      documentData.annotations = tk.mergeAnnotations(documentData.annotations, annotations)
    }
    console.log(documentData.annotations)

    //save the jsonL file asyncronously to cloud storage
    ///??????
    this.saveDocument(documentData)

    // update state
    this.setState({...this.state, documentData: documentData})

  }


    
  setError(text,title="Error Loading Document")
  {
      let error = this.state.error
      error.title = title
      error.content = text;
      error.isOpen = true      
      this.setState({...this.state,error})
  }
  
  handleClose() {
    let state = this.state;
    state.error.isOpen = false;

    this.setState({...this.state,state})
  };

  async saveDocument(doc)
  {
    // simple type checking, 
    // TODO: json schema validation
    if (doc.hasOwnProperty('annotations') && 
        doc.hasOwnProperty('text_snippet') && 
        doc.text_snippet.hasOwnProperty('content'))
    {
      try
      {

        var res = await this.saveDocumentContent(doc)

        if (res.hasOwnProperty('error'))
          this.setError(res.error,"Error Saving Document");

      } catch (e) {
          this.setError(JSON.stringify(e))
      }
    }
     else
     {
       this.setError("Cannot save, Invalid Document")
     }

  }

  parseDocument(res)
  {
    if (res.hasOwnProperty('data') && 
        res.data.hasOwnProperty('text_snippet') && 
        res.data.text_snippet.hasOwnProperty('content'))
    {
      console.log("*****Reparsing data from file****")
      let documentData = res.data
      let sentencesSplit = split(res.data.text_snippet.content)
      console.log(sentencesSplit)

      this.setState({...this.state, 
        documentData: res.data,
        sentenceData: sentencesSplit 
      });
    }
    else if (res.hasOwnProperty('error'))
      this.setError(res.error);
    else
      this.setError("Unknown Error : "+JSON.stringify(res));
  }
  
  getHeaders()
  {
    
  }
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  loadDocumentContent = async () => {

    const response = await fetch(`/load_document?d=${this.props.src}`,{
          method: "GET",
          headers: { 
            'X-Project-Id': this.config.projectId,
            'X-Bearer-Token': this.props.accessToken,
            'X-Bucket-Name': this.config.bucketName
        }});
    console.log(`/load_document?d=${this.props.src}`)
    console.log({headers: { 
            'X-Project-Id': this.config.projectId,
            'X-Bearer-Token': this.props.accessToken,
            'X-Bucket-Name': this.config.bucketName
        }})
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };
  
  async saveDocumentContent(doc) {

    const response = await fetch('/save_document?d='+this.props.src, {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json' ,
            'X-Bearer-Token': this.props.accessToken,
            'X-Project-Id': this.config.projectId,
            'X-Bucket-Name': this.config.bucketName
          },
          body: JSON.stringify(doc)
        });
    console.log('/save_document?d='+this.props.src)
    console.log(doc)
    const body = await response.json();
    console.log(body)
    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  }

  render() {
    return (      
      <div  className="Document-body">
        <ModalPopup           
          title={this.state.error.title} 
          content={this.state.error.content} 
          open={this.state.error.isOpen} 
          onClose={this.handleClose} />

        {this.state.sentenceData.map((item, key) =>
          <RenderSentence
            key ={key}
            onLabelUpdate={this.onLabelUpdate}
            annotations={this.state.documentData.annotations}
            sentenceId ={key}
            sentenceOffset={item.range[0]}
            type = {item.type}    
            menuItems={this.config.getMenuItems(item.raw)}      
            text = {item.raw}/>          
          )}
        </div>
     );
  }
}

export default Document;
