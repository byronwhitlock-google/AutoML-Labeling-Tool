import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactDOM from 'react-dom';
import AppHeader from './AppHeader.js';
import RenderSentence from './RenderSentence.js'
import ModalPopup from './ModalPopup.js'
import {split, Syntax} from "sentence-splitter";


class Document extends Component {
  constructor(props) {
      super(props);

      this.handleClose = this.handleClose.bind(this)
  }
  state = {
      data: null,
      sentenceData: Array(),
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

  getMenuItems(text) {
    // TODO: Add automl API call for prediction here.
    return [
      {
        key: 1,
        text:"Problem",
        confidence: 0, //Math.floor(Math.random()*1000)/10
        color: "#F2D7D5"
        },
      {
        key: 2,
        text:"Cause",
        confidence: 0,//Math.floor(Math.random()*1000)/10
        color: "#EBDEF0"
      },
      {
        key: 3,
        text:"Remediation",
        confidence: 0,//Math.floor(Math.random()*1000)/10
        color: "#D4E6F1"
      }
    ]    
  }
  
  setError(text)
  {
      let error = this.state.error
      error.title = "Error Loading Document"
      error.content = text;
      error.isOpen = true      
      this.setState({...this.state,error})
  }
  
  handleClose() {
    let state = this.state;
    state.error.isOpen = false;

    this.setState({...this.state,state})
  };

  parseDocument(res)
  {
    if (res.hasOwnProperty('data'))
    {
      let sentencesSplit = split(res.data)
      console.log(sentencesSplit)
      /*let keyedSentencesSplit = Array();
      let i=0;
      sentencesSplit.map((sentence) => {
        sentence.key = i++;
        keyedSentencesSplit.push(sentence)
      })*/
      this.setState({...this.state, sentenceData: sentencesSplit })
    }
    else if (res.hasOwnProperty('error'))
      this.setError(res.error);
    else
      this.setError("Unknown Error : "+JSON.stringify(res));
  }
  
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  loadDocumentContent = async () => {

    const response = await fetch('/load_document?d='+this.props.src);
    console.log('/load_document?d='+this.props.src)
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };
  
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
          type = {item.type}    
          menuItems={this.getMenuItems(item.raw)}      
          text = {item.raw}/>          
        )}
        </div>
     );
  }
}

export default Document;
