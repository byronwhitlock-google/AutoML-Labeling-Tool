
import React, { Component } from 'react';
import SentenceTokenizer from './lib/SentenceTokenizer.js'
import UserConfig from './lib/UserConfig.js'

class SentenceAnnotator extends Component {
    constructor(props) {
      super(props);

     this.tokenizer = new SentenceTokenizer();
     this.userConfig = new UserConfig();
      
    }


    render()
    {
     // console.log("in render "+ this.props.sentenceOffset)
      //console.log(this.props.annotations)
      var text = ""
//      var words = this.props.children.split(/\s/);
     

      // get offsets for each word 
      var words = this.tokenizer.tokenize(this.props.children)
      var wordsColored = []

      // compare to the annotations prop
      for (var idx in words)
      {
        var word = {text: words[idx].text, color:""}
        // remember merged annotions are keyed by GLOBAL start index.
        var checkOffset = words[idx].startOffset+this.props.sentenceOffset
        if (this.props.annotations.hasOwnProperty(checkOffset))
        {
          var annotation = this.props.annotations[checkOffset]
          //console.log("annotation in SA")
          //console.log(annotation)
          if (annotation) // if this is null then no need to highlight since the word hasn't been labeled
          {
            // we need to color this selection based on the title of the annotation
            // the title relates back to the menuitem....
            // we will hard cord the color based on name here but needs to do a lookuop so we can dynamically generate label types other tahn cause remedieaitionetc.
            var menuItem = this.userConfig.getMenuItemByText(annotation.text_extraction.display_name);
            word.color = menuItem.color
          }
          
        }
        //console.log(`idx: ${idx} checkoffset ${checkOffset}`)
        //console.log(this.props.annotations)        
        wordsColored.push(word)
      }

    //console.log("words SA")
  //  console.log(words)

//    console.log("wordsColored SA")
  //  console.log(wordsColored)
//    console.log("Annotations SA")
  //  console.log(this.props.annotations)
      return (
        <span>
          {wordsColored.map((item, key) =>
            <span key={key} style={{
              backgroundColor: item.color, 
              display: 'inline'
            }}>
              {item.text}&nbsp;
            </span>
           )}
        </span>)
    }
}

export default SentenceAnnotator;