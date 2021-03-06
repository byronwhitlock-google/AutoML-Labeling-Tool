
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
import SentenceTokenizer from './lib/SentenceTokenizer.js'
import GlobalConfig from './lib/GlobalConfig.js'
import {ColoredWordSchema} from './lib/Schema.js'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import WordAnnotator from './WordAnnotator.js'
import PredictionApi from './api/PredictionApi.js'

class SentenceAnnotator extends Component {
    constructor(props) {
      super(props);

     this.tokenizer = new SentenceTokenizer();
     this.config = new GlobalConfig(this.props.globalConfigData);
     this.predictionApi = new PredictionApi(this.props.accessToken);
     
     
     // apply confidence numbers to the right click menu for this sentence
     // wordsColored:[{text: "Problem", color:"#ABCDEF", outline:"", label:"",score:0}]


    this.sentenceRef = React.createRef();

    this.handleMouseOver = this.handleMouseOver.bind(this)
    this.handleRightClick = this.handleRightClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.calculateWordLabelMenuItems=this.calculateWordLabelMenuItems.bind(this)

    }

    
    state = {
      mouseX: null,
      mouseY: null,
    };


    selectText(node){
      if (document.body.createTextRange) {
          const range = document.body.createTextRange();
          range.moveToElementText(node);
          range.select();
      } else if (window.getSelection) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(node);
          selection.removeAllRanges();
          selection.addRange(range);
      } else {
          console.warn("Could not select text in node: Unsupported browser.");
      }
    }

    highlightSelection(color) {
        var userSelection = window.getSelection().getRangeAt(0);
        this.highlightRange(userSelection,color);

    }

    highlightRange(range,color) {
        var newNode = document.createElement("span");
        newNode.setAttribute(
          "style",
          `background-color: ${color}; display: inline;`
        );
        range.surroundContents(newNode);
    }

    // we pass the parent node because e is the inner spans
    handleMouseOver(event, parentNode) {
      event.preventDefault();
      this.selectText(parentNode.current)
    }

      // we pass the parent node because e is the inner spans
    handleRightClick(event, parentNode){
      event.preventDefault();    
      this.selectText(parentNode.current)
      this.setState({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
      });
    }
    handleMenuClick(e, menuItem, sentenceId){
      e.preventDefault();
      this.handleClose()
      // make the call async because yeah.
      setTimeout(()=>{this.props.onLabelUpdate(sentenceId,menuItem)},0)
      
    }
    handleClose(){
      this.setState( {
        mouseX: null,
        mouseY: null,
      })
    }

    /*
       
      words: Array(38)
        0: {text: "The", startOffset: 0, endOffset: 3}
        1: {text: "patient", startOffset: 4, endOffset: 11}
        2: {text: "states", startOffset: 12, endOffset: 18}
        3: {text: "she", startOffset: 19, endOffset: 22}
        4: {text: "is", startOffset: 23, endOffset: 25}
    */
    getWordLabelAnnotationColors(words)
    {
      if(!this.props.wordLabelDoc)return[]

      var annotations = this.props.wordLabelDoc.annotations
      if(!annotations || ! annotations.length)return[];
      //console.log("in render "+ this.props.sentenceOffset)
      //console.log(annotations)
      var coloredAnnotations = []
      for (var i = 0; i<words.length ; i++ ) 
      {
        var coloredAnnotation={}
        for (var aIdx in annotations)
        {          
          var annotation = annotations[aIdx]
          if (annotation==null) continue;

          // cleanup camelcase/snake case wtf googs.
          const display_name = annotation.display_name
          const start_offset = annotation.text_extraction.text_segment.start_offset
          const end_offset = annotation.text_extraction.text_segment.end_offset
          var wordStartOffset = words[i].startOffset
          var wordEndOffset = words[i].endOffset

          // so and eo are based on the sentence              
          var so =  start_offset 
          // since we can have a start offset before the beginning of this sentence, if so is negative, set it to zero.
          if (so < wordStartOffset) so = -1;              
          if (so >= wordEndOffset) so = -1;
          
          var eo =  end_offset 
          // since we can have an end offset after the end of this sentence, if eo > sentenceEndOffset, set it to sentenceEndOffset.
          if (eo > wordEndOffset) eo = -1;
          if (eo <= wordStartOffset) eo = -1;

          if (so>0 && eo > 0)
          {            
            //  so and eo ažre bounded by the length of the sentence so no out of range errors.
            //console.log(`${sentenceStartOffset} so ${so} eo ${eo} ${sentenceEndOffset}`)
            var menuItem = this.config.getWordLabelMenuItemByText(display_name);

            coloredAnnotation = {
              color: menuItem.color  ,
              label: display_name           
            }
            break;
          }
        }
        coloredAnnotations.push(coloredAnnotation)
      }
    
      return coloredAnnotations

    }
    getAnnotationColorsInRange( sentenceStartOffset, sentenceEndOffset)
    {
      var annotations = this.props.annotations
      if(!annotations || ! annotations.length)return[];
      //console.log("in render "+ this.props.sentenceOffset)
      //console.log(annotations)
      var coloredAnnotations = []
      for (var aIdx in annotations)
      {
        var annotation = annotations[aIdx]
        if (annotation==null) continue;

        // cleanup camelcase/snake case wtf googs.
        const display_name = annotation.display_name
        const start_offset = annotation.text_extraction.text_segment.start_offset
        const end_offset = annotation.text_extraction.text_segment.end_offset



       // make sure the annotation falls within our current sentence
       // |sentence|
       // [annotation]
       // index: 01234......
       // good  |  [  ] | 
       //       0  1  2 3
 
       // bad [] |  | 
      //      01 2  3

       // bad | | []
       //     0 1 23

       // what about? | [ | ]
       //             0 1 2 3

       // or  [ | ] |
       //     0 1 2 3


        //annotations offsets are based document, but we want based on sentence   
        // so and eo are based on the sentence              
        var so =  start_offset //- sentenceStartOffset
        // since we can have a start offset before the beginning of this sentence, if so is negative, set it to zero.
        if (so < sentenceStartOffset) so = -1;              
        if (so >= sentenceEndOffset) so = -1;
        
        var eo =  end_offset //- sentenceStartOffset
        // since we can have an end offset after the end of this sentence, if eo > sentenceEndOffset, set it to sentenceEndOffset.
        if (eo > sentenceEndOffset) eo = -1;
        if (eo <= sentenceStartOffset) eo = -1;

      //console.log(`${sentenceStartOffset} so ${so} eo ${eo} ${sentenceEndOffset}`)

        if (so>0 && eo > 0)
        {
          //  so and eo ažre bounded by the length of the sentence so no out of range errors.
          //console.log(`${sentenceStartOffset} so ${so} eo ${eo} ${sentenceEndOffset}`)
          var menuItem = this.config.getMenuItemByText(display_name);
        //  words.push(sentence.substr(so- sentenceStartOffset,eo- sentenceStartOffset))
//console.log(`(${so}- ${sentenceStartOffset},${eo}- ${sentenceStartOffset})`)
//console.log(so- sentenceStartOffset,eo- sentenceStartOffset)

          coloredAnnotations.push({
            color: menuItem.color  ,
            label: display_name   ,
            wordLabels: menuItem.wordLabels // this is a hack for now....          
          })
        }
      }
      return coloredAnnotations

    }

