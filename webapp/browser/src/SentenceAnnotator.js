
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
import MouseOverPopover from './MouseOverPopover.js'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

class SentenceAnnotator extends Component {
    constructor(props) {
      super(props);

     this.tokenizer = new SentenceTokenizer();
     this.config = new GlobalConfig();
      
     // apply confidence numbers to the right click menu for this sentence
     // wordsColored:[{text: "Problem", color:"#ABCDEF", outline:"", label:"",score:0}]


    this.sentenceRef = React.createRef();

    this.handleMouseOver = this.handleMouseOver.bind(this)
    this.handleRightClick = this.handleRightClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    //this.state.menuItems = props.menuItems
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
      this.setState({...this.state,
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

    getAnnotationColorsInRange(sentenceStartOffset, sentenceEndOffset)
    {
      var annotations = this.props.annotations
      if(!annotations || ! annotations.length)return[];
      console.log("in render "+ this.props.sentenceOffset)
      console.log(annotations)
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
            label: display_name             
          })
        }
      }
      return coloredAnnotations

    }


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
      
      console.log("in render "+ this.props.sentenceOffset)
      console.log(annotations)
      
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
    // merges the perdiected words and labeled words into one coloredWords array
    getWordsColored() {
       // go through the annotations and add labels.
      const sentence = this.props.children
      const sentenceStartOffset = this.props.sentenceOffset
      const sentenceEndOffset = sentenceStartOffset + sentence.length
      
      var words = []

      // get offsets for each word 
      var words = this.tokenizer.tokenize(this.props.children)
      var wordsColored = []
      
      var annotatedColors = this.getAnnotationColorsInRange(sentenceStartOffset,sentenceEndOffset)
      var predictedColors = []
      if (this.props.autoMLPrediction) {
        predictedColors = this.getPredictionInRange(sentenceStartOffset,sentenceEndOffset)
      }

      // compare to the annotations prop
      for (var idx in words)
      {
        var word = {text: words[idx].text, color:"", outline:"", label:"",score:0}
        //var annotatedColors = this.getAnnotationColorsInRange(words[idx].startOffset,words[idx].endOffset)
        //ugh need to put lookuop or somthing this is bad swe


        if (predictedColors.length > 0)
        {
          if (predictedColors.hasOwnProperty(idx)) 
          {
            word.outline = `${predictedColors[idx].color} double`
            word.score=predictedColors[idx].score
            word.label = predictedColors[idx].label
          }
        }

        if (annotatedColors.length > 0)
        {
          words.label = annotatedColors[idx].display_name
          if (annotatedColors.hasOwnProperty(idx)) //should normally match the word array because tokenized with same tokenizer
            word.color = annotatedColors[idx].color        
          else
            word.color = 'gray';//annotatedColors[0].color
          //word.annotatedColors = annotatedColors
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
      
      //prepopulate the hash with default menu items
      for (var i =0;i<menuItemList.length;i++){
        var label = menuItemList[i].key
        menuItemHash[label] = menuItemList[i]
      }
      // go through all the colored(labeled) words and create a menuItem list of labels and calulcate hte scores for each item
      for (var i =0;i<wordsColored.length;i++) {
        // words labeled is a list of all words with thier labels. the labels coorespond to menu items.
        var label = wordsColored[i].label.toLowerCase();
        
        // remember wordscolored label is the menuitem text.
        if (menuItemHash.hasOwnProperty(label))
        {
          //dedupe by key
          menuItemHash[label].key  = label;
          // to uperrcase
          menuItemHash[label].text  = label.charAt(0).toUpperCase() + label.slice(1)
          if ( wordsColored[i].color ) {
            menuItemHash[label].color  = wordsColored[i].color;
          }
        
          //calculate score for confidence
          if (! sumScore[label]) {
            sumScore[label] = 0;
          }

          if (! wordsColored[i].score) {
            wordsColored[i].score = 0
          }

          sumScore[label] += wordsColored[i].score
        }
      }

      for (var k in menuItemHash){    
        if (!sumScore[k]) {
          menuItemHash[k].score = 0 ;
        } else {
          menuItemHash[k].score = (sumScore[k]/wordsColored.length*100).toFixed(2);
        }
      }


      //return deduped array
      var menuItems = []
      for(var i in menuItemHash){
        menuItems.push(menuItemHash[i])
      }      
     return menuItems;

      //this.setState({...this.state,menuItems: menuItems.values});
      

      /*menuItems:[{
        key: "problem",
        text:"Problem",
        score: 0, //Math.floor(Math.random()*1000)/10
        color: "#F2D7D5"
      }],*/
  }

    render()
    {
     
      var wordsColored = this.getWordsColored();
      var menuItems = this.calculateMenuItems(wordsColored)

      //console.log(menuItems)
     //console.log("words SA")
     //console.log(words)

    //console.log("wordsColored SA")
    //console.log(wordsColored)
//    console.log("Annotations SA")
  //  console.log(this.props.annotations)
      return (
        <span
        ref={this.sentenceRef} 
        ref={this.sentenceRef} 
          style={{ cursor: 'context-menu' }} 
          onMouseOver={(e)=>{this.handleMouseOver(e, this.sentenceRef)}}
          onContextMenu={(e)=>{this.handleRightClick(e, this.sentenceRef)}}
        >
          {wordsColored.map((item, key) =>
            <React.Fragment key={key}>
              
              <span style={{
                outline: item.outline,
                backgroundColor: item.color, 
                display: 'inline'
              }}>
                {item.text}                 
              </span>
              &nbsp;
            </React.Fragment>
           )}
        <Menu
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
              <MenuItem key={menuItem.key} onClick={(e)=>this.handleMenuClick(e,menuItem,this.props.sentenceId)}>             
                <span style={{backgroundColor: menuItem.color}}>              
                &nbsp;{menuItem.text}&nbsp;
                </span>({menuItem.score}%)
              </MenuItem>
                
            )}
            <MenuItem key="none" onClick={(e)=>this.handleMenuClick(e,{text:'None'},this.props.sentenceId)}>             
              None
            </MenuItem>
        </Menu>           
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