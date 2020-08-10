import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactDOM from 'react-dom';
import AppHeader from './AppHeader.js';
import Document from './Document.js';
import UserInput from './UserInput.js';

class App extends Component {
  state = {
    data: null,
    sentenceData: Array(),
    selectedDocument: 'unlabeled.txt'
  };
  
  constructor(props) {
    super(props);
    // This binding is necessary to make `this` work in the callback
    this.handleDocumentUpdate = this.handleDocumentUpdate.bind(this);
    this.handleInputChanged = this.handleInputChanged.bind(this);    
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
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
  
  render() {
    return (
      <div className="App">
      <AppHeader handleDocumentUpdate={this.handleDocumentUpdate} />
      <UserInput value={this.state.selectedDocument} key={this.state.selectedDocument} onChange={this.handleInputChanged}/>
      <hr/>
      <blockquote>
      <Document src={this.state.selectedDocument} key={this.state.selectedDocument}/>
      </blockquote>
     
      </div>
    );
  }
}

export default App;