/// same as getannotationinrange, but automl returns camelCase or snake_case depending on the API. 
    getPredictionInRange(sentenceStartOffset, sentenceEndOffset)
    {
      /*
      [{
        annotationSpecId: '403464692300775424',
        displayName: 'Cause',
        textExtraction: {
          score: 0.5008653,
          textSegment: { startOffset: '156', endOffset: '158', content: 'of' }
        }],
      */
      
      var annotations = this.props.autoMLPrediction
      if(!annotations || ! annotations.length)return[];
      
      //console.log("in render "+ this.props.sentenceOffset)
      //console.log(annotations)
      
      var coloredAnnotations = []
      for (var aIdx in annotations)
      {
        var annotation = annotations[aIdx]
        if (annotation==null) continue;

        // cleanup camelcase/snake case wtf googs.
        const display_name = annotation.displayName
        const start_offset = annotation.textExtraction.textSegment.startOffset
        const end_offset = annotation.textExtraction.textSegment.endOffset
        const score = annotation.textExtraction.score


       // make sure the annotation falls within our current sentence
       // |sentence|
       // [annotation]
       // index: 01234......
       // good  |  [  ] | 
       //       0  1  2 3
 
       // bad [] |  | 
      //      01 2  3

       // bad | | []
       //     0 1 23

       // what about? | [ | ]
       //             0 1 2 3

       // or  [ | ] |
       //     0 1 2 3


        //annotations offsets are based document, but we want based on sentence   
        // so and eo are based on the sentence              
        var so =  start_offset //- sentenceStartOffset
        // since we can have a start offset before the beginning of this sentence, if so is negative, set it to zero.
        if (so < sentenceStartOffset) so = -1;              
        if (so >= sentenceEndOffset) so = -1;
        
        var eo =  end_offset //- sentenceStartOffset
        // since we can have an end offset after the end of this sentence, if eo > sentenceEndOffset, set it to sentenceEndOffset.
        if (eo > sentenceEndOffset) eo = -1;
        if (eo <= sentenceStartOffset) eo = -1;

      //console.log(`${sentenceStartOffset} so ${so} eo ${eo} ${sentenceEndOffset}`)

        if (so>0 && eo > 0)
        {
          //  so and eo ažre bounded by the length of the sentence so no out of range errors.
          //console.log(`${sentenceStartOffset} so ${so} eo ${eo} ${sentenceEndOffset}`)
          var menuItem = this.config.getMenuItemByText(display_name);
        //  words.push(sentence.substr(so- sentenceStartOffset,eo- sentenceStartOffset))
//console.log(`(${so}- ${sentenceStartOffset},${eo}- ${sentenceStartOffset})`)
//console.log(so- sentenceStartOffset,eo- sentenceStartOffset)

          coloredAnnotations.push({
            color: menuItem.color,
            score: score,
            label: display_name
          })
        }        
      }


      return coloredAnnotations

    }
