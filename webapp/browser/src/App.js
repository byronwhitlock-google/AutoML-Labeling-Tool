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
    documentSrc: 'unlabeled.txt'
  };

  componentDidMount() {
      // Call our fetch function below once the component mounts   
  }
  
  render() {
    return (
      <div className="App">
      <AppHeader/>
      <UserInput value={this.state.documentSrc}/>
      <hr/>
      <blockquote>
      <Document src={this.state.documentSrc}/>
      </blockquote>
     
      </div>
    );
  }
}

export default App;
