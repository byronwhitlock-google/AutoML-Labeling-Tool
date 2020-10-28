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
import SentenceTokenizer from './lib/SentenceTokenizer.js'
import GlobalConfig from './lib/GlobalConfig.js'
import DocumentApi from './api/DocumentApi.js'

class Document extends Component {
  constructor(props) {
      super(props);

      this.onLabelUpdate = this.onLabelUpdate.bind(this)
  }
  state = {
      data: null,
      sentenceData: Array(), // each sentence 
      documentData: {}, // suitable for storing jsonl or sending to automl for training.
      menuItems: Array(),
    };

  async componentDidMount() {
    this.loadDocument()
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
    this.saveDocument(documentData)

    // update state
    this.setState({...this.state, documentData: documentData})
  }
    
  setError(text,title="Error Loading Document")
  {
      this.props.setError(text,title)
  }
  
  async loadDocument()
  {
    try {
      var dApi = new DocumentApi(this.props.accessToken);
      var doc = await dApi.loadDocumentContent(this.props.src)
      this.setState({...this.state,...doc})      
    } catch (err) {
      this.setError(err.message)
    }
  }

  async saveDocument(doc)
  {
      try {
        var dApi = new DocumentApi(this.props.accessToken)
        dApi.saveDocumentContent(this.props.src, doc)
      } catch (err) {
          this.setError(err.message,"Error Saving Document");
      }
  }

  render() {
    var config = new GlobalConfig();
    return (      
      <div  className="Document-body">
        {this.state.sentenceData.map((item, key) =>
          <RenderSentence
            key ={key}
            onLabelUpdate={this.onLabelUpdate}
            annotations={this.state.documentData.annotations}
            sentenceId ={key}
            sentenceOffset={item.range[0]}
            type = {item.type}    
            menuItems={config.getMenuItems(item.raw)}      
            text = {item.raw}
            {...this.props}
            />          
          )}
        </div>
     );
  }
}

export default Document;
