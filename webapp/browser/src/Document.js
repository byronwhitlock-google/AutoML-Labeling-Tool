import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactDOM from 'react-dom';
import AppHeader from './AppHeader.js';
import RenderSentence from './RenderSentence.js'
import {split, Syntax} from "sentence-splitter";


class Document extends Component {
state = {
    data: null,
    sentenceData: Array()
    
  };

  componentDidMount() {
      // Call our fetch function below once the component mounts
    this.loadDocumentContent()
      .then(res=>this.parseDocument(res))
      .catch(err => console.log(err));
  }

  parseDocument(res)
  {
    let sentencesSplit = split(res.data)
    console.log(sentencesSplit)
    this.setState({sentenceData: sentencesSplit })
    //this.setState({ data: res.data })
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
        {this.state.sentenceData.map((item, key) =>
          <RenderSentence
          key ={key}
          type = {item.type}          
          problem_confidence="0" 
          cause_confidence="0" 
          remediation_confidence="0" 
          text = {item.raw}/>
          
        )}
        </div>
     );
  }
}

export default Document;