/**
 * 
 * @param {[string]} words List of words that make up the sentence
 * @param {string} modelId FQ model name for prediction
 * @returns {[{
        annotationSpecId: '403464692300775424',
        displayName: 'Cause',
        textExtraction: {
          score: 0.5008653,
          textSegment: { startOffset: '156', endOffset: '158', content: 'of' }
        }]}
 */
    getWordLabelPrediction(words, modelName)
    {
      var annotations = this.props.autoMLWordLabelPredictions[this.props.sentenceId] 
      if(!annotations || ! annotations.length)return[];
      //console.log("in render "+ this.props.sentenceOffset)
      //console.log(annotations)
      var coloredAnnotations = []
      for (var i = 0; i<words.length ; i++ ) 
      {
        var coloredAnnotation={}
        for (var aIdx in annotations)
        {          
          var annotation = annotations[aIdx]
          if (annotation==null) continue;

          // cleanup camelcase/snake case wtf googs.
          const display_name = annotation.displayName
          const start_offset = annotation.textExtraction.textSegment.startOffset
          const end_offset = annotation.textExtraction.textSegment.endOffset
          const score = annotation.textExtraction.score
          var wordStartOffset = words[i].startOffset
          var wordEndOffset = words[i].endOffset

          // so and eo are based on the sentence              
          var so =  start_offset 
          // since we can have a start offset before the beginning of this sentence, if so is negative, set it to zero.
          if (so < wordStartOffset) so = -1;              
          if (so >= wordEndOffset) so = -1;
          
          var eo =  end_offset 
          // since we can have an end offset after the end of this sentence, if eo > sentenceEndOffset, set it to sentenceEndOffset.
          if (eo > wordEndOffset) eo = -1;
          if (eo <= wordStartOffset) eo = -1;

          if (so>0 && eo > 0)
          {            
            //  so and eo ažre bounded by the length of the sentence so no out of range errors.
            //console.log(`${sentenceStartOffset} so ${so} eo ${eo} ${sentenceEndOffset}`)
            var menuItem = this.config.getWordLabelMenuItemByText(display_name);

            coloredAnnotation = {
              color: menuItem.color,
              score: score,
              label: display_name        
            }
            break;
          }
        }
        coloredAnnotations.push(coloredAnnotation)
      }
    
      return coloredAnnotations
    }
    
    // merges the perdiected words and labeled words into one coloredWords array
    getWordsColored() {
       // go through the annotations and add labels.
      const sentence = this.props.children
      const sentenceStartOffset = this.props.sentenceOffset
      const sentenceEndOffset = sentenceStartOffset + sentence.length
      
      var words = []

      // get offsets for each word 
      var words = this.tokenizer.tokenize(this.props.children)
      /*
      words: Array(38)
        0: {text: "The", startOffset: 0, endOffset: 3}
        1: {text: "patient", startOffset: 4, endOffset: 11}
        2: {text: "states", startOffset: 12, endOffset: 18}
        3: {text: "she", startOffset: 19, endOffset: 22}
        4: {text: "is", startOffset: 23, endOffset: 25}
        */
      var wordsColored = []
      var annotatedColors = this.getAnnotationColorsInRange(sentenceStartOffset,sentenceEndOffset)
      var predictedColors = []      

      var annotatedWordLabelColors = []
      var predictedWordLabelColors = []      
      var wordLabelModelName = ""
      /***********/////////***********/////////***********/////////
      /// this is an ugly hack don't add on or change it. you have been warned.
      if (annotatedColors && annotatedColors.length > 0 && annotatedColors[0].label) // if there is no label, then there will be no word label predictions for this setnence.
      {
        var menuItem = this.config.getMenuItemByText(annotatedColors[0].label);
        if (menuItem &&  menuItem.wordLabelModelName) {
          wordLabelModelName = menuItem.wordLabelModelName
          // a little hack to keep track of what sentences have what labels for later
          this.props.mapLabel(this.props.sentenceId, wordLabelModelName, annotatedColors[0].label,words)
        }
      }
      /***********/////////***********/////////***********/////////

      if (this.props.wordLabelMode) {    
        annotatedWordLabelColors = this.getWordLabelAnnotationColors(words)
        
        if (this.props.autoMLWordLabelPredictions && wordLabelModelName) {
          predictedWordLabelColors = this.getWordLabelPrediction(words, wordLabelModelName)  
        }
      
      } else {
    
        if (this.props.autoMLPrediction) {
          predictedColors = this.getPredictionInRange(sentenceStartOffset,sentenceEndOffset)
        }
      }


      // compare to the annotations prop
      for (var idx in words)
      {
        var word = new ColoredWordSchema({text: words[idx].text, color:"", outline:"", label:"",score:0})
        if (annotatedColors.length > 0)
        {          
          if (annotatedColors.hasOwnProperty(idx)) //should normally match the word array because tokenized with same tokenizer
          {
            word.label = annotatedColors[idx].label
            word.color = annotatedColors[idx].color
            word.isWordLabel = false
            if (this.props.wordLabelMode){
              word.wordLabels = annotatedColors[idx].wordLabels // this is a hack for now.... will need to get actual value, but this will help build the menu 
              // we dont highlight words that don't have configured labels
              if(! word.wordLabels ) {
                  word.color = ''
                  word.label = ''
                  word.outline=''
                  word.score=0
              }
            }
          }   
        }

        if (this.props.wordLabelMode) {                    
          // in word label mode, we  grab annotated words and update colors/labes
          if (annotatedWordLabelColors.length > 0)
          {          
            if (annotatedWordLabelColors[idx].color) //should normally match the word array because tokenized with same tokenizer
            {
              word.label = annotatedWordLabelColors[idx].label
              word.color = annotatedWordLabelColors[idx].color
              word.isWordLabel = true
            }
          }
          if (predictedWordLabelColors.length) {
            if (predictedWordLabelColors[idx].color) 
            {
              //word.color=""
              word.outline = `${predictedWordLabelColors[idx].color} double`
              word.score=predictedWordLabelColors[idx].score
              word.label = predictedWordLabelColors[idx].label 
            
            }
          }
        } else { // ! wordLabelMode 
          // handle sentence based predictions
          if (predictedColors.length > 0)
          {
            if (predictedColors.hasOwnProperty(idx)) 
            {
              word.outline = `${predictedColors[idx].color} double`
              word.score=predictedColors[idx].score
              word.label = predictedColors[idx].label 
            }
          }  
        }
  
        //console.log(`idx: ${idx} checkoffset ${checkOffset}`)
        //console.log(this.props.annotations)        
        
        wordsColored.push(word)
      }
      return wordsColored;
    }


  // wordsColored:[{text: "Problem", color:"#ABCDEF", outline:"", label:"",score:0}]
   calculateMenuItems(wordsColored){
     
      var menuItemList = this.config.getMenuItems()
      var menuItemHash = [];
      var sumScore = [];
      var wordScore=[];
      
      //prepopulate the hash with default menu items
      for (var i =0;i<menuItemList.length;i++){
        var label = menuItemList[i].text
        menuItemHash[label] = menuItemList[i]
      }
      // go through all the colored(labeled) words and create a menuItem list of labels and calulcate hte scores for each item
      for (var i =0;i<wordsColored.length;i++) {
        // words labeled is a list of all words with thier labels. the labels coorespond to menu items.
        var label = wordsColored[i].label;
        var word =  wordsColored[i].text;
        if (!label) {
          continue
        }
        
        //calculate score for confidence
        if (! sumScore[label]) {
          sumScore[label] = 0;
        }
        if (! wordsColored[i].score) {
          wordsColored[i].score = 0
        }
        sumScore[label] += wordsColored[i].score

        
        if (! wordScore[label]) {
          wordScore[label] = {};
        }
        if (! wordScore[label][word]) {
          wordScore[label][word] = 0;
        }
        wordScore[label][word] = (wordsColored[i].score*100).toFixed(2);

        var isWordLabel = wordsColored[i].isWordLabel   
          
        //TODO: Support dynamic menu items colors 
        if (label && ! menuItemHash.hasOwnProperty(label) && !isWordLabel) {          
            // don't add word labels
            // menuitem is key,text,score,color
            menuItemHash[label] = {/*key:label,*/text:label,color:'gray'}
            // update menuitem global with unknown label
            this.props.handleAddMenuItem(menuItemHash[label]) 
          //}
        }
      }
      for (var k in menuItemHash){    
        // we need to update the score of the wordlabels attached.
        if (this.props.wordLabelMode) {
          if (!menuItemHash[k].wordLabels) {
            continue
          }
          
          for (var j=0;j< menuItemHash[k].wordLabels.length;j++){
            
            var wordLabel = menuItemHash[k].wordLabels[j].text
            if( wordScore[wordLabel] ) {
              menuItemHash[k].wordLabels[j].score = wordScore[wordLabel]
            }
          }

        } else {
          if (!sumScore[k]) {
            menuItemHash[k].score = 0 ;
          } else {
            menuItemHash[k].score = (sumScore[k]/wordsColored.length*100).toFixed(2);
          }
        }
      }


      //return deduped array
      var menuItems = []
      for(var i in menuItemHash){
        menuItems.push(menuItemHash[i])
      }      
     return menuItems;
  }

  // wordsColored:[{text: "Problem", color:"#ABCDEF", outline:"", label:"",score:0}]
  calculateWordLabelMenuItems(wordsColored){

    var menuItemList = this.config.getMenuItems()
    var menuItemHash = [];
    var sumScore = [];
    
    //prepopulate the hash with default menu items
    /*for (var i =0;i<menuItemList.length;i++){
      var label = menuItemList[i].text
      menuItemHash[label] = menuItemList[i]
    }*/
    // go through all the colored(labeled) words and create a menuItem list of labels and calulcate hte scores for each item
    for (var i =0;i<wordsColored.length;i++) {
      
      // in word label mode this should only be a single element.      
      var label = wordsColored[i].label;
      if (!label) { // parent label
        continue
      }

      var wordLabels = wordsColored[i].wordLabels
      if (! wordLabels) {
        continue
      }
      //window.alert(JSON.stringify(wordLabels))      
      // add the submenu items to the menu
      for(var j=0;j<wordLabels.length;j++){ // word label
      
        
        var wordLabelText = wordLabels[j].text  
        wordLabels[j].parentLabel = label    
        if (! menuItemHash[label] )  menuItemHash[label] = []
        menuItemHash[label].push(wordLabels[j])

        //calculate score for confidence
        // TODO: calculate score prediction this needs to be grouped by senetence. wordscolored is currently the whole document.
        //TODO: Support dynamic menu items colors 
        if (label && ! menuItemHash.hasOwnProperty(label)) {
          // menuitem is key,text,score,color
          menuItemHash[label] = {/*key:label,*/text:label,color:'gray'}
          // update menuitem global with unknown label
          this.props.handleAddMenuItem(menuItemHash[label])
        }
      }
    }

    //return deduped array
    var menuItems = []
    for(var i in menuItemHash){
      menuItems.push(...menuItemHash[i])
    }      
   return menuItems;
}

     render()
    {
      var hash = require('object-hash');
      var wordsColored = this.getWordsColored();
      var menuItems = null

      menuItems = this.calculateMenuItems(wordsColored)

      

      //console.log(menuItems)
     //console.log("words SA")
     //console.log(words)

    //console.log("wordsColored SA")
    //console.log(wordsColored)
//    console.log("Annotations SA")
  //  console.log(this.props.annotations)

      // if this is wordLabel mode, we don't allow highlighiting (mouseover) of uncolored words
      // since in wordlabel mode, check for the existance of a colored word within the array (that will only be 1 element since in word label mode we label each word)
      var attachMouseEvents = true
      if (this.props.wordLabelMode){
        for(var i=0;i<wordsColored.length;i++){
          if(!wordsColored[i].color) {
            attachMouseEvents=false;
            break;
          }
        }
      }

      return (
        <span
          ref={this.sentenceRef} 
          style={{ cursor: 'context-menu' }} 
          onMouseOver={(e)=>{if (!this.props.wordLabelMode) this.handleMouseOver(e, this.sentenceRef)}}
          onContextMenu={(e)=>{if (!this.props.wordLabelMode) this.handleRightClick(e, this.sentenceRef)}}
        >
          {wordsColored.map((item, key) =>
            <WordAnnotator
              wordId ={key}
              key = {key}
              handleMouseOver = {this.handleMouseOver}
              handleRightClick = {this.handleRightClick}
              calculateWordLabelMenuItems = {this.calculateWordLabelMenuItems}
              attachMouseEvents= {attachMouseEvents}
              coloredWord={item}
              {...this.props}
              />               
           )}
           {!this.props.wordLabelMode && 
              <Menu
                key={hash(menuItems)}
                keepMounted
                open={this.state.mouseY !== null}
                onClose={this.handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                  this.state.mouseY !== null && this.state.mouseX !== null
                    ? { top: this.state.mouseY, left: this.state.mouseX }
                    : undefined
                }
              >
                  {menuItems.map((menuItem) => 
                    <MenuItem 
                    key={hash(menuItem,menuItem.text)} 
                    onClick={(e)=>this.handleMenuClick(e,menuItem,this.props.sentenceId)}>             
                      <span style={{backgroundColor: menuItem.color}}>              
                      &nbsp;{menuItem.text}&nbsp;
                      </span>{menuItem.score? <React.Fragment>({menuItem.score}%)</React.Fragment> : <React.Fragment/>}
                    </MenuItem>                
                  )}            
                  <MenuItem key="none" onClick={(e)=>this.handleMenuClick(e,{text:'None'},this.props.sentenceId)}>             
                    None
                  </MenuItem>
              </Menu>
          }
        </span>
        )
/*
        return ( <Highlighter
                   // highlightClassName="YourHighlightClass"
                    searchWords={words}
                    autoEscape={true}
                    textToHighlight={sentence}
                    activeStyle={{
                      backgroundColor: 'gray', 
                      display: 'inline'
                    }}
        />)*/
    }


}

export default SentenceAnnotator;