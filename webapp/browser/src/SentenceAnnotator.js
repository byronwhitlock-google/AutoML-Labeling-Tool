
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

class SentenceAnnotator extends Component {
    constructor(props) {
      super(props);

     this.tokenizer = new SentenceTokenizer();
     this.config = new GlobalConfig();
      
    }


    getAnnotationColorsInRange(annotations, sentenceStartOffset, sentenceEndOffset)
    {
      console.log("in render "+ this.props.sentenceOffset)
      console.log(annotations)
      var coloredAnnotations = []
      for (var aIdx in annotations)
      {
        var annotation = annotations[aIdx]
        if (annotation==null) continue;

        var start_offset,end_offset,display_name;

        // cleanup camelcase/snake case wtf googs.
        if (annotation['text_extraction']) {
          display_name = annotation.display_name
          start_offset = annotation.text_extraction.text_segment.start_offset
          end_offset = annotation.text_extraction.text_segment.end_offset
        } else {
          display_name = annotation.displayName
          start_offset = annotation.textExtraction.textSegment.startOffset
          end_offset = annotation.textExtraction.textSegment.endOffset
        }


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
            color: menuItem.color                
          })
        }
      }
      return coloredAnnotations

    }

    
    render()
    {
      // go through the annotations and add labels.
      const sentence = this.props.children
      const sentenceStartOffset = this.props.sentenceOffset
      const sentenceEndOffset = sentenceStartOffset + sentence.length
      
      var words = []

      // get offsets for each word 
      var words = this.tokenizer.tokenize(this.props.children)
      var wordsColored = []
      
      var annotatedColors = this.getAnnotationColorsInRange(this.props.annotations, sentenceStartOffset,sentenceEndOffset)
      var predictedColors = []
      if (this.props.autoMLPrediction) {
        predictedColors = this.getAnnotationColorsInRange(this.props.autoMLPrediction, sentenceStartOffset,sentenceEndOffset)
      }

      // compare to the annotations prop
      for (var idx in words)
      {
        var word = {text: words[idx].text, color:"", outline:""}
        //var annotatedColors = this.getAnnotationColorsInRange(words[idx].startOffset,words[idx].endOffset)
        //ugh need to put lookuop or somthing this is bad swe


        if (predictedColors.length > 0)
        {
          if (predictedColors.hasOwnProperty(idx)) 
            word.outline = `${predictedColors[idx].color} double`
         // else
         //   word.outline = 'gray double';//annotatedColors[0].color

          //word.annotatedColors = annotatedColors
        }

        if (annotatedColors.length > 0)
        {
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

     //console.log("words SA")
     //console.log(words)

    //console.log("wordsColored SA")
    //console.log(wordsColored)
//    console.log("Annotations SA")
  //  console.log(this.props.annotations)
      return (
        <span>
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
        </span>)
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