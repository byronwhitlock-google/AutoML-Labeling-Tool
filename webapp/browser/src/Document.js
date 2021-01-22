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
import SentenceTokenizer from './lib/SentenceTokenizer.js'
import DocumentApi from './api/DocumentApi.js'



class Document extends Component {
  constructor(props) {
      super(props);

      this.onLabelUpdate = this.onLabelUpdate.bind(this)
      this.onWordLabelUpdate = this.onWordLabelUpdate.bind(this)
  }
  state = {
      data: null,
      sentenceData: Array(), // each sentence 
      documentData: {}, // suitable for storing jsonl or sending to automl for training. contains setnences only
      wordLabelDocumentData: [] // hash array of automl formatted jsonls. same format a document data but an arrary of them.
    };

  async componentDidMount() {
    this.loadDocument()
  }
  onWordLabelUpdate(sentenceId,wordId,menuItem)
  {
    console.log(`sentenceId: ${sentenceId}, wordId: ${wordId}, menuItem: ${menuItem}`)
    
    var tk = new SentenceTokenizer();

    // grab current sentence and word
    // word id does not take whitespace into account..... umm ok.
    var word = {}
    var arrayOffset =0; // this is confusing and ugly but cest la vie
    var correctedWordId =""

    for(var i =0;arrayOffset<=wordId;i++) {
       if (this.state.sentenceData[sentenceId].wordData[i].type =='Str') {
         arrayOffset++ 
         correctedWordId = i 
       }
    }
    
    console.log(`Corrected word id from ${wordId} to ${correctedWordId}`)
    var word = this.state.sentenceData[sentenceId].wordData[correctedWordId]
    var sentence = this.state.sentenceData[sentenceId]
    // grab the sentence and word offsets so our tokens are document based
    var wordOffset = word.range[0]
    
    var fullOffset = this.state.sentenceData[sentenceId].range[0] + wordOffset
    var wordKey = sentenceId // lookup into wordLabel document since it contains all labeled sentences.
    
    //grab the global label data structure
    var documentData = this.state.documentData
    var wordLabelDocumentData = this.state.wordLabelDocumentData // this shouold 

    //tokenize our sentence into automl annotation format 
    var annotations =[]
    if (menuItem.text == "None")
      wordLabelDocumentData[wordKey].annotations = tk.removeAnnotations(wordLabelDocumentData[wordKey].annotations, wordOffset, word.raw.length + wordOffset)
    else
    {
      annotations = tk.annotate(wordOffset, menuItem.text, word.raw) // one word simple annotaion

      // TODO: advanced check for duplicates!
      // advanced dupe check would verify ranges to make sure there are no overlaps
      // simple dupe check implmeneted looking at first item 
      // index of annotations after merge is the start index of the label within the document.
      wordLabelDocumentData[wordKey].annotations = tk.mergeAnnotations(wordLabelDocumentData[wordKey].annotations, annotations)
    }
    console.log(wordLabelDocumentData[wordKey].annotations)

    //save the jsonL file asyncronously to cloud storage
    this.saveWordLabelDocument(wordLabelDocumentData)

    // update state
    this.setState({...this.state, wordLabelDocumentData: wordLabelDocumentData})
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
      // TODO: coorelate .words and .sentences in load document content
      // then onlabelupdate can find the parent senence and save the jsonl file
      // when i get a word, i can save jsonl with sentence text and sentence id or hash.

      // ???similarly, the word labels will rendered from the same coorelation?????
      var documentState = await dApi.loadDocumentContent(this.props.src)
      /*if (this.props.wordLabelMode) {
        documentState.sentenceData=documentState.words
      } else {
        documentState.sentenceData=documentState.sentences
      }*/
      
      this.setState({...this.state,...documentState})      
    } catch (err) {
      this.setError(err.message)
    }
  }

  async saveDocument(doc)
  {
      try {
        var dApi = new DocumentApi(this.props.accessToken)
        var documentSrc =  this.props.src
        dApi.saveDocumentContent(documentSrc, doc)
      } catch (err) {
          this.setError(err.message,"Error Saving Document");
      }
  }
  async saveWordLabelDocument(wordLabelDoc)
  {
      try {
        var dApi = new DocumentApi(this.props.accessToken)
        var documentSrc =  this.props.src
        documentSrc = this.props.src

        dApi.saveWordLabelDocumentContent(documentSrc, wordLabelDoc)
      } catch (err) {
          this.setError(err.message,"Error Saving wordLabelDoc");
      }
  }
  render() {
    // we need to make a key for the document so it updates when we change some unrelated props.
    var hash = require('object-hash');
    var documentHash = hash(this.props.globalConfigData) +
                       hash(this.state.documentData) +
                       hash(this.state.sentenceData)
    return (      
      <div  className="Document-body" key={documentHash}>
      
        {this.state.sentenceData.map((item, key) =>
          <RenderSentence
            key ={key}
            onLabelUpdate={this.onLabelUpdate}
            onWordLabelUpdate={this.onWordLabelUpdate}
            annotations={this.state.documentData.annotations}
            wordLabelDoc={this.state.wordLabelDocumentData[key]}
            wordData={item.wordData}
            sentenceId ={key}
            sentenceOffset={item.range[0]}
            type = {item.type}    
            text = {item.raw}
            {...this.props}
            />          
          )} 
        </div>
     );
  }
}

export default Document;
