//TODO: add different tokenization schemes. currently on "all_words" is supported
//TODO: load user preferences to determine type of sentence tokenizeation schemese

// "Annotation" is the automl annotation block in the json
// tokens are an internal format for ease of use.
class SentenceTokenizer {
  constructor(text) {      
  }
  
  //create lookup for annotations. lookup by global start offset
  // also has a nice side effect of deduping
  mergeAnnotations(a,b){return this.indexAnnotations(a.concat(b))}
  indexAnnotations(annotations)
  {
    var annotationLookup = []

    for(var i in annotations)
    {
      var a =annotations[i]
      /*
      annotations: { 
        "text_extraction": {
         "text_segment": {
            "end_offset": number, "start_offset": number
          }
       } ...
       */
      if (a.hasOwnProperty('text_extraction'))
      {
        var idx = a.text_extraction.text_segment.start_offset
        annotationLookup[idx] = a
      }
      else
      {
        console.error("Empty Annotation Found!")
        console.log(annotations)
        console.log(a)
      }
    }
    return annotationLookup
  }
  // returns automl format
  // global start offset so we get tokens offset from the whole doc not just the sentence
  // title so we know what we selected later
  annotate(globalStartOffset, title, sentence)
  {
    var tokens = this.tokenize(sentence);
    var annotations = [];

    // we need to get the offsets of each word, lets be clever.
    for(var idx in tokens)
    {
      var token = tokens[idx];
      annotations.push({
        text_extraction: {
          text_segment: {
            start_offset: token.startOffset + globalStartOffset,
            end_offset: token.endOffset + globalStartOffset
          },
          display_name: title
        }
      });      
    }
    return annotations
  }
  // turn a sentence into offsets
  tokenize(sentence)
  {
    //console.log("In tokenizer:" +sentence )
    var words = sentence.split(/\s/);

    //console.log("Split into words ")
    //console.log(words)

    var lastPos = 0; // keep track of how far we look through the sentence. this way we correctly tokenize repeated words
    var tokens = []
    
    // we need to get the offsets of each word, lets be clever.
    for(var i=0;i<words.length;i++)
    {
      var word = words[i];
      // find the offset of word in sentence 
      var wordIndex = sentence.indexOf(word,lastPos);

      // make sure we found the correct word
      // a sentence like "a candy and andys candy and" should tokenize properly
      var selectedWord = sentence.substr(wordIndex,word.length)

      if (word !== selectedWord)
      {
        console.log(`Warning, expected ${word} but got ${selectedWord}`)
        continue;
      }

      // start offset within the document        
      var startOffset=wordIndex 

      //end offset within the document.
      var endOffset=wordIndex+word.length

      // update the search las postion
      lastPos = endOffset ;
      
      tokens.push({
          text: word,
          startOffset: startOffset,
          endOffset: endOffset          
      });      
    }
    return tokens
  }

  
} 



/* JSONL automl  should look likee this
{
  "annotations": [
     {
      "text_extraction": {
         "text_segment": {
            "end_offset": number, "start_offset": number
          }
       },
       "display_name": string
     },
     {
       "text_extraction": {
          "text_segment": {
             "end_offset": number, "start_offset": number
           }
        },
        "display_name": string
     },
   ...
  ],
  "text_snippet":
    {"content": string}
}
*/
export default SentenceTokenizer;
